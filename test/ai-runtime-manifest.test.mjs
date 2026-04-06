import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateAiRuntimeMetadata } from "../scripts/ai-runtime-metadata.mjs";
import { parseAiRuntimeManifest } from "../shared/ai-runtime-manifest.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readFixture = async (name) => {
  const fixturePath = path.join(__dirname, "fixtures", "ai-runtime", `${name}.json`);
  return JSON.parse(await fs.readFile(fixturePath, "utf8"));
};

test("accepts a legacy flat Windows runtime manifest", async () => {
  const manifest = await readFixture("legacy-flat-windows");

  assert.doesNotThrow(() => validateAiRuntimeMetadata(manifest, "legacy-flat-windows.json"));

  const parsed = parseAiRuntimeManifest(manifest, "legacy-flat-windows.json");
  assert.equal(parsed.platforms.windows.legacy?.fileName, "OpenStudio-AI-Runtime-windows-x64.zip");
  assert.equal(parsed.platforms.windows.backends.cuda, null);
  assert.equal(parsed.platforms.windows.backends.directml, null);
});

test("accepts nested Windows backends with macOS arm64", async () => {
  const manifest = await readFixture("nested-windows-backends");

  assert.doesNotThrow(() => validateAiRuntimeMetadata(manifest, "nested-windows-backends.json"));

  const parsed = parseAiRuntimeManifest(manifest, "nested-windows-backends.json");
  assert.equal(parsed.platforms.windows.legacy, null);
  assert.equal(parsed.platforms.windows.backends.cuda?.fileName, "OpenStudio-AI-Runtime-windows-cuda.zip");
  assert.equal(
    parsed.platforms.windows.backends.directml?.fileName,
    "OpenStudio-AI-Runtime-windows-directml.zip",
  );
  assert.equal(parsed.platforms.macos.arm64?.fileName, "OpenStudio-AI-Runtime-macos-arm64.zip");
});

test("accepts a mixed transition manifest with legacy and nested Windows entries", async () => {
  const manifest = await readFixture("mixed-transition-manifest");

  assert.doesNotThrow(() => validateAiRuntimeMetadata(manifest, "mixed-transition-manifest.json"));

  const parsed = parseAiRuntimeManifest(manifest, "mixed-transition-manifest.json");
  assert.equal(parsed.platforms.windows.legacy?.fileName, "OpenStudio-AI-Runtime-windows-x64.zip");
  assert.equal(parsed.platforms.windows.backends.cuda?.fileName, "OpenStudio-AI-Runtime-windows-cuda.zip");
  assert.equal(
    parsed.platforms.windows.backends.directml?.fileName,
    "OpenStudio-AI-Runtime-windows-directml.zip",
  );
});
