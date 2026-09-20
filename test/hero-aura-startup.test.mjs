import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../src/features/hero-aura/startup.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;

function harness() {
  let id = 0;
  const frames = new Map();
  const idle = new Map();
  const window = Object.assign(new EventTarget(), {
    __openstudioAppReady: false, __openstudioIntroHidden: false,
    requestAnimationFrame: callback => { frames.set(++id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    requestIdleCallback: callback => { idle.set(++id, callback); return id; },
    cancelIdleCallback: id => idle.delete(id),
  });
  const exports = {};
  runInNewContext(source, { window, exports });
  return {
    window, frames, idle, schedule: exports.afterHeroPageReady,
    emit: name => window.dispatchEvent(new Event(name)),
    flush(queue) {
      for (const [key, callback] of [...queue]) { queue.delete(key); callback(); }
    },
    ready() {
      window.__openstudioAppReady = window.__openstudioIntroHidden = true;
      window.dispatchEvent(new Event("openstudio:app-ready"));
      window.dispatchEvent(new Event("openstudio:intro-hidden"));
    },
  };
}

test("Aura waits for both page signals, then starts without input or a quiet timer", () => {
  for (const first of ["app", "intro"]) {
    const h = harness();
    let calls = 0;
    h.schedule(() => calls++);
    h.window[first === "app" ? "__openstudioAppReady" : "__openstudioIntroHidden"] = true;
    h.emit(first === "app" ? "openstudio:app-ready" : "openstudio:intro-hidden");
    h.emit("pointerdown");
    assert.equal(h.frames.size, 0, "one signal or input cannot bypass readiness");
    h.ready();
    h.flush(h.frames);
    h.flush(h.frames);
    assert.equal(calls, 0);
    h.flush(h.idle);
    h.ready();
    assert.equal(calls, 1);
    assert.equal(h.frames.size, 0);
  }
});

test("an already-ready client route starts without another event or an idle API", () => {
  const h = harness();
  h.ready();
  delete h.window.requestIdleCallback;
  let calls = 0;
  h.schedule(() => calls++);
  h.flush(h.frames);
  assert.equal(calls, 0, "allow the newly mounted hero to paint");
  h.flush(h.frames);
  assert.equal(calls, 1);
});

test("unmount or reduced motion cancels every pending startup phase", () => {
  for (const phase of ["signals", "first-frame", "second-frame", "idle"]) {
    const h = harness();
    let calls = 0;
    const cancel = h.schedule(() => calls++);
    if (phase !== "signals") h.ready();
    if (phase === "second-frame" || phase === "idle") h.flush(h.frames);
    if (phase === "idle") h.flush(h.frames);
    cancel();
    h.ready();
    h.flush(h.frames); h.flush(h.frames); h.flush(h.idle);
    assert.equal(calls, 0, phase);
    assert.equal(h.frames.size + h.idle.size, 0, phase);
  }
});
