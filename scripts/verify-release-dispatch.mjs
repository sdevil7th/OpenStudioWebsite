import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { websiteReleaseAssets } from "../shared/release-assets.ts";
import { selectDesktopRelease } from "./fetch-release-publish-inputs.mjs";
import { validateReleasePublishInputsTree } from "./release-publish-inputs.mjs";

export function verifyReleaseDispatch(tag, repo, releases, snapshot, manifest) {
  const latest = selectDesktopRelease(releases);
  if (latest.tag_name !== tag) throw new Error(`Dispatch ${tag} is stale; the published app is ${latest.tag_name}.`);
  const htmlUrl = `https://github.com/${repo}/releases/tag/${tag}`;
  if (latest.html_url !== htmlUrl || snapshot.htmlUrl !== htmlUrl || snapshot.tagName !== tag
    || manifest.version !== tag.slice(1) || manifest.releasePageUrl !== htmlUrl) {
    throw new Error("Built download snapshot or updater feed does not match this release.");
  }
  const assets = latest.assets.map(({ name, browser_download_url: downloadUrl, size }) => ({ name, downloadUrl, size }));
  const expected = websiteReleaseAssets({ tagName: tag, htmlUrl, assets });
  if (snapshot.assets.length !== expected.length || expected.some(asset => !snapshot.assets.some(built =>
    asset.name === built.name && asset.downloadUrl === built.downloadUrl && asset.size === built.size))) {
    throw new Error("Built download links or sizes differ from the published release assets.");
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [dist, tag, repo, releasesFile] = process.argv.slice(2);
  const readJSON = async file => JSON.parse(await fs.readFile(file, "utf8"));
  await validateReleasePublishInputsTree(dist, { requireMetadata: true, verifyAppSignature: true });
  const [pages, snapshot, manifest] = await Promise.all([
    readJSON(releasesFile), readJSON(path.join(dist, "github/latest-release.json")),
    readJSON(path.join(dist, "releases/stable/latest.json")),
  ]);
  verifyReleaseDispatch(tag, repo, pages.flat(), snapshot, manifest);
  console.log(`Verified published assets, download snapshot and updater feeds for ${tag}.`);
}
