import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

const manifest = JSON.parse(readFileSync(new URL("../dist/.vite/manifest.json", import.meta.url), "utf8"));
const animationPath = "/" + manifest["node_modules/gsap/index.js"].file;
const clockSelector = '.sp-home-session [title="Click to toggle between time and beats"]';

// Check React-controlled artwork, not canvas pixels: meters can repaint even
// when the scene's GSAP timeline never starts. Two separate changes exclude a
// one-time measurement or switch from the prerendered frame.
async function expectPlayback(page, scene) {
  await scene.scrollIntoViewIfNeeded();
  // NAM tiles can all fit in a tall phone viewport, while only two are allowed
  // to play at once. Move earlier rows offscreen so this scene gets a slot.
  await scene.evaluate((element) => {
    const top = element.closest(".sp-live-stage").getBoundingClientRect().top;
    const header = document.querySelector("header").getBoundingClientRect().height;
    window.scrollBy({ top: top - header - 16, behavior: "instant" });
  });
  await scene.waitFor({ state: "visible" });
  const element = await scene.elementHandle();
  for (let sample = 0; sample < 2; sample += 1) {
    const before = await scene.innerHTML();
    await page.waitForFunction(({ element, before }) => element.innerHTML !== before,
      { element, before }, { timeout: 8000 });
  }
}

test("phone illustrations animate at every size and pause outside the viewport", { timeout: 180_000 }, async (t) => {
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  let browser;
  try {
    browser = await chromium.launch();
    for (const width of [320, 390, 430]) await t.test(`${width}px fresh phone visit`, async (phoneTest) => {
      const context = await browser.newContext({
        viewport: { width, height: 844 }, isMobile: true, hasTouch: true,
        deviceScaleFactor: 2, reducedMotion: "no-preference",
      });
      try {
        await context.route("https://**/*", (route) => route.abort());
        await context.addInitScript(() => localStorage.setItem(
          "openstudio.analytics-consent.v1", JSON.stringify({ choice: "rejected", time: Date.now() }),
        ));
        const page = await context.newPage();
        const errors = [];
        const engineRequests = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("request", (request) => {
          if (new URL(request.url()).pathname === animationPath) engineRequests.push(request.url());
        });
        await page.goto(server.resolvedUrls.local[0]);
        await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
        const clock = page.locator(clockSelector);
        const before = await clock.innerText();
        // No tap, scroll or refresh is allowed to wake up initial playback.
        await page.waitForFunction(({ selector, before }) => document.querySelector(selector)?.textContent !== before,
          { selector: clockSelector, before }, { timeout: 8000 });
        assert.equal(engineRequests.length, 1);

        if (width === 390) {
          await page.locator("footer").scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          const paused = await clock.innerText();
          await page.waitForTimeout(900);
          assert.equal(await clock.innerText(), paused, "offscreen phone hero pauses");
          await clock.scrollIntoViewIfNeeded();
          await page.waitForFunction(({ selector, paused }) => document.querySelector(selector)?.textContent !== paused,
            { selector: clockSelector, paused }, { timeout: 3000 });

          await page.getByRole("tab", { name: "NAM Rack" }).click();
          await expectPlayback(page, page.locator('[data-stage="nam-chain"] .daw-session__stage'));
          await page.getByRole("tab", { name: "Local AI" }).click();
          await expectPlayback(page, page.locator('.sp-showcase [data-stage="arrangement"] .daw-session__stage'));

          await page.goto(server.resolvedUrls.local[0] + "features");
          await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
          for (const stage of ["arrangement", "piano-roll", "mixer", "plugin-window", "pitch-editor", "render-dialog"]) {
            await phoneTest.test(`${stage} plays on a phone`, async () => {
              await expectPlayback(page, page.locator(`[data-stage="${stage}"] .daw-session__stage`));
            });
          }

          await page.goto(server.resolvedUrls.local[0] + "nam-rack");
          await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
          const racks = page.locator('[data-stage="nam-rack"] .daw-session__stage');
          assert.ok(await racks.count() > 1, "cover the rack tour and its smaller tiles");
          for (const [index, scene] of (await racks.all()).entries()) {
            await phoneTest.test(`NAM rack scene ${index + 1} plays on a phone`, async () => expectPlayback(page, scene));
          }
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        assert.deepEqual(errors, []);
      } finally {
        await context.close();
      }
    });
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
  }
});
