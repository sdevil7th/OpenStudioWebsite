import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { prepareReleasePublishInputs } from "../scripts/stage-release-publish-inputs.mjs";

const fixture = fileURLToPath(new URL("./fixtures/release-v0.1.01/", import.meta.url));

test("clean builds retrieve release inputs and later local builds reuse the validated set", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "openstudio-release-build-"));
  let fetches = 0;
  const fetchInputs = async ({ repoRoot, inputDir }) => {
    fetches++;
    await fs.cp(fixture, path.join(repoRoot, inputDir), { recursive: true });
    return { tag: "v0.1.01" };
  };
  try {
    const result = await prepareReleasePublishInputs({ root, fetchInputs, refresh: false });
    assert.equal(result.staged, true);
    assert.equal(result.fetchedTag, "v0.1.01");
    for (const file of ["releases/latest.json", "releases/stable/latest.json", "releases/ai-runtime/latest.json", "appcast/windows-stable.xml", "appcast/macos-stable.xml", "appcast/linux-stable.xml"])
      assert.equal(await fs.readFile(path.join(root, "public", file), "utf8"), await fs.readFile(path.join(fixture, file), "utf8"));
    await prepareReleasePublishInputs({ root, fetchInputs, refresh: false });
    assert.equal(fetches, 1);
    await prepareReleasePublishInputs({ root, fetchInputs, refresh: true });
    assert.equal(fetches, 2);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("clean builds fail if published release inputs cannot be retrieved", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "openstudio-release-build-"));
  try {
    await assert.rejects(prepareReleasePublishInputs({ root, refresh: false, fetchInputs: async () => { throw new Error("Metadata unavailable"); } }), /Metadata unavailable/);
    await assert.rejects(fs.access(path.join(root, "public/releases/latest.json")));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("invalid supplied release inputs fail validation instead of being silently replaced", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "openstudio-release-build-"));
  try {
    await fs.mkdir(path.join(root, "release-input/releases"), { recursive: true });
    await fs.writeFile(path.join(root, "release-input/releases/latest.json"), "not JSON");
    let fetched = false;
    await assert.rejects(prepareReleasePublishInputs({ root, refresh: false, fetchInputs: async () => { fetched = true; } }));
    assert.equal(fetched, false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
