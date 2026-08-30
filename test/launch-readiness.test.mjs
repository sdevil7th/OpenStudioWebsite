import test from "node:test";
import assert from "node:assert/strict";

import {
  collectAssetReferences,
  validateLaunchReadiness,
} from "../scripts/validate-launch-readiness.mjs";

test("asset references exclude TypeScript string escape characters", () => {
  const generatedSource = String.raw`const articleHtml = "<img src=\"/assets/blogs/nam-rack.webp?v=123\"/>";`;

  assert.deepEqual(
    collectAssetReferences(generatedSource),
    ["/assets/blogs/nam-rack.webp"],
  );
});

test("launch readiness checks pass for live website sources", async () => {
  await assert.doesNotReject(() => validateLaunchReadiness());
});
