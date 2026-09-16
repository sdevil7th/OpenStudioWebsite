import assert from "node:assert/strict";
import { test } from "node:test";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { createServer } from "vite";

const root = resolve(import.meta.dirname, "..");
const ready = async (page) => {
  await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
  await page.locator("#sp-main h1").waitFor();
};

test("redesigned navigation, fragments, decorative stages and chunk failures", { timeout: 150000 }, async (t) => {
  const server = await createServer({
    root,
    cacheDir: resolve(root, "node_modules/.vite-redesign-tests"),
    logLevel: "error",
    server: { host: "127.0.0.1", port: 0, strictPort: true },
  });
  let browser;
  try {
    await server.listen();
    const base = server.resolvedUrls.local[0];
    browser = await chromium.launch();
    const context = async (options) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce", ...options });
      await ctx.route("https://**/*", (r) => r.abort());
      await ctx.addInitScript(() => {
        try {
          localStorage.setItem(
            "openstudio.analytics-consent.v1",
            JSON.stringify({ choice: "rejected", time: Date.now() }),
          );
        } catch {
          /* third-party frames can deny storage */
        }
      });
      return ctx;
    };
    await t.test("mobile menu closes on Escape, navigation and desktop resize", async () => {
      const ctx = await context({ viewport: { width: 390, height: 844 } });
      try {
        const page = await ctx.newPage();
        await page.goto(base);
        await ready(page);
        const toggle = page.locator(".sp-nav__menu-toggle");
        await toggle.click();
        await page.getByRole("navigation", { name: "Primary mobile" }).waitFor();
        await page.keyboard.press("Escape");
        assert.equal(await toggle.getAttribute("aria-expanded"), "false");
        assert.equal(await toggle.evaluate((e) => e === document.activeElement), true);
        await toggle.click();
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.locator("#sp-mobile-navigation").waitFor({ state: "detached" });
        await page.setViewportSize({ width: 390, height: 844 });
        await toggle.click();
        await page
          .getByRole("navigation", { name: "Primary mobile" })
          .getByRole("link", { name: "Docs", exact: true })
          .click();
        await page.locator("#sp-mobile-navigation").waitFor({ state: "detached" });
        assert.ok(page.url().endsWith("/docs"));
        await ready(page);
        await toggle.click();
        await page.getByRole("navigation", { name: "Primary mobile" })
          .getByRole("link", { name: "Docs", exact: true }).click();
        await page.locator("#sp-mobile-navigation").waitFor({ state: "detached" });
        assert.ok(page.url().endsWith("/docs"));
        // The separate Releases link also closes on same-route keyboard activation.
        await toggle.click();
        await page.getByRole("navigation", { name: "Primary mobile" }).getByRole("link", { name: "Releases" }).click();
        await ready(page);
        await toggle.click();
        const releases = page.getByRole("navigation", { name: "Primary mobile" }).getByRole("link", { name: "Releases" });
        await releases.focus();
        await page.keyboard.press("Enter");
        await page.locator("#sp-mobile-navigation").waitFor({ state: "detached" });
      } finally {
        await ctx.close();
      }
    });
    await t.test("malformed hashes cannot crash the app; delayed article anchors scroll correctly", async () => {
      const ctx = await context();
      try {
        const page = await ctx.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(base + "#%E0%A4%A");
        await ready(page);
        assert.deepEqual(errors, []);
        await page.route("**/src/features/docs/content/nam-rack-setup.ts*", async (route) => {
          await new Promise((r) => setTimeout(r, 500));
          await route.continue();
        });
        await page.goto(base + "docs/nam-rack-setup#presets-and-recall");
        await ready(page);
        const target = page.locator("#presets-and-recall");
        await target.waitFor();
        await page.waitForFunction(() => {
          const r = document.getElementById("presets-and-recall")?.getBoundingClientRect();
          return r && r.top >= 0 && r.top < 300;
        });
        assert.deepEqual(errors, []);
      } finally {
        await ctx.close();
      }
    });
    await t.test("failed animation runtime leaves the real still frame and navigation usable", async () => {
      const ctx = await context({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
      try {
        const page = await ctx.newPage();
        let failed = 0;
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.route("**/node_modules/.vite-redesign-tests/deps/gsap.js*", (route) => {
          failed++;
          return route.abort();
        });
        await page.goto(base + "features");
        await ready(page);
        await page.waitForFunction(
          () => document.querySelector('[data-stage="arrangement"]')?.getAttribute("data-live") === "true",
        );
        await page.waitForFunction(() => performance.getEntriesByType("resource").some((entry) => entry.name.includes("gsap.js")));
        assert.ok(failed > 0);
        await page.locator('[data-stage="piano-roll"] .daw-session__stage').waitFor({ state: "visible" });
        assert.equal(await page.locator(".sp-live-stage__poster").count(), 0);
        assert.deepEqual(errors, []);
        assert.equal(await page.locator("#sp-main h1").innerText(), "Every feature in OpenStudio.");
        assert.ok((await page.locator(".daw-session__stage[inert]").count()) > 0);
        const controls = page.locator(".daw-session__stage button").first();
        await controls.evaluate((e) => e.focus());
        assert.equal(await controls.evaluate((e) => e === document.activeElement), false);
        await page.locator(".sp-nav__links").getByRole("link", { name: "Docs", exact: true }).click();
        await page.getByRole("heading", { name: "Documentation.", exact: true }).waitFor();
      } finally {
        await ctx.close();
      }
    });
    for (const [route, pattern, body] of [
      ["docs/lua-scripting", "**/src/features/docs/content/lua-scripting.ts*", ".sp-doc-body"],
      [
        "blog/building-openstudio-nam-rack",
        "**/src/data/generatedBlogContent/2026-07-26-building-openstudio-nam-rack.ts*",
        ".sp-article",
      ],
    ])
      await t.test(route + " recovers through the reload action", async () => {
        const ctx = await context();
        try {
          const page = await ctx.newPage();
          let requests = 0;
          await page.route(pattern, (r) => (++requests === 1 ? r.abort() : r.continue()));
          await page.goto(base + route);
          await ready(page);
          await page.getByRole("alert").waitFor();
          await page.getByRole("button", { name: "Reload article" }).click();
          await page
            .locator(body + " h2")
            .first()
            .waitFor();
          assert.ok(requests >= 2);
          assert.equal(await page.getByRole("alert").count(), 0);
        } finally {
          await ctx.close();
        }
      });
    await t.test("showcase tabs have one tab stop and keyboard selection", async () => {
      const ctx = await context();
      try {
        const page = await ctx.newPage();
        await page.goto(base);
        await ready(page);
        const tabs = page.getByRole("tablist", { name: "Highlights" });
        await tabs.scrollIntoViewIfNeeded();
        const first = tabs.getByRole("tab").first();
        await first.focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await tabs.locator('[aria-selected="true"]').count(), 1);
        assert.equal(await tabs.locator('[tabindex="0"]').count(), 1);
        assert.equal(await tabs.getByRole("tab").nth(1).getAttribute("aria-selected"), "true");
        assert.equal(
          await tabs
            .getByRole("tab")
            .nth(1)
            .evaluate((e) => e === document.activeElement),
          true,
        );
      } finally {
        await ctx.close();
      }
    });
  } finally {
    await browser?.close();
    await server.close();
  }
});
