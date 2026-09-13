import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const consentKey = "openstudio.analytics-consent.v1";
const consentAge = 180 * 24 * 60 * 60 * 1000;
const providerPattern = /https:\/\/([^/]+\.)?(googletagmanager\.com|google-analytics\.com|clarity\.ms)\//;

// An observable stand-in for Clarity's asynchronous command queue. No test
// sends visits, interactions or identifiers to either analytics provider.
const clarityScript = `
  (() => {
    const queued = window.clarity?.q ?? [];
    const state = window.__testClarity = { running: true, consent: null, commands: [] };
    window.clarity = (command, value) => {
      state.commands.push([command, value]);
      if (command === 'consentv2') state.consent = value;
      if (command === 'stop') state.running = false;
      if (command === 'start') state.running = true;
    };
    queued.forEach(args => window.clarity(...args));
  })();
`;

const waitForApp = async page => {
  await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
  await page.locator("footer").waitFor();
};

const waitForProviders = page => page.waitForFunction(() => Boolean(window.__testClarity && window.gtag));
const banner = page => page.getByRole("region", { name: "Website privacy choices" });
const reopen = async page => {
  await page.getByRole("button", { name: "Privacy choices", exact: true }).click();
  await banner(page).waitFor();
};
const state = page => page.evaluate(async () => ({
  choice: (await import("/src/lib/analyticsConsent.ts")).readAnalyticsConsent(),
  gaDisabled: window["ga-disable-G-CONSENTTEST"] ?? false,
  gaConsent: (window.dataLayer ?? []).map(args => Array.from(args)).filter(args => args[0] === "consent").at(-1)?.[2] ?? null,
  clarityRunning: window.__testClarity?.running ?? false,
  clarityConsent: window.__testClarity?.consent ?? null,
}));

const assertProviders = async (page, accepted, choice = accepted ? "accepted" : "rejected") => {
  const current = await state(page);
  assert.equal(current.choice, choice);
  assert.equal(current.gaDisabled, !accepted);
  assert.equal(current.gaConsent.analytics_storage, accepted ? "granted" : "denied");
  assert.equal(current.gaConsent.ad_storage, "denied");
  assert.equal(current.gaConsent.ad_user_data, "denied");
  assert.equal(current.gaConsent.ad_personalization, "denied");
  assert.equal(current.clarityRunning, accepted);
  assert.deepEqual(current.clarityConsent, { analytics_Storage: accepted ? "granted" : "denied", ad_Storage: "denied" });
};

