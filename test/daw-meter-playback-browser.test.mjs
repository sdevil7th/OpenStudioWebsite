import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

test("meter canvases stop drawing offscreen, hidden and in reduced motion, and resume in place", { timeout: 60_000 }, async t => {
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0 } });
  const browser = await chromium.launch();
  try {
    for (const width of [390, 1440]) await t.test(`${width}px viewport`, async () => {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.route("https://**/*", route => route.abort());
      await context.addInitScript(() => {
        localStorage.setItem("openstudio.analytics-consent.v1", JSON.stringify({ choice: "rejected", time: Date.now() }));
        const counts = new WeakMap();
        const fill = CanvasRenderingContext2D.prototype.fillRect;
        CanvasRenderingContext2D.prototype.fillRect = function(x, y, w, h) {
          if (this.canvas.matches("canvas[data-meter-source]") && x === 0 && y === 0 && w === this.canvas.width && h === this.canvas.height) {
            counts.set(this.canvas, (counts.get(this.canvas) ?? 0) + 1);
          }
          return fill.call(this, x, y, w, h);
        };
        window.meterPaints = () => [...document.querySelectorAll("canvas[data-meter-source]")].reduce((sum, canvas) => sum + (counts.get(canvas) ?? 0), 0);
      });
      const page = await context.newPage();
      try {
        await page.goto(server.resolvedUrls.local[0]);
        await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
        const meter = page.locator("canvas[data-meter-source]").first();
        await meter.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => window.meterPaints() > 5);
        await meter.evaluate(el => { window.originalMeter = el; });
        const sample = () => page.evaluate(() => window.meterPaints());
        const stopped = async () => {
          await page.waitForTimeout(250);
          const before = await sample();
          await page.waitForTimeout(800);
          assert.equal(await sample(), before, "no canvas draw work while paused");
        };
        const resumed = async () => {
          const before = await sample();
          await page.waitForFunction(previous => window.meterPaints() > previous + 4, before);
          assert.equal(await meter.evaluate(el => el === window.originalMeter), true);
        };
        await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
        await stopped();
        await meter.scrollIntoViewIfNeeded();
        await resumed();
        // Exercise our visibility handler explicitly; not a physical OS-tab test.
        await page.evaluate(() => {
          Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
          document.dispatchEvent(new Event("visibilitychange"));
        });
        await stopped();
        await page.evaluate(() => {
          delete document.visibilityState;
          document.dispatchEvent(new Event("visibilitychange"));
        });
        await resumed();
        await page.emulateMedia({ reducedMotion: "reduce" });
        await stopped();
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await resumed();
      } finally { await context.close(); }
    });
  } finally {
    await browser.close();
    await new Promise(resolve => server.httpServer.close(resolve));
  }
});
