import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../src/components/BrandLoader.tsx", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;

function harness(reducedMotion = false) {
  let now = 0;
  let nextId = 0;
  let cleanup;
  const timers = new Map();
  const visible = new Set();
  const makeSurface = () => ({ dataset: {}, remove() { visible.delete(this); } });
  class Template {
    content = { firstElementChild: { cloneNode: makeSurface } };
  }
  const exports = {};
  runInNewContext(source, {
    exports,
    require: () => ({ useLayoutEffect: (effect) => { cleanup = effect(); } }),
    HTMLTemplateElement: Template,
    performance: { now: () => now },
    document: {
      getElementById: () => new Template(),
      body: { appendChild: (node) => visible.add(node) },
    },
    window: {
      matchMedia: () => ({ matches: reducedMotion }),
      setTimeout: (callback, delay) => {
        const id = ++nextId;
        timers.set(id, { callback, at: now + delay });
        return id;
      },
      clearTimeout: (id) => timers.delete(id),
    },
  });
  return {
    visible,
    mount() { exports.default(); return cleanup; },
    advance(duration) {
      const target = now + duration;
      while (true) {
        const next = [...timers].filter(([, value]) => value.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].callback();
      }
      now = target;
    },
  };
}

test("nested route fallbacks share a loader and complete the entrance before removal", () => {
  const h = harness();
  const stopOuter = h.mount();
  const stopInner = h.mount();
  assert.equal(h.visible.size, 1);
  stopOuter();
  h.advance(100);
  assert.equal(h.visible.size, 1);
  stopInner();
  h.advance(699);
  assert.equal([...h.visible][0].dataset.openstudioLoaderState, "loading");
  h.advance(1);
  assert.equal([...h.visible][0].dataset.openstudioLoaderState, "leaving");
  h.advance(360);
  assert.equal(h.visible.size, 0);
});

test("a new fallback cancels an in-flight exit without duplicating the loader", () => {
  const h = harness();
  h.mount()();
  h.advance(850);
  const stop = h.mount();
  h.advance(500);
  assert.equal(h.visible.size, 1);
  assert.equal([...h.visible][0].dataset.openstudioLoaderState, "loading");
  stop();
  h.advance(360);
  assert.equal(h.visible.size, 0);
});

test("reduced motion skips the entrance delay", () => {
  const h = harness(true);
  h.mount()();
  h.advance(160);
  assert.equal(h.visible.size, 0);
});
