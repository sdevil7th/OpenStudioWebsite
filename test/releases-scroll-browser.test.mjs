import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

const snapshot = JSON.parse(readFileSync(new URL("../public/github/repository.json", import.meta.url), "utf8"));
const desktop = snapshot.releases.filter(release => /^v\d/.test(release.tagName));
const cardSelector = tag => `.sp-releases-layout > div > [id="${tag}"]`;
const railSelector = '.sp-releases-layout nav[aria-label="Release versions"]';

const waitForReveal = (page, tag) => page.waitForFunction(selector => {
  const element = document.querySelector(selector);
  return element?.dataset.spIn === "true" && getComputedStyle(element).opacity === "1";
}, cardSelector(tag), { timeout: 4000 });

const openReleases = async (page, base, navigation = false) => {
  await page.goto(base + (navigation ? "privacy" : "releases"), { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
  if (navigation) {
    await page.locator('footer a[href="/releases"]').click();
    await page.locator(".sp-releases-layout").waitFor();
    await page.locator("[data-openstudio-loader]").waitFor({ state: "detached" });
  }
};

test("release scrolling reveals every card and keeps the desktop version rail usable", { timeout: 180_000 }, async t => {
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  let browser;
  try {
    browser = await chromium.launch();
    for (const { width, height, motion } of [
      { width: 390, height: 844 }, { width: 768, height: 1000 },
      { width: 900, height: 900 }, { width: 901, height: 900 },
      { width: 1440, height: 540 }, { width: 1440, height: 900, motion: "reduce" },
    ]) await t.test(`${width}x${height}, ${motion ?? "normal motion"}`, async () => {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: motion ?? "no-preference" });
      try {
        await context.route("https://**/*", route => route.abort());
        await context.addInitScript(() => localStorage.setItem("openstudio.analytics-consent.v1",
          JSON.stringify({ choice: "rejected", time: Date.now() })));
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        // Client navigation has no prerendered data-sp-in attributes to mask
        // observer failures on offscreen or especially long release cards.
        await openReleases(page, server.resolvedUrls.local[0], true);
        const releases = width === 390 || height === 540
          ? desktop : [desktop[0], desktop[1], desktop.at(-1)];
        for (const release of releases) {
          await page.locator(cardSelector(release.tagName)).evaluate(element =>
            element.scrollIntoView({ behavior: "instant", block: "start" }));
          await waitForReveal(page, release.tagName);
        }
        if (width > 900) {
          // Test inside the release section. At its end, sticky positioning
          // correctly yields to the runtimes/endpoints below the grid.
          await page.locator(cardSelector(desktop[1].tagName)).evaluate(element =>
            element.scrollIntoView({ behavior: "instant", block: "start" }));
          const rail = page.locator(railSelector);
          await page.waitForFunction(selector => getComputedStyle(document.querySelector(selector)).opacity === "1", railSelector);
          const before = await rail.boundingBox();
          assert.ok(Math.abs(before.y - 84) <= 1, `version rail pins below the header: ${before.y}`);
          assert.ok(before.y + before.height <= height, "version rail stays inside the viewport");
          const scrollBefore = await page.evaluate(() => window.scrollY);
          await page.mouse.wheel(0, -600);
          await page.waitForFunction(y => window.scrollY < y, scrollBefore);
          const after = await rail.boundingBox();
          assert.ok(Math.abs(after.y - before.y) <= 1, "version rail remains pinned while the document scrolls");
          const lastLink = rail.getByRole("link", { name: desktop.at(-1).tagName, exact: true });
          await lastLink.focus();
          assert.ok((await lastLink.boundingBox()).y < height, "keyboard focus scrolls the oldest version into view");
          if (height === 540) assert.ok(await rail.evaluate(element => element.scrollTop > 0), "short viewports scroll inside the rail");
          await lastLink.click();
          await page.waitForFunction(tag => Math.abs(document.getElementById(tag).getBoundingClientRect().top - 84) < 2,
            desktop.at(-1).tagName);
          await waitForReveal(page, desktop.at(-1).tagName);
        } else {
          assert.equal(await page.locator(".sp-releases-layout > aside").isVisible(), false);
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        assert.deepEqual(errors, []);
      } finally {
        await context.close();
      }
    });
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
  }
});

test("delayed release data registers new cards and reveals notes taller than the viewport", { timeout: 90_000 }, async t => {
  const latest = {
    ...desktop[0], id: Math.max(...snapshot.releases.map(release => release.id)) + 1,
    tagName: "v9.8.7", name: "Async release", htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/v9.8.7",
    assets: [], assetCount: 0, body: "Release notes inserted while this card is on screen.",
  };
  const oldest = {
    ...latest, id: latest.id + 1, tagName: "v0.0.8", name: "Async earlier release",
    htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/v0.0.8",
    body: "Earlier release notes inserted below the viewport.",
  };
  const delayedSnapshot = {
    ...snapshot, latestRelease: latest, releaseCount: snapshot.releaseCount + 2,
    releases: [latest, ...snapshot.releases.map(release => release.id === desktop[1].id ? {
      ...release, body: Array.from({ length: 200 }, (_, index) => `Long release note paragraph ${index + 1}.`).join("\n\n"),
    } : release), oldest],
  };
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  let browser;
  try {
    browser = await chromium.launch();
    for (const entry of [
      { width: 390 }, { width: 1440, navigation: true },
      { width: 1440, motion: "reduce" }, { width: 1440, noObserver: true },
      { width: 1440, failedResponse: true },
    ]) await t.test(JSON.stringify(entry), async () => {
      const context = await browser.newContext({ viewport: { width: entry.width, height: 844 }, reducedMotion: entry.motion ?? "no-preference" });
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      try {
        await context.route("https://**/*", route => route.abort());
        await context.addInitScript(noObserver => {
          localStorage.setItem("openstudio.analytics-consent.v1", JSON.stringify({ choice: "rejected", time: Date.now() }));
          if (noObserver) delete window.IntersectionObserver;
        }, entry.noObserver ?? false);
        await context.route("**/github/repository.json", async route => {
          await gate;
          await route.fulfill(entry.failedResponse
            ? { status: 503, body: "Unavailable" }
            : { contentType: "application/json", body: JSON.stringify(delayedSnapshot) });
        });
        const page = await context.newPage();
        await openReleases(page, server.resolvedUrls.local[0], entry.navigation);
        // Ensure classification has already happened before the response arrives.
        await waitForReveal(page, desktop[0].tagName);
        const response = page.waitForResponse(response => new URL(response.url()).pathname === "/github/repository.json");
        release();
        assert.equal((await response).status(), entry.failedResponse ? 503 : 200);
        if (entry.failedResponse) {
          await page.locator(cardSelector(desktop.at(-1).tagName)).evaluate(element =>
            element.scrollIntoView({ behavior: "instant", block: "start" }));
          await waitForReveal(page, desktop.at(-1).tagName);
          assert.match(await page.locator("#sp-main").innerText(), /Snapshot from/);
          return;
        }
        await page.locator(cardSelector(latest.tagName)).waitFor();
        await waitForReveal(page, latest.tagName);
        const tall = page.locator(cardSelector(desktop[1].tagName));
        assert.ok((await tall.boundingBox()).height > 844 / 0.15, "fixture exceeds the old observer threshold");
        // Check an existing observed card whose async notes changed its height.
        await tall.evaluate(element => element.scrollIntoView({ behavior: "instant", block: "start" }));
        await waitForReveal(page, desktop[1].tagName);
        // Check a newly inserted offscreen card through both scrolling and anchors.
        if (entry.width > 900) {
          await page.locator(railSelector).getByRole("link", { name: oldest.tagName, exact: true }).click();
        } else {
          await page.locator(cardSelector(oldest.tagName)).evaluate(element =>
            element.scrollIntoView({ behavior: "instant", block: "start" }));
        }
        await waitForReveal(page, oldest.tagName);
        assert.match(await page.locator(cardSelector(oldest.tagName)).innerText(), /Earlier release notes inserted/);
        // Previously revealed content stays visible when scrolling back.
        await page.locator(cardSelector(latest.tagName)).evaluate(element =>
          element.scrollIntoView({ behavior: "instant", block: "start" }));
        await waitForReveal(page, latest.tagName);
      } finally {
        release();
        await context.close();
      }
    });
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
  }
});