test("analytics consent browser flows", { timeout: 120_000 }, async t => {
  const cacheDir = await mkdtemp(resolve(tmpdir(), "openstudio-consent-test-"));
  const server = await createServer({
    root,
    cacheDir,
    configFile: resolve(root, "vite.config.ts"),
    logLevel: "error",
    define: {
      "import.meta.env.VITE_ANALYTICS_ENABLED": JSON.stringify("true"),
      "import.meta.env.VITE_GA_MEASUREMENT_ID": JSON.stringify("G-CONSENTTEST"),
      "import.meta.env.VITE_CLARITY_PROJECT_ID": JSON.stringify("consenttest"),
    },
    server: { host: "127.0.0.1", port: 0, strictPort: true },
  });
  let browser;

  try {
    await server.listen();
    browser = await chromium.launch();
    const baseUrl = `http://127.0.0.1:${server.httpServer.address().port}`;
    const createContext = async (options = {}) => {
      const context = await browser.newContext({ reducedMotion: "reduce", ...options });
      const requests = [];
      await context.route(providerPattern, route => {
        const url = route.request().url();
        requests.push(url);
        return route.fulfill({ status: 200, contentType: "application/javascript", body: url.includes("clarity.ms/tag/") ? clarityScript : "/* GA bootstrap is observable through dataLayer. */" });
      });
      const page = await context.newPage();
      return { context, page, requests };
    };

    await t.test("fresh rejection clears legacy cookies without loading analytics", async () => {
      const { context, page, requests } = await createContext();
      try {
        await context.addCookies([
          { name: "_ga", value: "legacy", url: baseUrl },
          { name: "_clck", value: "legacy", url: baseUrl },
          { name: "site-preference", value: "keep", url: baseUrl },
        ]);
        await page.goto(`${baseUrl}/privacy`);
        await waitForApp(page);
        assert.deepEqual((await context.cookies()).map(cookie => cookie.name), ["site-preference"]);
        // Also cover cookies that appear after startup and before Reject.
        await page.evaluate(() => { document.cookie = "_ga=legacy; Path=/"; document.cookie = "_clck=legacy; Path=/"; });
        await page.getByRole("button", { name: "Reject analytics", exact: true }).click();
        await banner(page).waitFor({ state: "detached" });
        assert.deepEqual((await context.cookies()).map(cookie => cookie.name), ["site-preference"]);
        await page.waitForTimeout(2000);
        assert.deepEqual(requests, []);
        await reopen(page);
        assert.match(await banner(page).innerText(), /Current choice: analytics rejected/);
        assert.equal(await page.evaluate(() => document.activeElement?.textContent), "Website analytics");
        await page.keyboard.press("Escape");
        assert.equal(await page.evaluate(() => document.activeElement?.textContent.trim()), "Privacy choices");
      } finally { await context.close(); }
    });

    for (const blockedStorage of [false, true]) {
      await t.test(`accept, revoke and reaccept without reload${blockedStorage ? " when storage fails" : ""}`, async () => {
        const { context, page, requests } = await createContext();
        try {
          if (blockedStorage) await context.addInitScript(() => {
            Storage.prototype.setItem = () => { throw new DOMException("Storage unavailable", "QuotaExceededError"); };
          });
          await page.goto(`${baseUrl}/privacy?test=private#example`);
          await waitForApp(page);
          await page.evaluate(() => { window.__testPageMarker = "same page"; });
          await page.getByRole("button", { name: "Accept analytics", exact: true }).click();
          await waitForProviders(page);
          await assertProviders(page, true);
          const locations = await page.evaluate(() => window.dataLayer.map(args => Array.from(args)).filter(args => args[1] === "page_view").map(args => args[2].page_location));
          assert.deepEqual(locations, [`${baseUrl}/privacy`]);
          await page.evaluate(() => { document.cookie = "_ga=test; Path=/"; document.cookie = "_clck=test; Path=/"; });
          await reopen(page);
          await page.getByRole("button", { name: "Reject analytics", exact: true }).click();
          await assertProviders(page, false);
          assert.equal(await page.evaluate(() => document.cookie), "");
          assert.equal(await page.evaluate(async () => (await import("/src/lib/analytics.ts")).trackEvent("must-not-send")), false);
          await reopen(page);
          await page.getByRole("button", { name: "Accept analytics", exact: true }).click();
          await assertProviders(page, true);
          assert.equal(await page.evaluate(() => window.__testPageMarker), "same page");
          assert.equal(requests.length, 2, "reuse providers instead of inserting duplicate tags");
        } finally { await context.close(); }
      });
    }

    await t.test("other-tab decisions and whole-storage clearing update providers and UI", async () => {
      const { context, page } = await createContext();
      try {
        await page.goto(`${baseUrl}/privacy`);
        await waitForApp(page);
        await page.getByRole("button", { name: "Reject analytics", exact: true }).click();
        const other = await context.newPage();
        await other.goto(`${baseUrl}/privacy`);
        await waitForApp(other);
        await reopen(other);
        await other.getByRole("button", { name: "Accept analytics", exact: true }).click();
        await waitForProviders(page);
        await reopen(page);
        assert.match(await banner(page).innerText(), /Current choice: analytics allowed/);
        await assertProviders(page, true);
        await reopen(other);
        await other.getByRole("button", { name: "Reject analytics", exact: true }).click();
        await page.waitForFunction(() => window.__testClarity?.running === false);
        assert.match(await banner(page).innerText(), /Current choice: analytics rejected/);
        await assertProviders(page, false);
        await reopen(other);
        await other.getByRole("button", { name: "Accept analytics", exact: true }).click();
        await page.waitForFunction(() => window.__testClarity?.running === true);
        await other.evaluate(() => localStorage.clear());
        await page.waitForFunction(() => window.__testClarity?.running === false);
        await assertProviders(page, false, null);
        await banner(page).waitFor();
        assert.doesNotMatch(await banner(page).innerText(), /Current choice:/);
      } finally { await context.close(); }
    });

    await t.test("saved consent expiry stops providers and asks again in the open page", async () => {
      const { context, page } = await createContext();
      try {
        await page.clock.install();
        await context.addInitScript(({ key, age }) => {
          localStorage.setItem(key, JSON.stringify({ choice: "accepted", time: Date.now() - age + 60_000 }));
        }, { key: consentKey, age: consentAge });
        await page.goto(`${baseUrl}/privacy`);
        await waitForApp(page);
        await waitForProviders(page);
        await assertProviders(page, true);
        await page.clock.fastForward(61_000);
        await banner(page).waitFor();
        await assertProviders(page, false, null);
        await page.getByRole("button", { name: "Accept analytics", exact: true }).click();
        await assertProviders(page, true);
        // A suspended tab may resume with its wall clock advanced but timers not fired.
        await page.clock.setSystemTime(new Date(Date.now() + consentAge + 120_000));
        await page.evaluate(() => window.dispatchEvent(new Event("focus")));
        await banner(page).waitFor();
        await assertProviders(page, false, null);
      } finally { await context.close(); }
    });

    await t.test("revocation cancels deferred loading and discards pre-consent activity", async () => {
      const { context, page, requests } = await createContext();
      try {
        await page.goto(`${baseUrl}/privacy`);
        await waitForApp(page);
        await page.evaluate(async () => {
          const consent = await import("/src/lib/analyticsConsent.ts");
          const analytics = await import("/src/lib/analytics.ts");
          analytics.trackEvent("before-choice");
          consent.setAnalyticsConsent("accepted");
          analytics.trackEvent("before-revocation");
          consent.setAnalyticsConsent("rejected");
        });
        await page.waitForTimeout(2000);
        assert.deepEqual(requests, []);
        await reopen(page);
        await page.getByRole("button", { name: "Accept analytics", exact: true }).click();
        await waitForProviders(page);
        const events = await page.evaluate(() => window.dataLayer.map(args => Array.from(args)).filter(args => args[0] === "event").map(args => args[1]));
        assert.deepEqual(events, ["page_view"]);
      } finally { await context.close(); }
    });

    await t.test("revoking while Clarity downloads stops it when the script arrives", async () => {
      const { context, page } = await createContext();
      let releaseScript;
      try {
        let scriptRequested;
        const requested = new Promise(resolveRequest => { scriptRequested = resolveRequest; });
        const held = new Promise(resolveScript => { releaseScript = resolveScript; });
        await page.route("https://www.clarity.ms/tag/consenttest", async route => {
          scriptRequested();
          await held;
          await route.fulfill({ contentType: "application/javascript", body: clarityScript });
        });
        await page.goto(`${baseUrl}/privacy`);
        await waitForApp(page);
        await page.getByRole("button", { name: "Accept analytics", exact: true }).click();
        await requested;
        await reopen(page);
        await page.getByRole("button", { name: "Reject analytics", exact: true }).click();
        releaseScript();
        await waitForProviders(page);
        await assertProviders(page, false);
        await reopen(page);
        await page.getByRole("button", { name: "Accept analytics", exact: true }).click();
        await assertProviders(page, true);
      } finally {
        releaseScript?.();
        await context.close();
      }
    });

    await t.test("download and navigation dialogs cover the consent banner", async () => {
      const { context, page } = await createContext({ viewport: { width: 390, height: 844 } });
      try {
        await page.goto(`${baseUrl}/download`);
        await waitForApp(page);
        await page.getByRole("button", { name: "Download Windows", exact: true }).click();
        const dialog = page.getByRole("dialog");
        await dialog.waitFor();
        const stacking = await page.evaluate(() => ({
          banner: Number(getComputedStyle(document.querySelector('section[aria-label="Website privacy choices"]')).zIndex),
          dialog: Number(getComputedStyle(document.querySelector('[role="dialog"]')).zIndex),
        }));
        assert.ok(stacking.banner < stacking.dialog, "visible banner buttons must never be painted above the modal's click targets");
        const download = dialog.getByRole("button", { name: "I understand, download for Windows", exact: true });
        assert.equal(await download.evaluate(element => {
          const rect = element.getBoundingClientRect();
          return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
        }), true);
        await page.getByRole("button", { name: "Close download instructions", exact: true }).click();
        await page.getByRole("button", { name: "Open navigation", exact: true }).click();
        await page.getByRole("dialog", { name: "Navigate OpenStudio" }).waitFor();
        await page.keyboard.press("Escape");
        await banner(page).waitFor();
        await page.getByRole("button", { name: "Reject analytics", exact: true }).click();
        await banner(page).waitFor({ state: "detached" });
        await reopen(page);
        await page.getByRole("button", { name: "Keep current choice", exact: true }).click();
        assert.equal(await page.evaluate(() => document.activeElement?.textContent.trim()), "Privacy choices");
      } finally { await context.close(); }
    });
  } finally {
    await browser?.close();
    await server.close();
    assert.equal(dirname(cacheDir), resolve(tmpdir()), "remove only the allocated test cache");
    await rm(cacheDir, { recursive: true, force: true });
  }
});
