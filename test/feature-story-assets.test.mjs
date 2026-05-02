import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = readFileSync(new URL("../src/data/features.ts", import.meta.url), "utf8");
const chapters = ["arrangement", "midi", "mixer", "engine", "automation"];

const chapterBlock = (chapter) => {
  const start = source.indexOf(`  ${chapter}: {`, source.indexOf("const curatedFeatureAssets"));
  assert.notEqual(start, -1, `Missing curated assets for ${chapter}`);
  const nextStart = chapters
    .map((candidate) => source.indexOf(`  ${candidate}: {`, start + 1))
    .filter((index) => index > start)
    .sort((a, b) => a - b)[0];
  return source.slice(start, nextStart === undefined ? source.indexOf("};", start) : nextStart);
};

test("feature story uses unique real screenshot role assets for every chapter", () => {
  assert.ok(!source.includes("/curated-v2/"), "feature story must not reference generated curated-v2 assets");

  chapters.forEach((chapter) => {
    const block = chapterBlock(chapter);
    const roleSources = [...block.matchAll(/screenshots\.([A-Za-z0-9]+)/g)].map((match) => match[1]);

    assert.equal(roleSources.length, 4, `${chapter} should define hero, motion, detail, and matte assets`);
    assert.equal(new Set(roleSources).size, 4, `${chapter} should not reuse one source across roles`);
    assert.ok(
      roleSources.every((src) => !src.toLowerCase().includes("curated")),
      `${chapter} should use real OpenStudio screenshots or existing feature-story crops`,
    );
  });
});
