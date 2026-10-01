import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(readFileSync(new URL("../src/features/daw-preview/stage/meterPlayback.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

function harness() {
  let time = 0, id = 0;
  const frames = new Map(), observers = {};
  const document = Object.assign(new EventTarget(), { visibilityState: "visible" });
  const motion = Object.assign(new EventTarget(), { matches: false });
  const stage = { dataset: { stagePlaying: "true" } };
  const canvas = { closest: () => stage };
  const observer = name => class {
    constructor(callback) { observers[name] = callback; }
    observe() {}
    disconnect() { delete observers[name]; }
  };
  const window = {
    matchMedia: () => motion,
    IntersectionObserver: true,
  };
  const exports = {};
  runInNewContext(source, {
    exports, window, document, performance: { now: () => time },
    requestAnimationFrame: callback => { const key = ++id; frames.set(key, callback); return key; },
    cancelAnimationFrame: key => frames.delete(key),
    IntersectionObserver: observer("intersection"), MutationObserver: observer("stage"), ResizeObserver: observer("resize"),
  });
  const draws = [];
  const dispose = exports.startMeterPlayback(canvas, t => draws.push(t));
  const visible = value => observers.intersection([{ target: canvas, isIntersecting: value }]);
  return {
    draws, dispose, document, motion, frames, stage, observers, visible,
    advance(ms, hz = 240) {
      const end = time + ms;
      while (time < end) {
        time = Math.min(end, time + 1000 / hz);
        for (const [key, callback] of [...frames]) { frames.delete(key); callback(time); }
      }
    },
  };
}

test("pausing cancels pending wake-ups and excludes hidden time from peak decay", () => {
  const h = harness(); h.visible(true); h.advance(100);
  const count = h.draws.length, last = h.draws.at(-1);
  h.visible(false); h.advance(5000);
  assert.equal(h.draws.length, count);
  assert.equal(h.frames.size, 0);
  h.visible(true); h.advance(1000 / 240);
  assert.equal(h.draws.at(-1), last + 50, "resume doesn't include the hidden five seconds");
  h.document.visibilityState = "hidden"; h.document.dispatchEvent(new Event("visibilitychange"));
  h.advance(1000);
  assert.equal(h.draws.length, count + 1);
  h.dispose();
});

test("reduced motion and a stopped stage paint one rest frame, including resize", () => {
  for (const reason of ["motion", "stage"]) {
    const h = harness(); h.visible(true); h.advance(100);
    if (reason === "motion") { h.motion.matches = true; h.motion.dispatchEvent(new Event("change")); }
    else { h.stage.dataset.stagePlaying = "false"; h.observers.stage(); }
    const before = h.draws.length; h.advance(1000);
    assert.equal(h.draws.length, before + 1);
    assert.equal(h.frames.size, 0);
    h.observers.resize(); h.advance(100);
    assert.equal(h.draws.length, before + 2);
    h.dispose(); h.advance(1000);
    assert.equal(h.draws.length, before + 2);
  }
});
