import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outDir = resolve(__dirname, "../.screenshots/ai");
await mkdir(outDir, { recursive: true });

const url = process.env.AI_URL || "http://localhost:5180/ai";
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 900, height: 1200 },
  { name: "mobile", width: 414, height: 896 },
];

const browser = await chromium.launch();
const consoleErrors = [];

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.on("pageerror", (err) => consoleErrors.push(`[${vp.name}] pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[${vp.name}] console.error: ${msg.text()}`);
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Full-page screenshot (one big PNG of everything)
  await page.screenshot({
    path: resolve(outDir, `${vp.name}-full.png`),
    fullPage: true,
  });

  // Section-level: scroll to each act and snap a viewport-sized shot
  const acts = [
    { sel: "[data-ai-genesis]", label: "01-genesis" },
    { sel: "[data-ai-pillars]", label: "02-pillars" },
    { sel: "[data-ai-neural-lab]", label: "03-neural-lab" },
    { sel: "[data-ai-arch]", label: "04-arch" },
    { sel: "[data-ai-usecases]", label: "05-usecases" },
    { sel: "[data-ai-outro]", label: "06-outro" },
  ];

  for (const act of acts) {
    const el = await page.$(act.sel);
    if (!el) {
      consoleErrors.push(`[${vp.name}] missing selector ${act.sel}`);
      continue;
    }
    const sectionInfo = await el.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return { top: rect.top + window.scrollY, height: rect.height };
    });
    // Take three shots per act: top, mid, bottom (clipped to section height)
    const shots = [
      { suffix: "a-top", y: sectionInfo.top - 64 },
      { suffix: "b-mid", y: sectionInfo.top + sectionInfo.height / 2 - vp.height / 2 },
      {
        suffix: "c-end",
        y: Math.max(sectionInfo.top, sectionInfo.top + sectionInfo.height - vp.height + 32),
      },
    ];
    for (const shot of shots) {
      await page.evaluate((y) => window.scrollTo({ top: Math.max(0, y), behavior: "instant" }), shot.y);
      await page.waitForTimeout(700);
      await page.screenshot({
        path: resolve(outDir, `${vp.name}-${act.label}-${shot.suffix}.png`),
        fullPage: false,
      });
    }
  }

  await context.close();
}

await browser.close();

if (consoleErrors.length > 0) {
  console.log("\n--- CONSOLE / RUNTIME ERRORS ---");
  for (const err of consoleErrors) console.log(err);
} else {
  console.log("No runtime errors.");
}
console.log(`\nScreenshots saved to ${outDir}`);
