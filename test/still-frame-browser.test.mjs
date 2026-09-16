import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

const manifest = JSON.parse(readFileSync(new URL("../dist/.vite/manifest.json", import.meta.url), "utf8"));
const animationPath = "/" + manifest["node_modules/gsap/index.js"].file;

test("illustrations keep the same rendered frame while the animation engine loads", { timeout: 120_000 }, async (t) => {
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  const browser = await chromium.launch();
  try {
    for (const width of [390, 768, 1440]) await t.test(`${width}px: delayed animation does not replace the scene`, async () => {
      for (const path of ["", "features", "ai", "nam-rack"]) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "no-preference" });
        let release;
        const pending = new Promise((resolve) => { release = resolve; });
        try {
          await context.route("https://**/*", (route) => route.abort());
          await context.route("**" + animationPath, async (route) => {
            await pending;
            await route.continue().catch(() => undefined);
          });
          await context.addInitScript(() => localStorage.setItem(
            "openstudio.analytics-consent.v1", JSON.stringify({ choice: "rejected", time: Date.now() }),
          ));
          const page = await context.newPage();
          const animationRequest = path === "" && width >= 768
            ? page.waitForRequest((request) => new URL(request.url()).pathname === animationPath)
            : undefined;
          const errors = [];
          page.on("pageerror", (error) => errors.push(error.message));
          await page.goto(server.resolvedUrls.local[0] + path);
          await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
          const frames = page.locator(".daw-session__stage");
          assert.ok(await frames.count() > 0);
          const first = frames.first();
          await first.scrollIntoViewIfNeeded();
          await first.waitFor({ state: "visible" });
          const before = await first.boundingBox();
          const identity = await first.elementHandle();
          assert.equal(await page.locator(".sp-live-stage__poster").count(), 0);
          assert.equal(await page.locator(".sp-live-stage img[src*='/screenshots/'], .sp-home-session img").count(), 0);
          assert.ok(await first.locator("svg, button, canvas").count() > 0, "the real controls exist before GSAP arrives");
          if (animationRequest) {
            await animationRequest;
            assert.equal(await page.locator(".sp-home-session .daw-session").getAttribute("data-transport"), "stopped");
          }
          release();
          if (animationRequest) {
            await page.waitForFunction(() => document.querySelector(".sp-home-session .daw-session")?.dataset.transport === "playing");
          } else {
            await page.waitForTimeout(1100);
          }
          assert.equal(await identity.evaluate((element) => element.isConnected), true, "the animation updates the original scene");
          const after = await first.boundingBox();
          for (const key of ["width", "height"]) assert.ok(Math.abs(before[key] - after[key]) < 1, `${path} ${key}`);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
          assert.deepEqual(errors, []);
        } finally {
          release();
          await context.close();
        }
      }
    });
    await t.test("JavaScript-disabled pages contain static artwork and inert controls", async () => {
      const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
      try {
        const page = await context.newPage();
        for (const path of ["", "features", "ai", "nam-rack"]) {
          await page.goto(server.resolvedUrls.local[0] + path);
          assert.ok(await page.locator(".daw-session__stage[inert]").count() > 0);
          await page.locator(".daw-session").first().waitFor({ state: "visible" });
          assert.equal(await page.locator(".sp-live-stage__poster").count(), 0);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
          if (path === "nam-rack") {
            const staticPlacement = await page.locator(".nam-rack-artboard").evaluateAll(
              (boards) => boards.map((board) => board.style.transform),
            );
            // No-JS frames fit the complete fixed design into their SVG slot;
            // compare its artwork placement with that composition at desktop.
            const liveContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
            try {
              await liveContext.route("https://**/*", (route) => route.abort());
              const livePage = await liveContext.newPage();
              await livePage.goto(server.resolvedUrls.local[0] + path);
              await livePage.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
              for (const stage of await livePage.locator(".daw-session").all()) await stage.scrollIntoViewIfNeeded();
              const livePlacement = await livePage.locator(".nam-rack-artboard").evaluateAll(
                (boards) => boards.map((board) => board.style.transform),
              );
              assert.ok(staticPlacement.length > 0);
              assert.deepEqual(staticPlacement, livePlacement, "NAM artwork fits the same canvas before browser measurements");
            } finally {
              await liveContext.close();
            }
          }
        }
      } finally {
        await context.close();
      }
    });
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
  }
});
