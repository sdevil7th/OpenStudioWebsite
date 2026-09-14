import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

const HOOK = "src/v2/useSpReveal.ts";
const CSS = "src/styles/v2.css";
const PAGES_DIR = "src/v2/pages";

const pageFiles = fs
  .readdirSync(PAGES_DIR)
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => path.join(PAGES_DIR, file));

const variants = () => {
  const union = read(HOOK).match(/export type SpReveal =([\s\S]*?);/);
  assert.ok(union, "useSpReveal.ts must export an SpReveal union");
  return new Set([...union[1].matchAll(/"([a-z-]+)"/g)].map((match) => match[1]));
};

// A reveal starts its element at opacity 0, so a variant the CSS does not know
// about leaves that section invisible forever rather than failing loudly.
test("every reveal variant used in v2 is a member of the SpReveal union", () => {
  const known = variants();
  assert.ok(known.size > 0, "SpReveal union parsed as empty");

  for (const file of [...pageFiles, "src/v2/primitives.tsx", "src/v2/V2Shell.tsx"]) {
    const source = read(file);

    // Capture the whole attribute value so an expression form — the row Frames
    // pass `reveal={row.imageFirst ? "media-left" : "media-right"}` — is checked
    // too, not just the plain string literal form.
    for (const [, value] of source.matchAll(/(?:data-sp-)?reveal=("[^"]*"|\{[^}]*\})/g)) {
      for (const [, used] of value.matchAll(/"([^"]+)"/g)) {
        assert.ok(known.has(used), `${file} uses unknown reveal variant "${used}"`);
      }
    }
  }
});

test("v2.css defines a hidden and a revealed rule for every variant", () => {
  const css = read(CSS);

  for (const variant of variants()) {
    assert.match(
      css,
      new RegExp(`\\[data-sp-reveal="${variant}"\\]`),
      `v2.css has no rule for the "${variant}" variant`,
    );
  }

  assert.match(css, /data-sp-in\]/, "v2.css must define the revealed state");
  assert.match(css, /@keyframes sp-reveal/, "v2.css must define the sp-reveal keyframes");
});

test("the reveal hidden state is gated on prefers-reduced-motion: no-preference", () => {
  const css = read(CSS);
  const gated = css.split("@media (prefers-reduced-motion: no-preference)")[1] ?? "";

  // Gating the hidden state (rather than undoing it under `reduce`) is what
  // guarantees a reduced-motion visitor can never be shown a blank section.
  assert.match(gated, /opacity:\s*0/, "the hidden state must live inside the no-preference block");
  assert.doesNotMatch(
    css.split("@media (prefers-reduced-motion: no-preference)")[0],
    /\[data-sp-reveal[^\]]*\][^{]*\{[^}]*opacity:\s*0/,
    "no reveal rule may set opacity: 0 outside the no-preference gate",
  );
});

test("every v2 page calls useSpReveal", () => {
  for (const file of pageFiles) {
    const source = read(file);
    assert.match(source, /useSpReveal\(\)/, `${file} does not call useSpReveal()`);
    assert.match(source, /from "\.\.\/useSpReveal"/, `${file} does not import useSpReveal`);
  }
});

test("the reveal hook survives a background tab", () => {
  const hook = read(HOOK);

  // requestAnimationFrame never fires in a hidden tab, so a rAF-only hook would
  // leave the page at opacity 0 until it is focused.
  assert.match(hook, /requestAnimationFrame\(classify\)/, "classification must be frame-aligned");
  assert.match(hook, /setTimeout\(classify/, "classification needs a timer fallback for hidden tabs");
  assert.match(hook, /getPrefersReducedMotion\(\)/, "the hook must fail open under reduced motion");
  assert.match(hook, /self\.unobserve\(entry\.target\)/, "reveals must happen once and unobserve");
});

test("the reveal never declares a transition, which would retime the hover lift", () => {
  const css = read(CSS);
  const reveal = css.slice(css.indexOf("/* ---------- scroll reveal"), css.indexOf("/* ---------- reduced motion"));

  // .sp-card / .sp-btn own `transition`, and reveal targets are often one of
  // them (CTA buttons are stagger children). Two rules cannot both contribute to
  // a transition list, so the reveal runs as an animation instead.
  assert.doesNotMatch(reveal, /^\s*transition:/m, "the reveal block must not declare `transition`");
  assert.match(reveal, /animation: sp-reveal/, "the reveal must be driven by an animation");
});
