import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fontRoot = path.join(
  repoRoot,
  "public",
  "assets",
  "openstudio",
  "fonts",
);
const binaryRoot = path.join(fontRoot, "google");
const cssFilename = "google-fonts-20260815.css";
const cssPath = path.join(fontRoot, cssFilename);
const manifestPath = path.join(fontRoot, "google-fonts-20260815.json");
const sourceCssUrl =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Orbitron:wght@500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400;1,9..144,500;1,9..144,600;1,9..144,700&display=swap";
const browserUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const sourceCssSha256 =
  "4e124eea869f43254ac4e3cd1f2ebc7a1925388da60fde6a79cf6803add6df96";
const expectedFamilies = [
  "Fraunces",
  "Inter",
  "JetBrains Mono",
  "Orbitron",
  "Space Grotesk",
];
const licenses = new Map([
  ["Fraunces", "https://raw.githubusercontent.com/google/fonts/main/ofl/fraunces/OFL.txt"],
  ["Inter", "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt"],
  ["JetBrains Mono", "https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/OFL.txt"],
  ["Orbitron", "https://raw.githubusercontent.com/google/fonts/main/ofl/orbitron/OFL.txt"],
  ["Space Grotesk", "https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/OFL.txt"],
]);

const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const fetchStrict = async (url, options) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response;
};

const sourceCss = await fetchStrict(sourceCssUrl, {
  headers: { "user-agent": browserUserAgent },
}).then((response) => response.text());

if (sha256(sourceCss) !== sourceCssSha256) {
  throw new Error(
    "The Google Fonts stylesheet changed; review and create a newly dated snapshot instead of overwriting this one.",
  );
}

const discoveredFamilies = [
  ...new Set(
    [...sourceCss.matchAll(/font-family:\s*'([^']+)'/g)].map(
      ([, family]) => family,
    ),
  ),
].sort();

if (JSON.stringify(discoveredFamilies) !== JSON.stringify(expectedFamilies)) {
  throw new Error(
    `Unexpected Google Fonts families: ${discoveredFamilies.join(", ")}`,
  );
}

const remoteFontUrls = [
  ...new Set(
    [...sourceCss.matchAll(/https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2/g)].map(
      ([url]) => url,
    ),
  ),
];

if (remoteFontUrls.length !== 23) {
  throw new Error(
    `Expected 23 unique Google Fonts WOFF2 files, found ${remoteFontUrls.length}.`,
  );
}

await fs.mkdir(binaryRoot, { recursive: true });

const fontRecords = await Promise.all(
  remoteFontUrls.map(async (sourceUrl) => {
    const sourcePath = new URL(sourceUrl).pathname;
    const match = sourcePath.match(/^\/s\/([^/]+)\/(v\d+)\/([^/]+\.woff2)$/);

    if (!match) {
      throw new Error(`Unexpected Google Fonts asset path: ${sourcePath}`);
    }

    const [, familySlug, version, filename] = match;
    const relativePath = path.posix.join(
      "google",
      familySlug,
      version,
      filename,
    );
    const localUrl = `/assets/openstudio/fonts/${relativePath}`;
    const outputPath = path.join(fontRoot, ...relativePath.split("/"));
    const bytes = Buffer.from(
      await fetchStrict(sourceUrl).then((response) => response.arrayBuffer()),
    );

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, bytes);

    return {
      bytes: bytes.byteLength,
      localUrl,
      sha256: sha256(bytes),
      sourceUrl,
    };
  }),
);

let localCss = sourceCss;
for (const record of fontRecords) {
  localCss = localCss.replaceAll(record.sourceUrl, record.localUrl);
}

if (/https:\/\/fonts\.(?:googleapis|gstatic)\.com/i.test(localCss)) {
  throw new Error("The vendored stylesheet still contains an external font URL.");
}

const cssBanner = [
  "/*",
  " * OpenStudio self-hosted Google Fonts snapshot (2026-08-15).",
  " * The face declarations and WOFF2 bytes match the source recorded in",
  " * google-fonts-20260815.json. Licenses are under ./licenses/.",
  " */",
  "",
].join("\n");

await fs.mkdir(fontRoot, { recursive: true });
await fs.writeFile(cssPath, `${cssBanner}${localCss.trim()}\n`, "utf8");

const licenseRecords = await Promise.all(
  [...licenses].map(async ([family, sourceUrl]) => {
    const filename = `${family.toLowerCase().replaceAll(" ", "-")}-OFL.txt`;
    const localPath = path.join(fontRoot, "licenses", filename);
    const content = await fetchStrict(sourceUrl).then((response) => response.text());

    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, content, "utf8");

    return {
      family,
      localPath: `/assets/openstudio/fonts/licenses/${filename}`,
      sha256: sha256(content),
      sourceUrl,
    };
  }),
);

const manifest = {
  browserUserAgent,
  css: {
    localUrl: `/assets/openstudio/fonts/${cssFilename}`,
    sha256: sha256(`${cssBanner}${localCss.trim()}\n`),
    sourceSha256: sourceCssSha256,
    sourceUrl: sourceCssUrl,
  },
  families: expectedFamilies,
  fontFaceCount: (sourceCss.match(/@font-face/g) ?? []).length,
  fonts: fontRecords.sort((first, second) =>
    first.localUrl.localeCompare(second.localUrl),
  ),
  licenses: licenseRecords,
  snapshotDate: "2026-08-15",
};

await fs.writeFile(
  manifestPath,
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(
  `[fonts] vendored ${manifest.fonts.length} WOFF2 files for ${manifest.families.length} families (${manifest.fontFaceCount} face declarations).`,
);
