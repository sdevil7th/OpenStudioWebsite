import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fetchReleasePublishInputs, releaseAssetPaths, selectDesktopRelease } from "../scripts/fetch-release-publish-inputs.mjs";
import { verifyReleaseDispatch } from "../scripts/verify-release-dispatch.mjs";
import { stageReleasePublishInputs, verifySignedAppManifest } from "../scripts/release-publish-inputs.mjs";
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
  const release = { tag_name: "v0.1.01", draft: false, prerelease: false, published_at: "2026-10-01T12:00:00Z", assets };
  return { release, files };
};

test("release discovery ignores newer runtime, draft and preview releases", () => {
  const desktop = { tag_name: "v0.1.01", published_at: "2026-10-01T12:00:00Z" };
  assert.equal(selectDesktopRelease([
    { tag_name: "ai-runtime-v9.9.9" }, { tag_name: "ffmpeg-runtime-v9.9.9" },
    { tag_name: "v9.9.9", draft: true }, { tag_name: "v9.9.8", prerelease: true }, desktop,
  ]), desktop);
  assert.throws(() => selectDesktopRelease([{ tag_name: "ai-runtime-v9.9.9" }]));
  const latest = { tag_name: "v0.1.09", published_at: "2026-11-09T06:00:00Z" };
  assert.equal(selectDesktopRelease([desktop, { ...latest, tag_name: "v0.1.10", published_at: null }, latest]), latest);
});

test("the production updater verifier accepts the published signature and rejects missing, forged and inconsistent envelopes", async () => {
  const manifest = JSON.parse(await fs.readFile(new URL("../public/releases/stable/latest.json", import.meta.url), "utf8"));
  verifySignedAppManifest(manifest);
  assert.throws(() => verifySignedAppManifest({ ...manifest, signature: undefined }), /requires a signed payload/);
  assert.throws(() => verifySignedAppManifest({ ...manifest, signature: Buffer.alloc(64).toString("base64") }), /signature is invalid/);
  assert.throws(() => verifySignedAppManifest({ ...manifest, signedPayload: Buffer.from("{}").toString("base64") }), /signature is invalid/);
  assert.throws(() => verifySignedAppManifest({ ...manifest, notes: "Changed outside the signature" }), /differs from the signed payload/);
});

test("dispatch verifies the published tag, exact download links and sizes, including the optional Support bundle", () => {
  const repo = "sdevil7th/OpenStudio", tag = "v0.1.09";
  const htmlUrl = `https://github.com/${repo}/releases/tag/${tag}`;
  const assets = ["OpenStudio-Setup-x64.exe", "OpenStudio-0.1.09-linux-x86_64-with-support.tar.gz"]
    .map(name => ({ name, size: 123, downloadUrl: `https://github.com/${repo}/releases/download/${tag}/${name}` }));
  const release = { tag_name: tag, published_at: "2026-11-09T06:00:00Z", html_url: htmlUrl,
    assets: assets.map(a => ({ name: a.name, size: a.size, browser_download_url: a.downloadUrl })) };
  const snapshot = { tagName: tag, htmlUrl, assets };
  const manifest = { version: "0.1.09", releasePageUrl: htmlUrl };
  const old = { ...release, tag_name: "v0.1.08", published_at: "2026-10-25T06:00:00Z" };
  const verify = (built, feed = manifest) => verifyReleaseDispatch(tag, repo, [old, release], built, feed);
  verify(snapshot);
  assert.throws(() => verify({ ...snapshot, assets: assets.slice(0, 1) }), /download links/);
  assert.throws(() => verify({ ...snapshot, assets: [assets[0], { ...assets[1], size: 456 }] }), /download links/);
  assert.throws(() => verify({ ...snapshot, assets: [assets[0], { ...assets[1], downloadUrl: assets[0].downloadUrl }] }), /download links/);
  assert.throws(() => verify(snapshot, { ...manifest, version: "0.1.08" }), /updater feed/);
  assert.throws(() => verifyReleaseDispatch(old.tag_name, repo, [old, release], snapshot, manifest), /stale/);
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
