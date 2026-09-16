import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

const routes = [
  "/",
  ...readFileSync(new URL("../dist/_redirects", import.meta.url), "utf8")
    .trim()
    .split("\n")
    .map((line) => line.split(" ")[0]),
];

test("every redesigned production route fits mobile, tablet and desktop", { timeout: 180_000 }, async (t) => {
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  const browser = await chromium.launch();
  const base = server.resolvedUrls.local[0];
  try {
    for (const width of [390, 768, 1440])
      await t.test(`${width}px layouts`, async () => {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
        try {
          await context.route("https://**/*", (route) => route.abort());
          await context.addInitScript(() => {
            try {
              localStorage.setItem(
                "openstudio.analytics-consent.v1",
                JSON.stringify({ choice: "rejected", time: Date.now() }),
              );
            } catch {
              /* sandboxed third-party frame */
            }
          });
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", (error) => errors.push(error.message));
          for (const route of routes) {
            const response = await page.goto(new URL(route, base).href);
            assert.equal(response.status(), 200, route);
            await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
            await page.locator("#sp-main h1").waitFor();
            if (route.startsWith("/docs/")) await page.locator(".sp-doc-body h2").first().waitFor();
            if (route.startsWith("/blog/")) await page.locator(".sp-article h2").first().waitFor();
            await page.evaluate(() => document.fonts.ready);
            const clipping = await page.evaluate(() => {
              const viewport = innerWidth;
              const clipped = [
                ...document.querySelectorAll(
                  "#sp-main h1, .sp-doc-body > p, .sp-doc-body > ul, .sp-doc-body > ol, .sp-doc-body .sp-inline-code",
                ),
              ]
                .filter((element) => {
                  const rect = element.getBoundingClientRect();
                  return rect.left < -1 || rect.right > viewport + 1;
                })
                .map((element) => element.textContent.slice(0, 90));
              return { overflow: document.documentElement.scrollWidth > viewport, clipped };
            });
            assert.deepEqual(clipping, { overflow: false, clipped: [] }, `${width}px ${route}`);
            if (route === "/") {
              const layout = await page
                .locator("#sp-main .sp-row")
                .evaluateAll((rows) => rows.map((row) => getComputedStyle(row).gridTemplateColumns.split(" ").length));
              assert.ok(
                layout.every((columns) => columns === (width <= 900 ? 1 : 2)),
                `${width}px home session rows: ${layout}`,
              );
              assert.equal(
                await page
                  .locator(".sp-showcase .sp-eyebrow--teal")
                  .evaluate((element) => getComputedStyle(element).color),
                "rgb(0, 234, 210)",
              );
            }
            assert.equal(await page.getByRole("main").count(), 1, route);
            assert.deepEqual(errors, [], route);
          }
        } finally {
          await context.close();
        }
      });
    for (const width of [320, 360, 390, 430, 639, 640, 768, 900, 901, 1440]) {
      await t.test(`${width}px system requirements keep every value readable`, async () => {
        const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
        try {
          await context.route("https://**/*", (route) => route.abort());
          const page = await context.newPage();
          await page.goto(base + "download");
          await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
          await page.evaluate(() => document.fonts.ready);
          const card = page.locator("#requirements .sp-card");
          const details = card.locator(":scope > dl");
          const comparison = card.locator(":scope > div");
          if (width < 640) {
            assert.equal(await comparison.isVisible(), false);
            const rows = details.locator(":scope > div");
            assert.deepEqual(await rows.locator(":scope > dt").allTextContents(), ["Processor", "Memory", "Storage", "OS / Audio"]);
            for (const row of await rows.all()) {
              assert.deepEqual(await row.locator("dd dt").allTextContents(), ["Minimum", "Recommended"]);
              const values = row.locator("dd dd");
              assert.equal(await values.count(), 2);
              for (const value of await values.all()) {
                assert.equal(await value.isVisible(), true);
                assert.ok((await value.innerText()).trim().length > 0);
                const fits = await value.evaluate((element) => {
                  const rect = element.getBoundingClientRect();
                  return rect.left >= 0 && rect.right <= innerWidth
                    && element.scrollWidth <= element.clientWidth + 1
                    && element.scrollHeight <= element.clientHeight + 1;
                });
                assert.equal(fits, true, await value.innerText());
              }
            }
            assert.equal(await card.evaluate((element) => element.scrollWidth > element.clientWidth), false);
          } else {
            assert.equal(await details.isVisible(), false);
            assert.equal(await comparison.isVisible(), true);
            assert.equal(await comparison.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length), 3);
          }
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        } finally {
          await context.close();
        }
      });
    }
    await t.test("mobile requirements are readable without JavaScript", async () => {
      const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
      try {
        const page = await context.newPage();
        await page.goto(base + "download");
        const values = page.locator("#requirements dl dd dd");
        assert.equal(await values.count(), 8);
        for (const value of await values.all()) assert.equal(await value.isVisible(), true);
        assert.equal(await page.locator("#requirements .sp-card").evaluate((element) => element.scrollWidth > element.clientWidth), false);
      } finally {
        await context.close();
      }
    });
    await t.test("legacy aliases preserve their destinations and unknown routes return 404", async () => {
      const context = await browser.newContext({ reducedMotion: "reduce" });
      try {
        const page = await context.newPage();
        for (const [alias, canonical] of [
          ["/v2", "/"],
          ["/v2/features", "/features"],
          ["/v2/docs/keyboard-shortcuts", "/docs/keyboard-shortcuts"],
          ["/blogs", "/blog"],
          ["/github", "/community"],
          ["/contact", "/community#contact"],
          ["/contact?ref=footer", "/community?ref=footer#contact"],
          ["/v2/docs?ref=legacy", "/docs?ref=legacy"],
        ]) {
          const response = await context.request.get(new URL(alias, base).href, { maxRedirects: 0 });
          assert.equal(response.status(), 301, alias);
          assert.equal(response.headers().location, canonical, alias);
        }
        for (const route of ["/missing", "/docs/missing", "/blog/missing"]) {
          const response = await page.goto(new URL(route, base).href);
          assert.equal(response.status(), 404, route);
          await page.getByRole("heading", { name: "Page not found" }).waitFor();
          assert.match(await page.locator('meta[name="robots"]').getAttribute("content"), /noindex/);
        }
      } finally {
        await context.close();
      }
    });
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())));
  }
});
