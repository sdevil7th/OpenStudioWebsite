import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fetchReleasePublishInputs, releaseAssetPaths, selectDesktopRelease } from "../scripts/fetch-release-publish-inputs.mjs";
import { stageReleasePublishInputs } from "../scripts/release-publish-inputs.mjs";
import { parseAiRuntimeManifest, resolveAiRuntimeDownloadUrl } from "../shared/ai-runtime-manifest.ts";

const fixtureRoot = new URL("./fixtures/release-v0.1.01/", import.meta.url);
const makeSource = async () => {
  const files = new Map();
  const assets = [];
  for (const [name, relative] of Object.entries(releaseAssetPaths)) {
    const data = await fs.readFile(new URL(relative, fixtureRoot));
    const url = `https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/${name}`;
    files.set(url, data);
    assets.push({ name, size: data.length, browser_download_url: url });
  }
  const release = { tag_name: "v0.1.01", draft: false, prerelease: false, assets };
  return { release, files };
};

test("release discovery ignores newer runtime, draft and preview releases", () => {
  const desktop = { tag_name: "v0.1.01" };
  assert.equal(selectDesktopRelease([
    { tag_name: "ai-runtime-v9.9.9" }, { tag_name: "ffmpeg-runtime-v9.9.9" },
    { tag_name: "v9.9.9", draft: true }, { tag_name: "v9.9.8", prerelease: true }, desktop,
  ]), desktop);
  assert.throws(() => selectDesktopRelease([{ tag_name: "ai-runtime-v9.9.9" }]));
});

test("website-only build fetches, validates and stages the existing published feeds verbatim", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "openstudio-release-fetch-"));
  const { release, files } = await makeSource();
  try {
    const result = await fetchReleasePublishInputs({ repoRoot: root, token: "test-secret", fetchImpl: async (url, options) => {
      if (url.startsWith("https://api.github.com/")) {
        assert.equal(options.headers.Authorization, "Bearer test-secret");
        return Response.json([{ tag_name: "ai-runtime-v99.0.0" }, release]);
      }
      assert.equal(options.headers?.Authorization, undefined);
      assert.ok(files.has(url));
      return new Response(files.get(url));
    } });
    assert.equal(result.tag, "v0.1.01");
    await stageReleasePublishInputs({ repoRoot: root, requireMetadata: true });
    for (const [name, relative] of Object.entries(releaseAssetPaths)) {
      assert.deepEqual(await fs.readFile(path.join(root, "public", relative)), files.get(release.assets.find(a => a.name === name).browser_download_url));
    }
    const manifest = parseAiRuntimeManifest(JSON.parse(await fs.readFile(path.join(root, "public/releases/ai-runtime/latest.json"), "utf8")));
    for (const [platform, arch] of [["windows"], ["macos", "arm64"], ["linux", "x64"]]) {
      assert.match(resolveAiRuntimeDownloadUrl(manifest, platform, arch), /ai-runtime-v0\.0\.13/);
    }
    assert.equal(resolveAiRuntimeDownloadUrl(manifest, "macos", "x64"), null);
    assert.ok(manifest.platforms.linux.backends.cuda.installPlan);
    assert.ok(manifest.platforms.linux.backends.rocm.installPlan);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

for (const scenario of ["missing asset", "bad size", "invalid JSON", "mixed version", "missing Linux appcast", "network failure"]) {
  test(`fetch fails before replacing existing inputs: ${scenario}`, async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "openstudio-release-fetch-"));
    const { release, files } = await makeSource();
    if (scenario === "missing asset") release.assets.shift();
    if (scenario === "bad size") release.assets[0].size++;
    if (scenario === "invalid JSON") files.set(release.assets[0].browser_download_url, Buffer.alloc(release.assets[0].size, 120));
    if (scenario === "mixed version") {
      release.tag_name = "v0.2.00";
      for (const asset of release.assets) {
        const old = asset.browser_download_url;
        asset.browser_download_url = old.replace("v0.1.01", "v0.2.00");
        files.set(asset.browser_download_url, files.get(old));
      }
    }
    if (scenario === "missing Linux appcast") release.assets.pop();
    const sentinel = path.join(root, "release-input/releases/latest.json");
    await fs.mkdir(path.dirname(sentinel), { recursive: true });
    await fs.writeFile(sentinel, "existing inputs");
    try {
      await assert.rejects(fetchReleasePublishInputs({ repoRoot: root, fetchImpl: async (url) => {
        if (scenario === "network failure") throw new Error("offline");
        return url.startsWith("https://api.github.com/") ? Response.json([release]) : new Response(files.get(url));
      } }));
      assert.equal(await fs.readFile(sentinel, "utf8"), "existing inputs");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
}
