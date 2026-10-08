import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium, devices } from "playwright";
import { preview } from "vite";

// Opt-in live-provider smoke check. Never run this as part of offline CI.
const { values } = parseArgs({ options: {
  url: { type: "string" }, json: { type: "string" },
  mobile: { type: "boolean", default: false },
  headed: { type: "boolean", default: false },
  "sample-ms": { type: "string", default: "3000" },
} });
const sampleMs = Number(values["sample-ms"]);
assert.ok(Number.isFinite(sampleMs) && sampleMs >= 1000 && sampleMs <= 10_000, "--sample-ms must be 1000–10000");
const selector = ".sp-hero-aura__frame";
const result = { measuredAt: new Date().toISOString(), samples: [], checks: {}, errors: [] };
let server;
let browser;

// Instrument callbacks without creating an extra animation loop. Worker paint
// calls are distinct from callbacks: a paused renderer may still schedule RAF.
function instrument() {
  const counts = { callbacks: 0, callbackMs: 0, paints: 0 };
  globalThis.__auraReview = counts;
  const raf = globalThis.requestAnimationFrame.bind(globalThis);
  globalThis.requestAnimationFrame = callback => raf(time => {
    const start = performance.now();
    counts.callbacks++;
    try { callback(time); } finally { counts.callbackMs += performance.now() - start; }
  });
  if (typeof OffscreenCanvasRenderingContext2D !== "undefined") {
    const clear = OffscreenCanvasRenderingContext2D.prototype.clearRect;
    OffscreenCanvasRenderingContext2D.prototype.clearRect = function (...args) {
      counts.paints++;
      return clear.apply(this, args);
    };
  }
}

try {
  if (!values.url) server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0 } });
  result.url = values.url ?? server.resolvedUrls.local[0];
  result.profile = values.mobile ? "mobile" : "desktop";
  // Full Chromium's tab lifecycle, rather than the legacy headless shell.
  browser = await chromium.launch({ channel: "chromium", headless: !values.headed });
  const context = await browser.newContext({
    ...(values.mobile ? devices["Pixel 5"] : {}),
    viewport: values.mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  });
  await context.route("**/.netlify/scripts/cdp", route => route.fulfill({ contentType: "text/javascript", body: "" }));
  await context.addInitScript(() => {
    if (top === window) localStorage.setItem("openstudio.analytics-consent.v1", JSON.stringify({ choice: "rejected", time: Date.now() }));
  });
  await context.addInitScript(instrument);
  const page = await context.newPage();
  const workers = new Map();
  page.on("worker", worker => {
    if (worker.url().startsWith("https://aura.promad.design/")) {
      // Handle rejection immediately even if the page is still becoming ready.
      workers.set(worker, worker.evaluate(instrument).then(() => null, error => error.message));
    }
  });
  page.on("pageerror", error => result.errors.push(error.message));
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: values.mobile ? 4 : 2 });
  await page.goto(result.url, { waitUntil: "domcontentloaded" });
  await page.locator(`${selector}[data-ready=true]`).waitFor({ state: "attached", timeout: 40_000 });
  result.readyMs = await page.evaluate(() => performance.now());
  const frame = await page.locator(selector).elementHandle();
  for (const failure of await Promise.all(workers.values())) assert.equal(failure, null, "Worker instrumentation failed");
  assert.ok(workers.size > 0, "No Aura worker observed; provider renderer changed, update instrumentation before claiming verification");
  const read = async () => ({
    host: await page.evaluate(() => ({ ...window.__auraReview, visibility: document.visibilityState })),
    workers: await Promise.all([...workers.keys()].map(async worker => ({ url: worker.url(), ...await worker.evaluate(() => globalThis.__auraReview) }))),
    metrics: Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(m => [m.name, m.value])),
  });
  const sample = async name => {
    const before = await read();
    const start = performance.now();
    await new Promise(resolve => setTimeout(resolve, sampleMs));
    const after = await read();
    const delta = (a, b) => Object.fromEntries(["callbacks", "callbackMs", "paints"].map(key => [key, b[key] - a[key]]));
    const entry = {
      name, elapsedMs: performance.now() - start,
      visibility: after.host.visibility, host: delta(before.host, after.host),
      mainTaskMs: (after.metrics.TaskDuration - before.metrics.TaskDuration) * 1000,
      mainScriptMs: (after.metrics.ScriptDuration - before.metrics.ScriptDuration) * 1000,
      mainLayoutMs: (after.metrics.LayoutDuration - before.metrics.LayoutDuration) * 1000,
      workers: after.workers.map((worker, i) => ({ url: worker.url, ...delta(before.workers[i], worker) })),
    };
    if (name === "background-tab") {
      assert.equal(before.host.visibility, "hidden");
      assert.equal(after.host.visibility, "hidden");
    }
    result.samples.push(entry);
    console.log(JSON.stringify(entry));
    return entry.workers.reduce((sum, worker) => sum + worker.paints, 0);
  };
  await page.waitForTimeout(1500);
  assert.ok(await sample("visible") > 0, "Live worker must actually draw before testing pause");
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await page.waitForFunction(() => document.querySelector(".sp-hero-aura__bg").dataset.playing === "false");
  await page.waitForTimeout(1500);
  assert.equal(await sample("offscreen"), 0, "Worker must stop drawing offscreen (callback scheduling is measured separately)");
  result.checks.offscreen = "passed";
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(1500);
  assert.ok(await sample("resumed") > 0, "Worker must resume drawing");
  assert.ok(await frame.evaluate(el => el === document.querySelector(".sp-hero-aura__frame")), "Scrolling must retain the original iframe");
  result.checks.resume = "passed";

  const other = await context.newPage();
  await other.goto("about:blank");
  // Request normal focus behavior, but verify visibility below: another CDP
  // session can keep focus emulation active even after these requests.
  await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: false });
  const otherCdp = await context.newCDPSession(other);
  await otherCdp.send("Emulation.setFocusEmulationEnabled", { enabled: false });
  await other.bringToFront();
  try {
    // Check a genuine browser visibility transition. Never synthesize this
    // property: changing only the parent doesn't hide its cross-origin child.
    await page.waitForFunction(() => document.visibilityState === "hidden", null, { timeout: 2500, polling: 100 });
    await new Promise(resolve => setTimeout(resolve, 1500));
    assert.equal(await sample("background-tab"), 0, "Worker must stop drawing in a real background tab");
    result.checks.backgroundTab = "passed";
  } catch (error) {
    if (await page.evaluate(() => document.visibilityState) === "hidden") throw error;
    result.checks.backgroundTab = "unverified: browser kept both tabs visible; native browser verification is still required";
  } finally { await other.close(); await page.bringToFront(); }
  await page.waitForTimeout(1500);
  assert.ok(await sample("foreground-tab") > 0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator(selector).waitFor({ state: "detached" });
  result.checks.reducedMotion = "passed";
  assert.deepEqual(result.errors, [], "Unexpected page errors");
} catch (error) {
  result.failure = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.httpServer.close(resolve));
  if (values.json) {
    await mkdir(path.dirname(values.json), { recursive: true });
    await writeFile(values.json, `${JSON.stringify(result, null, 2)}\n`);
  }
  console.log(JSON.stringify({ checks: result.checks, failure: result.failure }));
}
