import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

await mkdir(".screenshots/scroll-perf", { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const baseUrl = process.env.VERIFY_BASE_URL ?? "http://localhost:5180";
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
});
await page.goto(`${baseUrl}/ai`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

// Scroll into the neural lab pinned section, sample HUD percentage at 4 stops
const labTop = await page.evaluate(() => {
  const el = document.querySelector("[data-ai-neural-lab]");
  return el ? el.getBoundingClientRect().top + window.scrollY : 0;
});
const labHeight = await page.evaluate(() => {
  const el = document.querySelector("[data-ai-neural-lab]");
  return el ? el.offsetHeight : 0;
});
console.log(`Neural lab section: top=${labTop} height=${labHeight}`);

const samples = [];
for (const frac of [0, 0.25, 0.5, 0.75, 0.95]) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), labTop + labHeight * frac - 100);
  await page.waitForTimeout(400);
  const hudText = await page.evaluate(() => {
    const g = document.querySelector("[data-ai-neural-global-pct]");
    const p = document.querySelector("[data-ai-neural-phase-pct]");
    const bar = document.querySelector("[data-ai-neural-progress-bar]");
    return {
      global: g?.textContent,
      phase: p?.textContent,
      barWidth: bar ? getComputedStyle(bar).width : null,
    };
  });
  samples.push({ frac, ...hudText });
}
console.log("HUD readings while scrolling neural lab:");
for (const s of samples) console.log(s);

// Spot-check: scroll fast through entire page, count how many uniform values change in the AiGenesisStage canvas.
// We can't read uniforms directly; instead, take a screenshot at two scroll positions and check pixel diff.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
const shotA = await page.screenshot({ clip: { x: 0, y: 100, width: 1440, height: 600 } });
await page.evaluate(() => window.scrollTo(0, 700));
await page.waitForTimeout(800);
const shotB = await page.screenshot({ clip: { x: 0, y: 100, width: 1440, height: 600 } });
const same = Buffer.compare(shotA, shotB) === 0;
console.log(`\nGenesis scene differs between scroll=0 and scroll=700: ${!same ? "YES (good)" : "NO (bad)"}`);

await page.goto(`${baseUrl}/download`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const downloadCinema = await page.evaluate(() => {
  const el = document.querySelector("[data-download-studio-evolution]");
  return el ? { top: el.getBoundingClientRect().top + window.scrollY, height: el.scrollHeight } : null;
});

if (downloadCinema) {
  console.log(`\nStudio Evolution section: top=${downloadCinema.top} height=${downloadCinema.height}`);
  const viewportHeight = page.viewportSize()?.height ?? 900;
  const scrollSpan = Math.max(downloadCinema.height - viewportHeight, 1);
  const downloadSamples = [];
  const downloadShots = [];
  for (const [index, frac] of [0, 0.2, 0.4, 0.6, 0.8, 0.96].entries()) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), downloadCinema.top + scrollSpan * frac);
    await page.waitForTimeout(900);
    const state = await page.evaluate(() => {
      const section = document.querySelector("[data-download-studio-evolution]");
      const stage = section?.querySelector("[data-studio-cinematic-timeline]");
      const canvas = section?.querySelector("[data-studio-evolution-webgl]");
      const loading = section?.querySelector("[data-studio-evolution-loading]");
      const storyboard = section?.querySelector("[data-download-studio-evolution-fallback]");
      const active = section?.querySelector(".studio-evolution__chapter-rail .is-active");
      return {
        hasTimeline: Boolean(stage),
        hasWebglCanvas: Boolean(canvas),
        stageBox: stage ? `${stage.clientWidth}x${stage.clientHeight}` : null,
        canvasBox: canvas ? `${canvas.clientWidth}x${canvas.clientHeight}` : null,
        loadingVisible: loading ? getComputedStyle(loading).display !== "none" : false,
        fallbackVisible: storyboard ? getComputedStyle(storyboard).display !== "none" : false,
        activeAct: active?.textContent?.trim() ?? null,
      };
    });
    downloadSamples.push({ frac, ...state });
    const shot = await page.screenshot({ path: `.screenshots/scroll-perf/download-act-${index}.png`, fullPage: false });
    downloadShots.push(shot);
  }
  console.log("Studio Evolution readings:");
  for (const s of downloadSamples) console.log(s);
  const changedFrames = downloadShots.slice(1).filter((shot, index) => Buffer.compare(shot, downloadShots[index]) !== 0).length;
  console.log(`Studio Evolution frame changes: ${changedFrames}/${Math.max(downloadShots.length - 1, 1)}`);
}

if (errors.length > 0) {
  console.log("\nERRORS:");
  for (const e of errors) console.log(e);
} else {
  console.log("\nNo runtime errors.");
}
await browser.close();
