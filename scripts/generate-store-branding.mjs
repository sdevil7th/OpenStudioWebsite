/** Render Microsoft Store artwork from the original vector logo and local brand font.
 * Run: node scripts/generate-store-branding.mjs
 * No external images, font requests or generated approximations of the logo.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const branding = resolve(root, "public/assets/openstudio/branding");
const output = resolve(branding, "microsoft-store");
const previewOutput = resolve(root, "output/store-branding");
const sourceLogo = await readFile(resolve(branding, "icon.svg"));
const font = await readFile(resolve(root, "public/assets/openstudio/fonts/google/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2"));
const logoUri = `data:image/svg+xml;base64,${sourceLogo.toString("base64")}`;
const fontUri = `data:font/woff2;base64,${font.toString("base64")}`;
const guidance = "https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/screenshots-and-images";

const assets = [
  { type: "poster", label: "Poster art", width: 720, height: 1080, title: true },
  { type: "poster", label: "Poster art", width: 1440, height: 2160, title: true },
  { type: "box-art", label: "Box art", width: 1080, height: 1080, title: true },
  { type: "box-art", label: "Box art", width: 2160, height: 2160, title: true },
  { type: "app-tile", label: "App tile icon", width: 300, height: 300, title: false },
  { type: "app-tile", label: "App tile icon", width: 150, height: 150, title: false },
  { type: "app-tile", label: "App tile icon", width: 71, height: 71, title: false },
  { type: "super-hero", label: "Super hero art", width: 1920, height: 1080, title: false },
  { type: "super-hero", label: "Super hero art", width: 3840, height: 2160, title: false },
  { type: "branded-key-art", label: "Branded key art", width: 584, height: 800, title: true },
  { type: "titled-hero", label: "Titled hero art", width: 1920, height: 1080, title: true },
  { type: "featured-promotional-square", label: "Featured promotional square", width: 1080, height: 1080, title: false },
].map(asset => ({ ...asset, file: `openstudio-${asset.type}-${asset.width}x${asset.height}.png` }));

function signalField(width, height) {
  // Curved signal lines echo the mark's sweep; all are decorative and may be cropped.
  const lines = Array.from({ length: 22 }, (_, index) => {
    const spread = index - 10.5;
    const points = Array.from({ length: 101 }, (_, step) => {
      const x = step / 100;
      const envelope = Math.sin(x * Math.PI) ** 1.8;
      const y = 0.72 + spread * 0.014 + Math.sin(x * Math.PI * 2.1 + spread * 0.13) * 0.11 * envelope;
      return `${step ? "L" : "M"}${(x * width).toFixed(2)},${(y * height).toFixed(2)}`;
    }).join(" ");
    return `<path d="${points}" fill="none" stroke="url(#signal)" stroke-width="${width / 1700 + 0.45}" opacity="${0.12 + (1 - Math.abs(spread) / 11) * 0.15}"/>`;
  }).join("");
  return `<svg class="signals" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="signal"><stop stop-color="#88bcec" stop-opacity=".15"/><stop offset=".4" stop-color="#389ad8"/><stop offset=".68" stop-color="#0cfaf7"/><stop offset="1" stop-color="#389ad8" stop-opacity=".1"/></linearGradient></defs>${lines}</svg>`;
}

function layout(asset) {
  const { type, width, height } = asset;
  const scale = width / (type === "poster" ? 720 : type === "app-tile" ? width : type === "branded-key-art" ? 584 : type.includes("hero") ? 1920 : 1080);
  const box = (left, top, size) => ({ left: left * scale, top: top * scale, width: size * scale, height: size * scale });
  if (type === "app-tile") return { mark: { left: width * .10, top: height * .10, width: width * .8, height: height * .8 } };
  if (type === "poster") return { mark: box(128, 136, 464), text: { top: 628 * scale, size: 76 * scale } };
  if (type === "box-art") return { mark: box(319, 84, 442), text: { top: 567 * scale, size: 104 * scale } };
  if (type === "super-hero") return { mark: box(686, 106, 548) };
  if (type === "branded-key-art") return { mark: box(131, 169, 322), text: { top: 24, size: 54 }, bar: true };
  if (type === "titled-hero") return { mark: box(325, 152, 470), text: { top: 309, left: 875, size: 130, align: "left" } };
  return { mark: box(238, 70, 604) };
}

function assetHtml(asset) {
  const spec = layout(asset);
  const markStyle = Object.entries(spec.mark).map(([key, value]) => `${key}:${value}px`).join(";");
  const text = spec.text ? `<div class="title key" style="top:${spec.text.top}px;font-size:${spec.text.size}px;${spec.text.left ? `left:${spec.text.left}px;width:auto;text-align:left;` : ""}">OpenStudio</div>` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face{font-family:Brand;src:url('${fontUri}') format('woff2');font-style:normal;font-weight:300 700;font-display:block}
    *{box-sizing:border-box}html,body{margin:0;width:${asset.width}px;height:${asset.height}px;overflow:hidden}
    .art{position:relative;width:100%;height:100%;overflow:hidden;background:
      radial-gradient(ellipse at 38% 29%,#24465e 0%,#102b40 22%,transparent 58%),
      radial-gradient(ellipse at 86% 60%,#083b43 0%,transparent 49%),
      linear-gradient(145deg,#10162c 0%,#080f1c 58%,#09151d 100%)}
    .art::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,transparent 54%,#060b14aa 100%)}
    .app-tile{background:radial-gradient(ellipse at 30% 22%,#304e67 0%,#1e354c 53%,#142237 100%)}
    .app-tile::after{display:none}.signals{position:absolute;inset:0;width:100%;height:100%}
    .mark{position:absolute;z-index:2;object-fit:contain;filter:drop-shadow(0 ${asset.width * .012}px ${asset.width * .04}px #00000024)}
    .app-tile .mark{filter:none}
    .title{position:absolute;z-index:3;left:0;width:100%;text-align:center;color:#f3f8fc;font-family:Brand,sans-serif;font-weight:700;line-height:1;letter-spacing:-.055em;white-space:nowrap}
    .brand-bar{position:absolute;inset:0 0 auto;height:110px;background:#0c1926e8;border-bottom:1px solid #88bcec36;z-index:1}
  </style></head><body><main class="art ${asset.type}">${asset.type === "app-tile" ? "" : signalField(asset.width, asset.height)}${spec.bar ? '<div class="brand-bar"></div>' : ""}<img class="mark key" src="${logoUri}" style="${markStyle}" alt="">${text}</main></body></html>`;
}

await mkdir(output, { recursive: true });
await mkdir(previewOutput, { recursive: true });
const browser = await chromium.launch();
const manifest = [];
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.route("http://**/*", route => route.abort());
  await page.route("https://**/*", route => route.abort());
  for (const asset of assets) {
    await page.setViewportSize({ width: asset.width, height: asset.height });
    await page.setContent(assetHtml(asset));
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode()));
    });
    const bounds = await page.locator(".key").evaluateAll(nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
    }));
    for (const rect of bounds) {
      assert.ok(rect.left >= 0 && rect.right <= asset.width, `${asset.file}: horizontal overflow`);
      assert.ok(rect.top >= 0 && rect.bottom <= (asset.type === "app-tile" ? asset.height : asset.height * 2 / 3), `${asset.file}: important content extends into the lower third`);
    }
    assert.equal(await page.locator(".title").count(), Number(asset.title));
    const png = await sharp(await page.screenshot({ type: "png" }))
      .removeAlpha().toColourspace("srgb").withMetadata({ density: 96 })
      .png({ compressionLevel: 9, palette: false }).toBuffer();
    const metadata = await sharp(png).metadata();
    const maximumBytes = asset.type === "app-tile" ? 5_000_000 : 50_000_000;
    assert.equal(metadata.format, "png");
    assert.equal(metadata.width, asset.width);
    assert.equal(metadata.height, asset.height);
    assert.equal(metadata.space, "srgb");
    assert.equal(metadata.hasAlpha, false);
    assert.ok(png.length < maximumBytes);
    await writeFile(resolve(output, asset.file), png);
    manifest.push({ ...asset, bytes: png.length, maximumBytes, format: "PNG", colourSpace: "sRGB", channels: metadata.channels, alpha: false, density: metadata.density, keyBounds: bounds, sha256: createHash("sha256").update(png).digest("hex") });
    console.log(`${asset.file}: ${(png.length / 1024).toFixed(1)} KiB`);
  }

  const previewItems = [assets[1], assets[3], assets[9], assets[7], assets[10], assets[11]];
  const cards = await Promise.all(previewItems.map(async asset => `<article><div class="image"><img src="data:image/png;base64,${(await readFile(resolve(output, asset.file))).toString("base64")}"></div><h2>${asset.label}</h2><p>${asset.width} × ${asset.height}${asset.title ? ' · With title' : ' · No text'}</p></article>`));
  const icons = await Promise.all(assets.filter(asset => asset.type === "app-tile").map(async asset => `<div><img style="width:${asset.width}px;height:${asset.height}px" src="data:image/png;base64,${(await readFile(resolve(output, asset.file))).toString("base64")}"><p>${asset.width} × ${asset.height}</p></div>`));
  await page.setViewportSize({ width: 1500, height: 1730 });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face{font-family:Brand;src:url('${fontUri}');font-weight:300 700}*{box-sizing:border-box}body{margin:0;padding:52px;background:#eaf0f5;color:#122035;font-family:Brand,sans-serif}h1{margin:0;font-size:44px;letter-spacing:-2px}header p{font-size:18px;color:#506275;margin:12px 0 34px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}article{padding:18px;background:#fff;border:1px solid #d5dfe8;border-radius:14px}.image{height:392px;display:flex;align-items:center;justify-content:center;background:#f0f4f7;border-radius:7px;overflow:hidden}.image img{max-width:100%;max-height:100%;object-fit:contain}h2{margin:17px 0 6px;font-size:23px;letter-spacing:-.6px}p{margin:0;color:#55687a;font-size:16px}.icons{display:flex;align-items:center;gap:60px;padding:24px 0 0}.icons p{text-align:center;margin-top:10px}.icon-card{margin-top:28px}.icon-card h2{margin-top:0}
  </style></head><body><header><h1>OpenStudio · Microsoft Store artwork</h1><p>Original vector mark · 12 PNG exports · Exact pixel dimensions · sRGB · Opaque backgrounds</p></header><div class="grid">${cards.join("")}</div><article class="icon-card"><h2>App tile icons — shown at actual pixel size</h2><div class="icons">${icons.join("")}</div></article></body></html>`);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  const preview = await sharp(await page.screenshot({ type: "png", fullPage: true })).removeAlpha().png().toBuffer();
  await writeFile(resolve(previewOutput, "preview.png"), preview);
} finally {
  await browser.close();
}

await writeFile(resolve(output, "manifest.json"), `${JSON.stringify({ sourceLogo: "../icon.svg", sourceLogoSha256: createHash("sha256").update(sourceLogo).digest("hex"), font: "Space Grotesk 700 (existing local brand font)", guidance, assets: manifest }, null, 2)}\n`);
const table = manifest.map(asset => `| ${asset.label} | ${asset.width} × ${asset.height} | ${asset.title ? "Yes" : "No"} | ${(asset.bytes / 1024).toFixed(1)} KiB | [${asset.file}](${asset.file}) |`).join("\n");
await writeFile(resolve(output, "README.md"), `OpenStudio Microsoft Store artwork\n\nUpload the PNG matching each Partner Center slot. All 12 images use the original icon.svg geometry and colours, with opaque backgrounds and 8-bit sRGB PNG encoding. Every file was checked for exact dimensions and the size limits shown in the supplied screenshots.\n\n| Placement | Pixels | Product title | File size | File |\n| --- | --- | --- | --- | --- |\n${table}\n\nThe poster upload in the supplied screenshot is labelled “9:16”, but its specified pixel sizes are 2:3. These exports follow the explicit 720 × 1080 and 1440 × 2160 dimensions, also listed in [Microsoft's current MSIX guidance](${guidance}). Use the higher-resolution alternative when a slot accepts either.\n\nSuper hero and featured promotional square artwork contain no text. Titled art keeps the title and main mark within the upper two-thirds, satisfying both the screenshot's upper-three-quarters note and Microsoft's more conservative overlay guidance. The key art includes an OpenStudio branding bar. App tile icons are text-free for readability at small sizes.\n\nPixel dimensions determine upload resolution; 96 DPI metadata is included for consistency. No image was enlarged from the 512 px PNG. The original SVG is rendered directly at every export size. The existing OG image is not reused because it includes text and UI unsuitable for the text-free hero placement.\n\nRegenerate from the repository root:\n\n\`\`\`sh\nnode scripts/generate-store-branding.mjs\n\`\`\`\n\nThe script regenerates only this dedicated output set and the preview at output/store-branding/preview.png. Existing source branding assets remain untouched.\n`);
console.log(`Validated ${manifest.length} PNGs. Output: ${output}`);
