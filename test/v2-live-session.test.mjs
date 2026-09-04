import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const vendorScript = read("scripts/vendor-openstudio-ui.mjs");
const shaMatch = vendorScript.match(/OPENSTUDIO_SHA = "([0-9a-f]{40})"/);

test("vendor script pins a full OpenStudio commit", () => {
  assert.ok(shaMatch, "OPENSTUDIO_SHA must be a 40-char commit");
});

test("every vendored OpenStudio file carries its source header at the pinned commit", () => {
  const dir = new URL("../src/v2/daw/vendor/", import.meta.url);
  const handWritten = new Set(["README.md", "nativeBridgeTypes.ts", "parameterWheel.ts"]);
  const walk = (base, prefix = "") =>
    readdirSync(base).flatMap((name) => {
      const full = new URL(name, base);
      return statSync(full).isDirectory() ? walk(new URL(`${name}/`, base), `${prefix}${name}/`) : [`${prefix}${name}`];
    });
  const files = walk(dir).filter((name) => !handWritten.has(name.split("/").pop()));
  assert.ok(files.length >= 8, `expected vendored files, found ${files.length}`);
  for (const name of files) {
    const text = readFileSync(new URL(name, dir), "utf8");
    assert.match(text.slice(0, 400), new RegExp(`Source: OpenStudio frontend/src/.* @ ${shaMatch[1]}`), name);
  }
});

test("vendored files never reach back into the OpenStudio store or bridge", () => {
  const dir = new URL("../src/v2/daw/", import.meta.url);
  const sources = ["vendor/NAMRackKnob.tsx", "vendor/stubs/builtInParamValue.ts", "ChannelStripLite.tsx", "TransportLite.tsx"];
  for (const name of sources) {
    const text = readFileSync(new URL(name, dir), "utf8");
    assert.doesNotMatch(text, /from "[^"]*(useDAWStore|NativeBridge|\/store\/|zustand|react-konva|classnames)"/, name);
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

test("the session driver respects reduced motion and pauses off-screen", () => {
  const driver = read("src/v2/daw/useSessionTimeline.ts");
  assert.match(driver, /usePrefersReducedMotion/);
  assert.match(driver, /staticState\(\)/);
  assert.match(driver, /IntersectionObserver/);
  assert.match(driver, /visibilitychange/);
  assert.match(driver, /loadGsap\(\)/);
  assert.match(driver, /scheduleAfterInitialLoad/);
  const live = read("src/v2/daw/LiveSession.tsx");
  assert.match(live, /daw-session--showcase/);
  assert.match(read("src/styles/daw.css"), /\.daw-session--showcase \.daw-session__stage \{\s*pointer-events: none;/);
});
