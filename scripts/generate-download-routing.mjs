import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { validateAppReleaseMetadata } from "./release-publish-inputs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = async (name) => JSON.parse(await fs.readFile(path.join(root, name), "utf8"));
const vite = await createServer({ root, configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, logLevel: "error", server: { middlewareMode: true } });
try {
  const { parseAiRuntimeManifest } = await vite.ssrLoadModule("/shared/ai-runtime-manifest.ts");
  const { parseGithubRepoSnapshot } = await vite.ssrLoadModule("/shared/github-snapshot.ts");
  const { resolveLatestReleaseAssetUrl, GITHUB_RELEASES_URL } = await vite.ssrLoadModule("/shared/github-api.ts");
  const metadata = await read("public/releases/stable/latest.json");
  validateAppReleaseMetadata(metadata, "download routing manifest");
  const snapshot = parseGithubRepoSnapshot(await read("public/github/repository.json"));
  const runtime = parseAiRuntimeManifest(await read("public/releases/ai-runtime/stable/latest.json"));
  const app = Object.fromEntries(["windows", "macos", "linux"].map((platform) => [platform,
    metadata.platforms[platform]?.url ?? resolveLatestReleaseAssetUrl(snapshot.latestRelease, platform) ??
      snapshot.latestRelease?.htmlUrl ?? GITHUB_RELEASES_URL,
  ]));
  const catalog = { app, runtime, fallback: GITHUB_RELEASES_URL };
  await fs.writeFile(path.join(root, "shared/generatedDownloadCatalog.ts"),
    `// Generated from validated release inputs. Do not edit.\nimport type { DownloadCatalog } from "./download-routing";\nexport const downloadCatalog: DownloadCatalog = ${JSON.stringify(catalog, null, 2)};\n`);
  console.log("Generated download routing from validated published release inputs.");
} finally {
  await vite.close();
}
