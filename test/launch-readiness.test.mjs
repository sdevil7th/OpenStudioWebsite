import test from "node:test";
import assert from "node:assert/strict";

import { validateLaunchReadiness } from "../scripts/validate-launch-readiness.mjs";

test("launch readiness checks pass for live website sources", async () => {
  await assert.doesNotReject(() => validateLaunchReadiness());
});
