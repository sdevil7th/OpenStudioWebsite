import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const vendorScript = read("scripts/vendor-openstudio-ui.mjs");
const shaMatch = vendorScript.match(/OPENSTUDIO_SHA = "([0-9a-f]{40})"/);

const walk = (base, prefix = "") =>
  readdirSync(base).flatMap((name) => {
    const full = new URL(name, base);
    return statSync(full).isDirectory() ? walk(new URL(`${name}/`, base), `${prefix}${name}/`) : [`${prefix}${name}`];
  });

const dawDir = new URL("../src/v2/daw/", import.meta.url);
const vendorDir = new URL("vendor/", dawDir);
const stagesDir = new URL("stages/", dawDir);

/** Files written by hand next to the vendored ones (stubs, docs). */
const HAND_WRITTEN = new Set(["README.md", "nativeBridgeTypes.ts", "parameterWheel.ts", "namCaptureType.ts"]);

test("vendor script pins a full OpenStudio commit", () => {
  assert.ok(shaMatch, "OPENSTUDIO_SHA must be a 40-char commit");
});

test("every vendored OpenStudio file carries its source header at the pinned commit", () => {
  const files = walk(vendorDir).filter((name) => !HAND_WRITTEN.has(name.split("/").pop()));
  assert.ok(files.length >= 8, `expected vendored files, found ${files.length}`);
  for (const name of files) {
    const text = readFileSync(new URL(name, vendorDir), "utf8");
    assert.match(text.slice(0, 400), new RegExp(`Source: OpenStudio frontend/src/.* @ ${shaMatch[1]}`), name);
  }
});

test("no DAW code reaches back into the OpenStudio store, bridge, or Konva", () => {
  // Every Lite fork, every stage, every vendored module — discovered, not listed.
  const sources = walk(dawDir).filter((name) => /\.(ts|tsx)$/.test(name));
  assert.ok(sources.length >= 12, `expected DAW sources, found ${sources.length}`);
  for (const name of sources) {
    const text = readFileSync(new URL(name, dawDir), "utf8");
    assert.doesNotMatch(text, /from "[^"]*(useDAWStore|NativeBridge|\/store\/|zustand|react-konva|classnames)"/, name);
    assert.doesNotMatch(text, /import\.meta\.glob/, name);
  }
});

test("knob atlases are vendored, downscaled, and referenced by public path", () => {
  const assets = read("src/v2/daw/vendor/NAMRackControlAssets.ts");
  for (const variant of ["black", "metal", "cream"]) {
    const path = `public/assets/openstudio/nam/controls/knob-${variant}-atlas.webp`;
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `${path} missing`);
    const size = statSync(new URL(`../${path}`, import.meta.url)).size;
    assert.ok(size < 400_000, `${path} is ${size} bytes; expected the 96 px downscale`);
    assert.ok(assets.includes(`"/assets/openstudio/nam/controls/knob-${variant}-atlas.webp"`), `${variant} public path`);
  }
  assert.doesNotMatch(assets, /import\.meta\.url/);
});

test("Tailwind exposes the OpenStudio daw-* and meter-* tokens", () => {
  const config = read("tailwind.config.ts");
  for (const token of ['dark: "#121212"', 'accent: "#0078d4"', '"text-muted": "#888888"', 'green: "#4caf50"', 'bg: "#0a0a0a"']) {
    assert.ok(config.includes(token), token);
  }
});

test("the Studio Paper hero lazy-loads the live session behind the screenshot poster", () => {
  const home = read("src/v2/pages/V2HomePage.tsx");
  assert.match(home, /lazy\(\(\) => import\("\.\.\/daw\/LiveSession"\)\)/);
  assert.match(home, /<Suspense fallback=\{<img[^>]*src=\{SHOTS\.heroTimeline\}/);
  assert.match(home, /<Frame hero reveal="media-right">/);
  const primitives = read("src/v2/primitives.tsx");
  assert.match(primitives, /sp-frame__live/);
});

test("the stage driver respects reduced motion, pauses off-screen, and loads GSAP late", () => {
  const driver = read("src/v2/daw/stage/useStageTimeline.ts");
  assert.match(driver, /usePrefersReducedMotion/);
  assert.match(driver, /spec\.static\(\)/);
  assert.match(driver, /IntersectionObserver/);
  assert.match(driver, /visibilitychange/);
  assert.match(driver, /loadGsap\(\)/);
  assert.match(driver, /scheduleAfterInitialLoad/);
  assert.match(driver, /registerStage/);
  assert.match(read("src/v2/daw/useSessionTimeline.ts"), /from "\.\/stage\/useStageTimeline"/);
  assert.match(read("src/v2/daw/stage/StageFrame.tsx"), /daw-session--showcase/);
  assert.match(read("src/styles/daw.css"), /\.daw-session--showcase \.daw-session__stage \{\s*pointer-events: none;/);
});

test("every stage is a default export backed by a script that exports its SPEC", () => {
  if (!existsSync(stagesDir)) return;
  const stages = readdirSync(stagesDir).filter((name) => /Stage\.tsx$/.test(name));
  for (const name of stages) {
    const text = readFileSync(new URL(name, stagesDir), "utf8");
    assert.match(text, /export default /, `${name} must default-export for React.lazy`);
    assert.match(text, /useStageTimeline|useSessionTimeline/, `${name} must run on the shared driver`);
    assert.match(text, /<StageFrame/, `${name} must render inside StageFrame`);
    const script = name.replace(/Stage\.tsx$/, (m) => m.replace("Stage.tsx", "Script.ts"));
    const scriptName = script.charAt(0).toLowerCase() + script.slice(1);
    assert.ok(existsSync(new URL(scriptName, stagesDir)), `${scriptName} missing for ${name}`);
    assert.match(readFileSync(new URL(scriptName, stagesDir), "utf8"), /export const SPEC/, `${scriptName} must export SPEC`);
  }
});

test("LiveStage gates every stage chunk on the initial load and the viewport", () => {
  const path = "src/v2/daw/stage/LiveStage.tsx";
  if (!existsSync(new URL(`../${path}`, import.meta.url))) return;
  const live = read(path);
  assert.match(live, /scheduleAfterInitialLoad/);
  assert.match(live, /IntersectionObserver/);
  assert.match(live, /Suspense/);
  assert.match(live, /lazy\(/);
  for (const [, id, file] of live.matchAll(/"([a-z-]+)":\s*\(\) => import\("\.\.\/stages\/(\w+)"\)/g)) {
    assert.ok(existsSync(new URL(`${file}.tsx`, stagesDir)), `stage "${id}" points at missing ${file}.tsx`);
  }
});

test("the build keeps the shared DAW code in one chunk", () => {
  assert.match(read("vite.config.ts"), /"daw-core"/);
});
