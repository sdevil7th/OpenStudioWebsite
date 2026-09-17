import assert from "node:assert/strict";
import { test } from "node:test";
import { execFile } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { chromium } from "playwright";
import sharp from "sharp";
import { captureOgCard } from "../scripts/generate-og.mjs";

test("production build environments can render the private OG tool", { timeout: 60_000 }, async () => {
  const directory = new URL("../output/review/", import.meta.url);
  await mkdir(directory, { recursive: true });
  const target = fileURLToPath(new URL("og-production-env.png", directory));
  await promisify(execFile)(process.execPath, ["--input-type=module", "-e", `
    import assert from 'node:assert/strict';
    import { generateOg } from './scripts/generate-og.mjs';
    await generateOg({ outputPath: process.argv[1] });
    assert.equal(process.env.NODE_ENV, 'production');
  `, target], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: { ...process.env, NODE_ENV: "production" },
    timeout: 55_000,
  });
  const rendered = await readFile(target);
  const published = await readFile(new URL("../dist/assets/openstudio/branding/og-image.png", import.meta.url));
  assert.deepEqual(rendered, published, "production environment renders the same artwork as the published build");
  const image = await sharp(rendered).metadata();
  assert.equal(image.width, 1200);
  assert.equal(image.height, 630);
});

test("OG capture waits for delayed artwork and rejects missing images/fonts", { timeout: 60_000 }, async (t) => {
  const browser = await chromium.launch();
  const pixel = await sharp({ create: { width: 1, height: 1, channels: 3, background: "#14b48c" } }).png().toBuffer();
  const markup = '<div id="og-card" style="width:1200px;height:630px;background:magenta"><img src="http://artwork.test/shot.png" style="width:100%;height:100%"></div>';
  try {
    await t.test("delayed image is decoded before the PNG is captured", async () => {
      const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
      await page.route("**/shot.png", async route => {
        await new Promise(resolve => setTimeout(resolve, 300));
        await route.fulfill({ contentType: "image/png", body: pixel });
      });
      await page.setContent(markup, { waitUntil: "domcontentloaded" });
      const png = await captureOgCard(page);
      const metadata = await sharp(png).metadata();
      assert.equal(metadata.width, 1200);
      assert.equal(metadata.height, 630);
      assert.equal(metadata.hasAlpha, false);
      const color = await sharp(png).extract({ left: 100, top: 100, width: 1, height: 1 }).raw().toBuffer();
      assert.deepEqual([...color], [20, 180, 140]);
      await page.close();
    });
    await t.test("a failed image cannot silently produce a broken share card", async () => {
      const page = await browser.newPage();
      await page.route("**/shot.png", route => route.fulfill({ status: 404, body: "missing" }));
      await page.setContent(markup);
      await assert.rejects(captureOgCard(page), /decode|source image|load/i);
      await page.close();
    });
    await t.test("a failed font cannot silently produce fallback typography", async () => {
      const page = await browser.newPage();
      await page.route("**/missing.woff2", route => route.fulfill({ status: 404, body: "missing" }));
      await page.setContent('<style>@font-face{font-family:Missing;src:url(http://artwork.test/missing.woff2)}</style><div id="og-card" style="width:1200px;height:630px;font-family:Missing">OpenStudio</div>');
      await assert.rejects(captureOgCard(page), /OG font failed to load/);
      await page.close();
    });
  } finally {
    await browser.close();
  }
});
