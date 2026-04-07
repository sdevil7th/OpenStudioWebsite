import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stageAiRuntimeMetadata, validateAiRuntimeMetadata } from "../scripts/ai-runtime-metadata.mjs";
import {
  isAiRuntimeBackendInstallPlanEntry,
  isAiRuntimeDownloadableAssetEntry,
  parseAiRuntimeManifest,
  resolveAiRuntimeDownloadUrl,
} from "../shared/ai-runtime-manifest.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readFixture = async (name) => {
  const fixturePath = path.join(__dirname, "fixtures", "ai-runtime", `${name}.json`);
  return JSON.parse(await fs.readFile(fixturePath, "utf8"));
};

const readFixtureText = async (name) => {
  const fixturePath = path.join(__dirname, "fixtures", "ai-runtime", `${name}.json`);
  return fs.readFile(fixturePath, "utf8");
};

test("accepts a legacy flat Windows runtime manifest", async () => {
  const manifest = await readFixture("legacy-flat-windows");

  assert.doesNotThrow(() => validateAiRuntimeMetadata(manifest, "legacy-flat-windows.json"));

  const parsed = parseAiRuntimeManifest(manifest, "legacy-flat-windows.json");
  assert.equal(parsed.platforms.windows.base, null);
  assert.equal(parsed.platforms.windows.legacy?.fileName, "OpenStudio-AI-Runtime-windows-x64.zip");
  assert.equal(parsed.platforms.windows.backends.cuda, null);
  assert.equal(parsed.platforms.windows.backends.directml, null);
  assert.equal(
    resolveAiRuntimeDownloadUrl(parsed, "windows"),
    "https://example.com/OpenStudio-AI-Runtime-windows-x64.zip",
  );
});

test("accepts nested Windows backends with macOS arm64", async () => {
  const manifest = await readFixture("nested-windows-backends");

  assert.doesNotThrow(() => validateAiRuntimeMetadata(manifest, "nested-windows-backends.json"));

  const parsed = parseAiRuntimeManifest(manifest, "nested-windows-backends.json");
  assert.equal(parsed.platforms.windows.base, null);
  assert.equal(parsed.platforms.windows.legacy, null);
  assert.equal(parsed.platforms.windows.backends.cuda?.fileName, "OpenStudio-AI-Runtime-windows-cuda.zip");
  assert.equal(
    parsed.platforms.windows.backends.directml?.fileName,
    "OpenStudio-AI-Runtime-windows-directml.zip",
  );
  assert.equal(parsed.platforms.macos.arm64?.fileName, "OpenStudio-AI-Runtime-macos-arm64.zip");
  assert.equal(resolveAiRuntimeDownloadUrl(parsed, "windows"), null);
  assert.equal(
    resolveAiRuntimeDownloadUrl(parsed, "windows", undefined, "cuda"),
    "https://example.com/OpenStudio-AI-Runtime-windows-cuda.zip",
  );
});

test("accepts a Windows base manifest with backend install plans", async () => {
  const manifest = await readFixture("windows-base-install-plan");

  assert.doesNotThrow(() => validateAiRuntimeMetadata(manifest, "windows-base-install-plan.json"));

  const parsed = parseAiRuntimeManifest(manifest, "windows-base-install-plan.json");
  assert.equal(parsed.platforms.windows.legacy, null);
  assert.equal(parsed.platforms.windows.base?.fileName, "OpenStudio-AI-Runtime-windows-base.zip");
  assert.equal(isAiRuntimeDownloadableAssetEntry(parsed.platforms.windows.backends.cuda), false);
  assert.equal(isAiRuntimeBackendInstallPlanEntry(parsed.platforms.windows.backends.cuda), true);
  assert.deepEqual(parsed.platforms.windows.backends.cuda, {
    installPlan: manifest.platforms.windows.backends.cuda.installPlan,
  });
  assert.deepEqual(parsed.platforms.windows.backends.directml, {
    installPlan: manifest.platforms.windows.backends.directml.installPlan,
  });
  assert.equal(
    resolveAiRuntimeDownloadUrl(parsed, "windows"),
    "https://example.com/OpenStudio-AI-Runtime-windows-base.zip",
  );
  assert.equal(resolveAiRuntimeDownloadUrl(parsed, "windows", undefined, "cuda"), null);
});

test("accepts a mixed transition manifest with legacy and new Windows entries", async () => {
  const manifest = await readFixture("mixed-transition-manifest");

  assert.doesNotThrow(() => validateAiRuntimeMetadata(manifest, "mixed-transition-manifest.json"));

  const parsed = parseAiRuntimeManifest(manifest, "mixed-transition-manifest.json");
  assert.equal(parsed.platforms.windows.legacy?.fileName, "OpenStudio-AI-Runtime-windows-x64.zip");
  assert.equal(parsed.platforms.windows.base?.fileName, "OpenStudio-AI-Runtime-windows-base.zip");
  assert.deepEqual(parsed.platforms.windows.backends.cuda, {
    installPlan: manifest.platforms.windows.backends.cuda.installPlan,
  });
  assert.deepEqual(parsed.platforms.windows.backends.directml, {
    installPlan: manifest.platforms.windows.backends.directml.installPlan,
  });
  assert.equal(
    resolveAiRuntimeDownloadUrl(parsed, "windows"),
    "https://example.com/OpenStudio-AI-Runtime-windows-base.zip",
  );
});

test("staging preserves backend install-plan metadata verbatim", async () => {
  const manifestText = await readFixtureText("windows-base-install-plan");
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "openstudio-ai-runtime-"));

  try {
    const inputRoot = path.join(tempRoot, "release-input");
    const outputRoot = path.join(tempRoot, "public");

    for (const relativePath of [
      path.join("releases", "ai-runtime", "latest.json"),
      path.join("releases", "ai-runtime", "stable", "latest.json"),
    ]) {
      const fullPath = path.join(inputRoot, relativePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, manifestText, "utf8");
    }

    const result = await stageAiRuntimeMetadata({
      repoRoot: tempRoot,
      inputDir: "release-input",
      outputDir: "public",
      requireMetadata: true,
    });

    assert.equal(result.staged, true);

    for (const relativePath of [
      path.join("releases", "ai-runtime", "latest.json"),
      path.join("releases", "ai-runtime", "stable", "latest.json"),
    ]) {
      const publishedText = await fs.readFile(path.join(outputRoot, relativePath), "utf8");
      assert.equal(publishedText, manifestText);
    }
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
});
