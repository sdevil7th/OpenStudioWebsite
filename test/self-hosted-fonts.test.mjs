import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (relativePath) =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url));
const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");
const indexHtml = read("index.html").toString("utf8");
const manifest = JSON.parse(
  read("public/assets/openstudio/fonts/google-fonts-20260815.json").toString(
    "utf8",
  ),
);
const fontCss = read(
  "public/assets/openstudio/fonts/google-fonts-20260815.css",
).toString("utf8");

const expectedFaces = new Map([
  ["Fraunces|italic", [300, 400, 500, 600, 700]],
  ["Fraunces|normal", [300, 400, 500, 600, 700]],
  ["Inter|normal", [300, 400, 500, 600, 700, 800]],
  ["JetBrains Mono|normal", [400, 500, 600, 700]],
  ["Orbitron|normal", [500, 600, 700, 800, 900]],
  ["Space Grotesk|normal", [400, 500, 700]],
]);

test("the font stylesheet is local, versioned, and keeps the Google face descriptors", () => {
  assert.match(
    indexHtml,
    /<link[^>]*rel="stylesheet"[^>]*href="\/assets\/openstudio\/fonts\/google-fonts-20260815\.css"[^>]*data-openstudio-fonts/s,
  );
  assert.match(
    indexHtml,
    /<link[^>]*rel="preload"[^>]*as="font"[^>]*type="font\/woff2"[^>]*crossorigin/s,
  );
  assert.doesNotMatch(indexHtml, /fonts\.(?:googleapis|gstatic)\.com/i);
  assert.doesNotMatch(fontCss, /https?:\/\//i);
  assert.equal((fontCss.match(/@font-face/g) ?? []).length, 110);
  assert.equal((fontCss.match(/font-display:\s*swap/g) ?? []).length, 110);
  assert.deepEqual(manifest.families, [
    "Fraunces",
    "Inter",
    "JetBrains Mono",
    "Orbitron",
    "Space Grotesk",
  ]);
  assert.equal(manifest.fontFaceCount, 110);

  const discoveredFaces = new Map();
  for (const [, block] of fontCss.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)) {
    const family = block.match(/font-family:\s*'([^']+)'/)?.[1];
    const style = block.match(/font-style:\s*([^;]+)/)?.[1].trim();
    const weight = Number(block.match(/font-weight:\s*(\d+)/)?.[1]);
    const key = `${family}|${style}`;
    const weights = discoveredFaces.get(key) ?? new Set();
    weights.add(weight);
    discoveredFaces.set(key, weights);
  }

  assert.deepEqual(
    new Map(
      [...discoveredFaces].map(([key, weights]) => [
        key,
        [...weights].sort((first, second) => first - second),
      ]),
    ),
    expectedFaces,
  );
});

test("all 23 WOFF2 files match the recorded upstream bytes", () => {
  assert.equal(manifest.fonts.length, 23);
  assert.equal(new Set(manifest.fonts.map(({ localUrl }) => localUrl)).size, 23);

  for (const font of manifest.fonts) {
    assert.match(font.sourceUrl, /^https:\/\/fonts\.gstatic\.com\//);
    assert.match(
      font.localUrl,
      /^\/assets\/openstudio\/fonts\/google\/[^/]+\/v\d+\/[^/]+\.woff2$/,
    );
    assert.ok(fontCss.includes(`url(${font.localUrl})`));

    const bytes = read(`public${font.localUrl}`);
    assert.equal(bytes.byteLength, font.bytes, font.localUrl);
    assert.equal(sha256(bytes), font.sha256, font.localUrl);
  }

  const cssBytes = read("public/assets/openstudio/fonts/google-fonts-20260815.css");
  assert.equal(sha256(cssBytes), manifest.css.sha256);
});

test("every self-hosted family includes its upstream SIL OFL license", () => {
  assert.equal(manifest.licenses.length, 5);

  for (const license of manifest.licenses) {
    const bytes = read(`public${license.localPath}`);
    const content = bytes.toString("utf8");

    assert.match(license.sourceUrl, /^https:\/\/raw\.githubusercontent\.com\/google\/fonts\//);
    assert.match(content, /SIL OPEN FONT LICENSE Version 1\.1/i);
    assert.equal(sha256(bytes), license.sha256, license.family);
  }
});
