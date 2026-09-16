import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

test("image requests follow card widths at standard and high pixel densities", { timeout: 90_000 }, async (t) => {
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  let browser;
  try {
    browser = await chromium.launch();
    const base = server.resolvedUrls.local[0];
    for (const width of [390, 768, 1024, 1440]) for (const dpr of [1, 2]) {
      await t.test(`${width}px at DPR ${dpr}`, async () => {
        for (const [path, selector] of [
          ["features", ".sp-grid-2--start img"],
          ["nam-rack", ".sp-blog-mini__shot"],
        ]) {
          const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: dpr, reducedMotion: "reduce" });
          try {
            await context.route("https://**/*", (route) => route.abort());
            // Keep the real posters visible, as they are when optional artwork fails.
            await context.route(/\/assets\/(?:Arrangement|Mixer|PianoRoll|PluginWindow|PitchEditor|RenderDialog|NamRack|NamChain)Stage-[^/]+\.js$/, (route) => route.abort());
            await context.addInitScript(() => localStorage.setItem(
              "openstudio.analytics-consent.v1", JSON.stringify({ choice: "rejected", time: Date.now() }),
            ));
            const page = await context.newPage();
            await page.goto(base + path);
            await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
            const images = page.locator(selector);
            assert.ok(await images.count());
            await images.evaluateAll(async (images) => {
              for (const image of images) image.loading = "eager";
              await Promise.all(images.map((image) => image.decode()));
            });
            for (const entry of await images.evaluateAll((images) => images.map((image) => ({
              width: image.getBoundingClientRect().width,
              currentSrc: image.currentSrc,
              decoded: image.naturalWidth > 0,
            })))) {
              assert.ok(entry.decoded);
              const selected = Number(new URL(entry.currentSrc).pathname.match(/-(\d+)\.webp$/)?.[1]);
              assert.ok(selected > 0, entry.currentSrc);
              assert.ok(selected <= Math.max(320, Math.ceil(entry.width * dpr * 1.6)), JSON.stringify(entry));
              assert.ok(selected >= entry.width * dpr * 0.9, "the selected variant must also retain sufficient resolution");
            }
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
          } finally {
            await context.close();
          }
        }
      });
    }
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
  }
});
