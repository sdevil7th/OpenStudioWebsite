import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  OPTIONAL_RELEASE_ASSET_NAMES,
  RELEASE_ASSET_NAMES,
  hydrateReleaseMetadataInputs,
} from "../scripts/release-publish-inputs.mjs";

const makeInputRoot = async () =>
  fs.mkdtemp(path.join(os.tmpdir(), "openstudio-release-input-"));

const textResponse = (body) => ({
  ok: true,
  status: 200,
  text: async () => body,
});

const notFound = () => ({
  ok: false,
  status: 404,
  text: async () => "",
});

test("hydrates every required metadata path from the latest release", async () => {
  const inputRoot = await makeInputRoot();
  const requested = [];

  const result = await hydrateReleaseMetadataInputs({
    inputRoot,
    repo: "example/OpenStudio",
    fetchImpl: async (url) => {
      requested.push(url);
      const assetName = url.split("/").pop();
      if ([...OPTIONAL_RELEASE_ASSET_NAMES.values()].includes(assetName)) return notFound();
      return textResponse(`contents of ${assetName}`);
    },
  });

  assert.equal(result.hydrated, true);
  assert.equal(result.tag, null);

  for (const [relativePath, assetName] of RELEASE_ASSET_NAMES) {
    const contents = await fs.readFile(path.join(inputRoot, relativePath), "utf8");
    assert.equal(contents, `contents of ${assetName}`);
  }

  assert.ok(
    requested.every((url) => url.startsWith("https://github.com/example/OpenStudio/releases/latest/download/")),
  );
});

test("falls back to the newest release that carries the metadata assets", async () => {
  const inputRoot = await makeInputRoot();

  const result = await hydrateReleaseMetadataInputs({
    inputRoot,
    repo: "example/OpenStudio",
    fetchImpl: async (url) => {
      if (url.includes("/releases/latest/download/")) return notFound();

      if (url.startsWith("https://api.github.com/")) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { tag_name: "ai-runtime-v0.0.11", draft: false, prerelease: false, assets: [] },
            {
              tag_name: "v0.0.40",
              draft: false,
              prerelease: false,
              assets: [...RELEASE_ASSET_NAMES.values()].map((name) => ({ name })),
            },
          ],
        };
      }

      return textResponse(`contents of ${url.split("/").pop()}`);
    },
  });

  assert.equal(result.hydrated, true);
  assert.equal(result.tag, "v0.0.40");

  const stableManifest = await fs.readFile(
    path.join(inputRoot, "releases/ai-runtime/stable/latest.json"),
    "utf8",
  );
  assert.equal(stableManifest, "contents of OpenStudio-ai-runtime-stable-latest.json");
});

test("reports a reason instead of throwing when no release carries the metadata", async () => {
  const inputRoot = await makeInputRoot();

  const result = await hydrateReleaseMetadataInputs({
    inputRoot,
    repo: "example/OpenStudio",
    fetchImpl: async (url) => {
      if (url.startsWith("https://api.github.com/")) {
        return { ok: true, status: 200, json: async () => [] };
      }
      return notFound();
    },
  });

  assert.equal(result.hydrated, false);
  assert.equal(result.reason, "no-release-with-metadata");
});
