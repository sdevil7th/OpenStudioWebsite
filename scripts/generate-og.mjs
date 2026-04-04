/**
 * OG image generator
 *
 * Requires the dev server to be running first:
 *   npm run dev
 *
 * Then in a separate terminal:
 *   npm run generate-og
 *
 * Saves the result to:
 *   public/assets/openstudio/branding/og-image.png
 */

import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/assets/openstudio/branding/og-image.png");
const DEV_URL = "http://localhost:8080/og-card";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 630 });

try {
  await page.goto(DEV_URL, { waitUntil: "networkidle", timeout: 15000 });
} catch {
  console.error("\n✖  Could not reach dev server at", DEV_URL);
  console.error("   Run `npm run dev` first, then run this script in a separate terminal.\n");
  await browser.close();
  process.exit(1);
}

// Give fonts and images time to fully paint
await page.waitForTimeout(1800);

const el = page.locator("#og-card");
await el.screenshot({ path: OUT, type: "png" });

console.log("\n✓  OG image saved →", OUT, "\n");

await browser.close();
