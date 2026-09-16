import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

const manifest = JSON.parse(readFileSync(new URL("../dist/.vite/manifest.json", import.meta.url), "utf8"));
const homePath = "/" + manifest["src/pages/HomePage.tsx"].file;
const animationPath = "/" + manifest["node_modules/gsap/index.js"].file;
const clockSelector = '.sp-home-session [title="Click to toggle between time and beats"]';

test("illustrations start after slow first loads and uncached navigation", { timeout: 120_000 }, async (t) => {
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  let browser;
  try {
    browser = await chromium.launch();
    const base = server.resolvedUrls.local[0];
    const cases = [
      { name: "first route arriving after the initial loader timeout", width: 1440, slowEntry: true },
      { name: "uncached desktop navigation", width: 1440 },
      { name: "uncached tablet navigation", width: 768 },
      { name: "uncached navigation with reduced motion", width: 1440, reducedMotion: true },
    ];
    for (const entry of cases) await t.test(entry.name, async () => {
      const context = await browser.newContext({
        viewport: { width: entry.width, height: 1000 },
        reducedMotion: entry.reducedMotion ? "reduce" : "no-preference",
      });
      let release;
      const gate = new Promise((resolve) => { release = resolve; });
      try {
        await context.route("https://**/*", (route) => route.abort());
        await context.route("**" + homePath, async (route) => {
          await gate;
          await route.continue().catch(() => undefined);
        });
        await context.addInitScript(() => localStorage.setItem(
          "openstudio.analytics-consent.v1", JSON.stringify({ choice: "rejected", time: Date.now() }),
        ));
        const page = await context.newPage();
        const errors = [];
        const animationRequests = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("request", (request) => {
          if (new URL(request.url()).pathname === animationPath) animationRequests.push(request.url());
        });
        if (entry.slowEntry) {
          await page.goto(base, { waitUntil: "domcontentloaded" });
          // Exercise the real timeout, without dispatching a synthetic ready event.
          await page.waitForFunction(() => window.__openstudioIntroHidden);
          assert.notEqual(await page.evaluate(() => window.__openstudioAppReady), true);
        } else {
          // Legal pages finish the intro immediately. Home has not been fetched.
          await page.goto(base + "privacy");
          await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
          await page.locator('header a[href="/"]').click();
        }
        await page.locator('[data-openstudio-loader]:not(#openstudio-instant-loader)').waitFor({ state: "visible" });
        release();
        await page.locator("[data-openstudio-loader]").waitFor({ state: "detached" });
        await page.locator(clockSelector).waitFor({ state: "visible" });
        if (entry.reducedMotion) {
          const before = await page.locator(clockSelector).innerText();
          await page.waitForTimeout(3200);
          assert.equal(await page.locator(clockSelector).innerText(), before);
          assert.deepEqual(animationRequests, [], "reduced motion does not load the animation engine");
        } else {
          // A static reduced-motion frame also says "playing", so check the clock
          // actually advances without a reload, scroll, click or other wake-up.
          await page.waitForFunction(() => document.querySelector(".sp-home-session .daw-session")?.dataset.transport === "playing", null, { timeout: 8000 });
          const before = await page.locator(clockSelector).innerText();
          await page.waitForFunction(({ selector, before }) => document.querySelector(selector)?.textContent !== before,
            { selector: clockSelector, before }, { timeout: 3000 });
          assert.equal(animationRequests.length, 1);
          await context.unroute("**" + homePath);
          await page.reload();
          await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
          await page.waitForFunction(() => document.querySelector(".sp-home-session .daw-session")?.dataset.transport === "playing");
        }
        assert.deepEqual(errors, []);
      } finally {
        release();
        await context.close();
      }
    });
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
  }
});
