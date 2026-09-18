import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

const selector = ".sp-hero-aura__bg";
const pixels = (page) => page.locator(`${selector} canvas`).evaluate((canvas) => canvas.toDataURL());
const ready = (page) => page.waitForFunction(() => window.__openstudioIntroHidden && window.__openstudioAppReady);
const waitPlaying = (page, playing) => page.waitForFunction(({ selector, playing }) => {
  const element = document.querySelector(selector);
  return element?.dataset.playing === String(playing);
}, { selector, playing });

test("local hero artwork has a static fallback and only animates while visible", { timeout: 90_000 }, async (t) => {
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  const browser = await chromium.launch();
  const base = server.resolvedUrls.local[0];
  try {
    for (const width of [390, 1440, 3840]) await t.test(`${width}px playback, offscreen, visibility and motion preference`, async () => {
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: "no-preference" });
      try {
        const external = [];
        context.on("request", (request) => {
          if (new URL(request.url()).origin !== new URL(base).origin) external.push(request.url());
        });
        await context.route("https://**/*", (route) => route.abort());
        const page = await context.newPage();
        await page.goto(base);
        await ready(page);
        assert.equal(await page.locator(`${selector} iframe`).count(), 0);
        await waitPlaying(page, true);
        const surface = await page.locator(`${selector} canvas`).evaluate((canvas) => ({
          left: canvas.getBoundingClientRect().left,
          width: canvas.getBoundingClientRect().width,
          pixels: canvas.width * canvas.height,
        }));
        assert.equal(surface.left, 0);
        assert.equal(surface.width, width, "curtains reach both viewport edges, including 4K");
        assert.ok(surface.pixels <= 200_000, "large screens must not increase per-frame raster work");
        const initial = await page.locator(`${selector} canvas`).evaluate((canvas) =>
          Array.from(canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data));
        await page.waitForTimeout(1200);
        const movement = await page.locator(`${selector} canvas`).evaluate((canvas, initial) => {
          const next = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
          return next.reduce((sum, value, index) => sum + Math.abs(value - initial[index]), 0) / next.length;
        }, initial);
        assert.ok(movement > 3, `curtains visibly evolve, rather than almost-static drift (${movement})`);

        await page.locator("footer").scrollIntoViewIfNeeded();
        await waitPlaying(page, false);
        const offscreen = await pixels(page);
        await page.waitForTimeout(350);
        assert.deepEqual(await pixels(page), offscreen, "offscreen surfaces stop moving");
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await waitPlaying(page, true);

        // Deterministic hidden-document lifecycle: headless tabs do not reliably
        // become hidden on bringToFront. Verify the handler with the real canvas pixels.
        await page.evaluate(() => {
          Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
          document.dispatchEvent(new Event("visibilitychange"));
        });
        await waitPlaying(page, false);
        const hidden = await pixels(page);
        await page.waitForTimeout(350);
        assert.deepEqual(await pixels(page), hidden);
        await page.evaluate(() => {
          delete document.visibilityState;
          document.dispatchEvent(new Event("visibilitychange"));
        });
        await waitPlaying(page, true);

        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.waitForFunction((selector) => getComputedStyle(document.querySelector(`${selector} canvas`)).visibility === "hidden", selector);
        await page.waitForTimeout(50);
        const reduced = await pixels(page);
        await page.waitForTimeout(350);
        assert.deepEqual(await pixels(page), reduced);
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await waitPlaying(page, true);
        assert.deepEqual(external, [], "the home page needs no third-party renderer, font or scene requests");
      } finally { await context.close(); }
    });

    await t.test("no JavaScript keeps the pastel rest frame", async () => {
      const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "no-preference" });
      try {
        const page = await context.newPage();
        await page.goto(base);
        const backdrop = page.locator(selector);
        assert.equal(await backdrop.getAttribute("aria-hidden"), "true");
        const image = backdrop.locator("img");
        assert.equal(await image.evaluate((image) => image.complete && image.naturalWidth === 480), true);
        assert.equal(await backdrop.locator("canvas").evaluate((canvas) => getComputedStyle(canvas).visibility), "hidden");
        assert.equal(await backdrop.evaluate((element) => getComputedStyle(element).opacity), "1");
      } finally { await context.close(); }
    });

    await t.test("canvas failure leaves the generated artwork visible", async () => {
      const context = await browser.newContext();
      try {
        await context.addInitScript(() => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function(...args) {
            return this.classList.contains("sp-hero-aura__canvas") ? null : original.apply(this, args);
          };
        });
        const page = await context.newPage();
        await page.goto(base);
        await ready(page);
        const backdrop = page.locator(selector);
        assert.equal(await backdrop.locator("img").evaluate((image) => image.complete && image.naturalWidth > 0), true);
        assert.equal(await backdrop.locator("canvas").evaluate((canvas) => getComputedStyle(canvas).visibility), "hidden");
      } finally { await context.close(); }
    });

    await t.test("delayed uncached home navigation retains the loader then paints local artwork", async () => {
      const context = await browser.newContext({ reducedMotion: "no-preference" });
      let release;
      try {
        const page = await context.newPage();
        await page.goto(`${base}features`);
        await ready(page);
        const gate = new Promise((resolve) => { release = resolve; });
        await page.route(/\/assets\/HomePage-[^/]+\.js$/, async (route) => {
          await gate;
          await route.continue();
        });
        await page.locator('header a[href="/"]').first().click();
        await page.locator("[data-openstudio-loader]").waitFor({ state: "visible" });
        assert.equal(await page.locator("[data-os-loader-piece]").count(), 2);
        release();
        await page.locator("[data-openstudio-loader]").waitFor({ state: "detached" });
        await page.locator(selector).waitFor({ state: "attached" });
        await waitPlaying(page, true);
        assert.equal(await page.locator(selector).evaluate((element) => getComputedStyle(element).opacity), "1");
      } finally { release?.(); await context.close(); }
    });
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
  }
});
