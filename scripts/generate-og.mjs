/** Render the development-only artwork during every build, without a running dev server. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";
import { createServer } from "vite";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "public/assets/openstudio/branding/og-image.png");

export async function captureOgCard(page) {
  const card = page.locator("#og-card");
  await card.waitFor({ state: "visible" });
  await page.locator("#openstudio-instant-loader").waitFor({ state: "hidden" });
  // Bound readiness waits so a stalled asset fails the build instead of hanging it.
  await page.waitForFunction(() => document.fonts.status === "loaded" &&
    [...document.querySelectorAll("#og-card img")].every(image => image.complete));
  await card.evaluate(async (element) => {
    await document.fonts.ready;
    for (const font of document.fonts) {
      if (font.status === "error") throw new Error(`OG font failed to load: ${font.family}`);
    }
    await Promise.all([...element.querySelectorAll("img")].map(async (image) => {
      await image.decode();
      if (!image.naturalWidth) throw new Error(`OG image failed to load: ${image.src}`);
    }));
  });
  const box = await card.boundingBox();
  if (box?.width !== 1200 || box.height !== 630) {
    throw new Error(`OG card must be 1200 × 630; got ${JSON.stringify(box)}`);
  }
  const screenshot = await card.screenshot({ type: "png", animations: "disabled" });
  // Lossless compression; publish an opaque, standard RGB PNG.
  return sharp(screenshot).flatten({ background: "#ffffff" }).png({ compressionLevel: 9 }).toBuffer();
}

export async function generateOg({ outputPath = output } = {}) {
  let server;
  let browser;
  const previousNodeEnv = process.env.NODE_ENV;
  // A production CI environment must not hide this development-only route.
  // This applies only to the temporary renderer, never the published build.
  process.env.NODE_ENV = "development";
  try {
    server = await createServer({
      root,
      mode: "development",
      logLevel: "error",
      server: { host: "127.0.0.1", port: 0, strictPort: true, hmr: false, open: false },
    });
    await server.listen();
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("requestfailed", request => errors.push(`Request failed: ${request.url()}`));
    page.on("response", response => {
      if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
    });
    const response = await page.goto(new URL("/og-card", server.resolvedUrls.local[0]).href);
    if (!response?.ok()) throw new Error("Could not load the OG artwork page");
    const png = await captureOgCard(page);
    if (errors.length) throw new Error(`OG artwork errors: ${errors.join("; ")}`);
    await fs.writeFile(`${outputPath}.tmp`, png);
    await fs.rename(`${outputPath}.tmp`, outputPath);
    console.log(`[og] generated 1200 × 630 PNG (${png.length} bytes)`);
  } finally {
    try {
      await Promise.all([browser?.close(), server?.close()]);
    } finally {
      if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousNodeEnv;
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateOg();
}
