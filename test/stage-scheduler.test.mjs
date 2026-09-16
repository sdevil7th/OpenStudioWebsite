import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../src/features/daw-preview/stage/stageScheduler.ts", import.meta.url), "utf8")
    .replace("import.meta.env.DEV", "false"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;

test("fractional clipping cannot starve the current NAM row of its two playback slots", () => {
  const scheduler = {};
  runInNewContext(source, { exports: scheduler });
  // Production phone measurements: amp/cab are effectively fully visible,
  // but a subpixel clip gives them 0.99865 while the following row gets 1.
  const entries = [0.37, 0.37, 0.998655915, 0.998655915, 1, 1].map((ratio) => ({
    ratio: 0, priority: 0, onAllowed() {}, measuredRatio: ratio,
  }));
  const unregister = entries.map(scheduler.registerStage);
  entries.forEach((entry) => scheduler.updateStageRatio(entry, entry.measuredRatio));
  assert.deepEqual(entries.map(scheduler.isStageAllowed), [false, false, true, true, false, false]);
  scheduler.updateStageRatio(entries[2], 0.38);
  scheduler.updateStageRatio(entries[3], 0.38);
  assert.deepEqual(entries.map(scheduler.isStageAllowed), [false, false, false, false, true, true]);
  unregister.forEach((remove) => remove());
  assert.ok(entries.every((entry) => !scheduler.isStageAllowed(entry)));
});

test("visible heroes retain priority; offscreen heroes free their playback slot", () => {
  const scheduler = {};
  runInNewContext(source, { exports: scheduler });
  const entries = [0, 0, 1].map((priority) => ({ ratio: 0, priority, onAllowed() {} }));
  entries.forEach(scheduler.registerStage);
  entries.forEach((entry) => scheduler.updateStageRatio(entry, 1));
  assert.deepEqual(entries.map(scheduler.isStageAllowed), [true, false, true]);
  scheduler.updateStageRatio(entries[2], 0);
  assert.deepEqual(entries.map(scheduler.isStageAllowed), [true, true, false]);
});
