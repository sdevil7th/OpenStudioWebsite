import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

test("prerendered privacy choices preserve stored consent before application JavaScript", { timeout: 60_000 }, async t => {
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0 } });
  const browser = await chromium.launch();
  try {
    for (const [name, record, visible] of [
      ["fresh", null, true],
      ["accepted", { choice: "accepted", time: Date.now() }, false],
      ["rejected", { choice: "rejected", time: Date.now() }, false],
      ["expired", { choice: "accepted", time: 0 }, true],
      ["future", { choice: "accepted", time: Date.now() + 86400000 }, true],
      ["malformed", { choice: "yes", time: Date.now() }, true],
    ]) await t.test(name, async () => {
      const context = await browser.newContext();
      await context.route("https://**/*", route => route.abort());
      await context.addInitScript(value => {
        if (value) localStorage.setItem("openstudio.analytics-consent.v1", JSON.stringify(value));
      }, record);
      let release;
      const held = new Promise(resolve => { release = resolve; });
      await context.route("**/assets/*.js", async route => { await held; await route.continue().catch(() => {}); });
      const page = await context.newPage();
      try {
        await page.goto(server.resolvedUrls.local[0] + "privacy", { waitUntil: "commit" });
        await page.locator("[data-privacy-prerender]").waitFor({ state: "attached" });
        await page.waitForFunction(() => document.readyState !== "loading" || document.querySelector("#openstudio-privacy + script"));
        assert.equal(await page.locator("#openstudio-privacy section").isVisible(), visible);
        assert.equal(await page.evaluate(() => Boolean(window.__openstudioAppReady)), false);
        release();
        await page.waitForFunction(() => window.__openstudioAppReady);
        const banner = page.getByRole("region", { name: "Website privacy choices" });
        assert.equal(await banner.count(), visible ? 1 : 0, "exactly one banner after the handoff");
        assert.equal(await page.locator("[data-privacy-prerender]").count(), 0);
        if (visible) {
          await page.getByRole("button", { name: "Reject analytics", exact: true }).click();
          await banner.waitFor({ state: "detached" });
        }
        await page.getByRole("button", { name: "Privacy choices", exact: true }).click();
        await banner.waitFor();
      } finally { release(); await context.close(); }
    });
    await t.test("a failed application download removes the inert panel", async () => {
      const context = await browser.newContext();
      try {
        await context.route("**/assets/*.js", route => route.abort());
        const page = await context.newPage();
        await page.goto(server.resolvedUrls.local[0] + "privacy");
        await page.waitForFunction(() => window.__openstudioStaticRouteRestored);
        assert.equal(await page.locator("#openstudio-privacy section").isVisible(), false);
        assert.equal(await page.locator("h1").isVisible(), true);
      } finally { await context.close(); }
    });
    await t.test("no JavaScript leaves legal text readable without inert consent controls", async () => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      try {
        const page = await context.newPage();
        await page.goto(server.resolvedUrls.local[0] + "privacy");
        assert.equal(await page.locator("#openstudio-privacy section").isVisible(), false);
        assert.equal(await page.locator("h1").isVisible(), true);
      } finally { await context.close(); }
    });
  } finally {
    await browser.close();
    await new Promise(resolve => server.httpServer.close(resolve));
  }
});
