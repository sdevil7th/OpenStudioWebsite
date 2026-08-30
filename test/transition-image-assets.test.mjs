import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  candidateWidthsForAsset,
  selectVariantWidths,
} from "../scripts/generate-image-assets.mjs";

const generatorSource = readFileSync(
  new URL("../scripts/generate-image-assets.mjs", import.meta.url),
  "utf8",
);

test("feature-story transitions stop at the largest useful mobile width", () => {
  const transitionWidths = candidateWidthsForAsset(
    "/assets/openstudio/feature-story/transitions/mixer-arrival-matte.png",
  );

  assert.deepEqual(transitionWidths, [320, 480, 640, 768, 960]);
  assert.deepEqual(selectVariantWidths(transitionWidths, 1600), transitionWidths);
});

test("the transition cap leaves standard and high-resolution blog widths intact", () => {
  assert.deepEqual(
    candidateWidthsForAsset("/assets/openstudio/feature-story/mixer-console.webp"),
    [320, 480, 640, 768, 960, 1280, 1600],
  );
  assert.deepEqual(
    candidateWidthsForAsset("/assets/blogs/an-ordinary-blog-image.webp"),
    [320, 480, 640, 768, 960, 1280, 1600],
  );
  assert.deepEqual(
    candidateWidthsForAsset("/assets/blogs/building-openstudio-nam-rack.webp"),
    [320, 480, 640, 768, 960, 1280, 1600, 1920, 2560, 3200, 3360],
  );
});

test("the transition match is directory-bound and used by the generator", () => {
  assert.deepEqual(
    candidateWidthsForAsset(
      "/assets/openstudio/feature-story/transitions-archive/mask.png",
    ),
    [320, 480, 640, 768, 960, 1280, 1600],
  );
  assert.match(
    generatorSource,
    /candidateWidthsForAsset\(sourcePublicPathFor\(sourcePath\)\)/,
  );
});
