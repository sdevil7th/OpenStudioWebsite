import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getReleaseMetadataInputDir,
  validateReleasePublishInputsTree,
} from "./release-publish-inputs.mjs";

export const releaseAssetPaths = {
  "OpenStudio-release-latest.json": "releases/latest.json",
  "OpenStudio-release-stable-latest.json": "releases/stable/latest.json",
  "OpenStudio-ai-runtime-latest.json": "releases/ai-runtime/latest.json",
  "OpenStudio-ai-runtime-stable-latest.json": "releases/ai-runtime/stable/latest.json",
  "OpenStudio-appcast-windows-stable.xml": "appcast/windows-stable.xml",
  "OpenStudio-appcast-macos-stable.xml": "appcast/macos-stable.xml",
  "OpenStudio-appcast-linux-stable.xml": "appcast/linux-stable.xml",
};

export const selectDesktopRelease = (releases) => {
  // Runtime/FFmpeg releases share the repository. They are never app releases.
  const release = releases.find((item) => !item.draft && !item.prerelease
    && /^v\d+\.\d+\.\d+$/.test(item.tag_name));
  if (!release) throw new Error("No published stable desktop release found.");
  return release;
};

export const fetchReleasePublishInputs = async ({
  repoRoot,
  inputDir = getReleaseMetadataInputDir(),
  repo = process.env.OPENSTUDIO_DESKTOP_REPO || "sdevil7th/OpenStudio",
  fetchImpl = fetch,
  token = process.env.OPENSTUDIO_RELEASE_SOURCE_TOKEN || process.env.GH_TOKEN,
} = {}) => {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error("Invalid desktop repository.");
  const inputRoot = path.resolve(repoRoot, inputDir);
  const relative = path.relative(path.resolve(repoRoot), inputRoot);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Release input directory must be inside the website repository.");
  }
  const response = await fetchImpl(`https://api.github.com/repos/${repo}/releases?per_page=100`, {
    headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    signal: AbortSignal.timeout(30_000),
    redirect: "error",
  });
  if (!response.ok) throw new Error(`Release discovery failed (HTTP ${response.status}).`);
  const release = selectDesktopRelease(await response.json());
  const assets = new Map(release.assets.map((asset) => [asset.name, asset]));
  const entries = Object.entries(releaseAssetPaths).filter(([name]) => {
    if (name === "OpenStudio-appcast-linux-stable.xml" && !assets.has(name)) return false;
    if (!assets.has(name)) throw new Error(`${release.tag_name} is missing ${name}.`);
    return true;
  });
  await fs.mkdir(inputRoot, { recursive: true });
  const staging = await fs.mkdtemp(path.join(inputRoot, ".fetch-"));
  try {
    for (const [name, relativePath] of entries) {
      const asset = assets.get(name);
      const expectedUrl = `https://github.com/${repo}/releases/download/${release.tag_name}/${name}`;
      if (asset.browser_download_url !== expectedUrl || !Number.isSafeInteger(asset.size)
        || asset.size <= 0 || asset.size > 5 * 1024 * 1024) {
        throw new Error(`Invalid metadata asset ${name}.`);
      }
      // Public asset download: never forward the GitHub API credential to a CDN.
      const download = await fetchImpl(expectedUrl, { signal: AbortSignal.timeout(60_000) });
      if (!download.ok) throw new Error(`Download failed for ${name} (HTTP ${download.status}).`);
      const bytes = Buffer.from(await download.arrayBuffer());
      if (bytes.length !== asset.size) throw new Error(`Incomplete metadata asset ${name}.`);
      const target = path.join(staging, relativePath);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, bytes);
    }
    await validateReleasePublishInputsTree(staging, { requireMetadata: true });
    const app = JSON.parse(await fs.readFile(path.join(staging, "releases/latest.json"), "utf8"));
    const runtime = JSON.parse(await fs.readFile(path.join(staging, "releases/ai-runtime/latest.json"), "utf8"));
    if (`v${app.version}` !== release.tag_name || runtime.appVersion !== app.version) {
      throw new Error("Downloaded metadata does not match the selected desktop release.");
    }
    // Validate the whole set before replacing any existing build inputs.
    for (const relativePath of Object.values(releaseAssetPaths)) {
      const source = path.join(staging, relativePath);
      const destination = path.join(inputRoot, relativePath);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      try {
        await fs.copyFile(source, destination);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        await fs.rm(destination, { force: true });
      }
    }
    return { tag: release.tag_name, inputRoot };
  } finally {
    // mkdtemp created this exact directory underneath the verified input root.
    await fs.rm(staging, { recursive: true, force: true });
  }
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  try {
    const result = await fetchReleasePublishInputs({ repoRoot });
    console.log(`[release-publish] fetched and validated ${result.tag}.`);
  } catch (error) {
    console.error(`[release-publish] ${error.message}`);
    process.exitCode = 1;
  }
}
