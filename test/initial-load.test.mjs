import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../src/lib/initialLoad.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;

function harness({ ready = true, introHidden = false, initialLoader = true, routeLoader = false } = {}) {
  let nextId = 0;
  const timers = new Map();
  const idleCallbacks = new Map();
  const window = Object.assign(new EventTarget(), {
    __openstudioAppReady: ready,
    __openstudioIntroHidden: introHidden,
    setTimeout(callback, delay) {
      const id = ++nextId;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    requestIdleCallback(callback, options) {
      const id = ++nextId;
      idleCallbacks.set(id, { callback, timeout: options.timeout });
      return id;
    },
    cancelIdleCallback: (id) => idleCallbacks.delete(id),
  });
  const exports = {};
  runInNewContext(source, {
    exports,
    window,
    document: {
      getElementById: (id) => id === "openstudio-instant-loader" && initialLoader ? {} : null,
      querySelector: () => initialLoader || routeLoader ? {} : null,
    },
  });
  return {
    window, timers, idleCallbacks,
    schedule: exports.scheduleAfterInitialLoad,
    emit: (name) => window.dispatchEvent(new Event(name)),
    flush(queue) {
      for (const [id, { callback }] of [...queue]) {
        queue.delete(id);
        callback();
      }
    },
  };
}

test("initial work waits for app readiness and the initial intro, then runs once at idle", () => {
  const h = harness({ ready: false });
  let calls = 0;
  h.schedule(() => calls++, { delay: 400, timeout: 2000 });
  assert.equal(h.timers.size, 0);
  h.emit("openstudio:app-ready");
  assert.equal(h.timers.size, 0);
  h.emit("openstudio:intro-hidden");
  assert.equal([...h.timers.values()][0].delay, 400);
  h.flush(h.timers);
  assert.equal(calls, 0);
  assert.equal([...h.idleCallbacks.values()][0].timeout, 2000);
  h.flush(h.idleCallbacks);
  h.emit("pointerdown");
  assert.equal(calls, 1);
});

for (const ready of [true, false]) {
  test(`a route loader cannot strand work after the initial intro (app ready: ${ready})`, () => {
    const h = harness({ ready, introHidden: true, initialLoader: false, routeLoader: true });
    let calls = 0;
    h.schedule(() => calls++);
    if (!ready) h.emit("openstudio:app-ready");
    h.flush(h.timers);
    h.flush(h.idleCallbacks);
    assert.equal(calls, 1, "no second intro-hidden event is needed");
  });
}

test("a page without the initial loader does not wait for an intro event", () => {
  const h = harness({ initialLoader: false, routeLoader: true });
  let calls = 0;
  h.schedule(() => calls++);
  h.emit("keydown");
  h.flush(h.timers);
  h.flush(h.idleCallbacks);
  assert.equal(calls, 1);
});

test("cancellation removes pending readiness, input, timer and idle callbacks", () => {
  for (const phase of ["app", "intro", "delay", "idle"]) {
    const h = harness({ ready: false });
    let calls = 0;
    const cancel = h.schedule(() => calls++);
    if (phase !== "app") h.emit("openstudio:app-ready");
    if (phase === "delay" || phase === "idle") h.emit("openstudio:intro-hidden");
    if (phase === "idle") h.flush(h.timers);
    cancel();
    h.emit("openstudio:app-ready");
    h.emit("openstudio:intro-hidden");
    h.emit("pointerdown");
    h.flush(h.timers);
    h.flush(h.idleCallbacks);
    assert.equal(calls, 0, phase);
    assert.equal(h.timers.size + h.idleCallbacks.size, 0, phase);
  }
});

test("input-disabled work keeps the timer fallback when idle callbacks are unavailable", () => {
  const h = harness({ initialLoader: false });
  delete h.window.requestIdleCallback;
  let calls = 0;
  h.schedule(() => calls++, { runOnInput: false, timeout: 2000 });
  h.emit("pointerdown");
  assert.equal(calls, 0);
  h.flush(h.timers);
  assert.equal([...h.timers.values()][0].delay, 1400);
  assert.equal(calls, 0);
  h.flush(h.timers);
  assert.equal(calls, 1);
});
