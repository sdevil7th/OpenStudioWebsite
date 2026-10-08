import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

const ready = async (page) => {
  await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
  await page.locator("[data-openstudio-loader]").waitFor({ state: "detached" });
};

// Read the painted transforms, not just class names: the raster-logo regression
// passed the previous lifecycle tests because they never examined the artwork.
const animationFrame = (loader, time) => loader.evaluate((element, time) => {
  for (const animation of element.getAnimations({ subtree: true })) {
    animation.pause();
    animation.currentTime = time;
  }
  const matrix = (element) => {
    const m = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return { a: m.a, b: m.b, x: m.e, y: m.f };
  };
  return {
    pieces: [...element.querySelectorAll("[data-os-loader-piece]")].map(matrix),
    rotation: matrix(element.querySelector(".os-instant-loader__svg")),
  };
}, time);

const assertAnimation = async (loader) => {
  await loader.waitFor({ state: "visible" });
  assert.equal(await loader.locator("img").count(), 0, "the loader must not rotate a raster app tile");
  const entrance = await animationFrame(loader, 0);
  assert.equal(entrance.pieces.length, 2);
  assert.ok(entrance.pieces[0].x > 0 && entrance.pieces[0].y < 0);
  assert.ok(entrance.pieces[1].x < 0 && entrance.pieces[1].y > 0);
  const joined = await animationFrame(loader, 800);
  for (const piece of joined.pieces) assert.ok(Math.abs(piece.x) < 0.01 && Math.abs(piece.y) < 0.01);
  assert.ok(Math.abs(joined.rotation.b) < 0.01, "rotation begins after the pieces join");
  const turning = await animationFrame(loader, 1550);
  assert.ok(Math.abs(turning.rotation.b - 1) < 0.01, "the joined mark turns a quarter revolution in 750 ms");
};

const gateRequest = async (page, pattern) => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await page.route(pattern, async (route) => {
    await gate;
    await route.continue();
  });
  return release;
};

test("production loader artwork and AI layouts", { timeout: 120_000 }, async (t) => {
  const server = await preview({ preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  let browser;
  try {
    browser = await chromium.launch();
    const base = server.resolvedUrls.local[0];
    const newContext = async (options) => {
      const context = await browser.newContext(options);
      await context.route("https://**/*", (route) => route.abort());
      await context.addInitScript(() => window.top === window && localStorage.setItem(
        "openstudio.analytics-consent.v1", JSON.stringify({ choice: "rejected", time: Date.now() }),
      ));
      return context;
    };

    for (const width of [390, 1440]) {
      await t.test(`${width}px refresh and uncached navigation assemble then rotate`, async () => {
        const context = await newContext({ viewport: { width, height: 900 }, reducedMotion: "no-preference" });
        let releaseEntry;
        let releaseRoute;
        try {
          const page = await context.newPage();
          releaseEntry = await gateRequest(page, /\/assets\/index-[^/]+\.js$/);
          await page.goto(base, { waitUntil: "commit" });
          await assertAnimation(page.locator("#openstudio-instant-loader"));
          releaseEntry();
          await ready(page);
          releaseRoute = await gateRequest(page, /\/assets\/AiPage-[^/]+\.js$/);
          if (width <= 900) await page.getByRole("button", { name: "Open navigation" }).click();
          await page.getByRole("navigation", { name: width <= 900 ? "Primary mobile" : "Primary", exact: true })
            .getByRole("link", { name: "AI Tools", exact: true }).click();
          await assertAnimation(page.locator("[data-openstudio-loader]"));
          releaseRoute();
          await page.getByRole("heading", { name: "AI that runs on your own machine, and only if you install it." }).waitFor();
          await ready(page);
        } finally {
          releaseEntry?.();
          releaseRoute?.();
          await context.close();
        }
      });
    }

    await t.test("reduced motion displays the joined mark without movement", async () => {
      const context = await newContext({ reducedMotion: "reduce" });
      let release;
      try {
        const page = await context.newPage();
        release = await gateRequest(page, /\/assets\/index-[^/]+\.js$/);
        await page.goto(base, { waitUntil: "commit" });
        const loader = page.locator("#openstudio-instant-loader");
        await loader.waitFor();
        assert.equal(await loader.locator("[data-os-loader-piece]").count(), 2);
        assert.equal(await loader.evaluate((e) => e.getAnimations({ subtree: true }).length), 0);
        const frame = await animationFrame(loader, 0);
        for (const piece of frame.pieces) assert.deepEqual(piece, { a: 1, b: 0, x: 0, y: 0 });
      } finally {
        release?.();
        await context.close();
      }
    });

    await t.test("a direct legal visit keeps content visible and retains the loader for later navigation", async () => {
      const context = await newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
      let release;
      try {
        const page = await context.newPage();
        await page.goto(base + "privacy");
        await ready(page);
        assert.equal(await page.locator("[data-openstudio-loader]").count(), 0);
        release = await gateRequest(page, /\/assets\/AiPage-[^/]+\.js$/);
        await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "AI Tools" }).click();
        await assertAnimation(page.locator("[data-openstudio-loader]"));
        release();
        await ready(page);
      } finally {
        release?.();
        await context.close();
      }
    });

    for (const width of [390, 768, 900, 901, 1440]) {
      await t.test(`${width}px AI setup cards retain spacing and the table scrolls within its card`, async () => {
        const context = await newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
        try {
          const page = await context.newPage();
          await page.goto(base + "ai");
          await ready(page);
          await page.evaluate(() => document.fonts.ready);
          const cards = page.locator("section.sp-card").filter({ has: page.getByRole("heading", { name: /^(Stable Audio 3 Medium|MiniMax Music 3)$/ }) });
          assert.equal(await cards.count(), 2);
          for (const card of await cards.all()) {
            await card.scrollIntoViewIfNeeded();
            const metrics = await card.evaluate((element) => {
              const card = element.getBoundingClientRect();
              const heading = element.querySelector("h2");
              const paragraph = element.querySelector("p");
              const titleBox = heading.getBoundingClientRect();
              const textBox = paragraph.getBoundingClientRect();
              return {
                inset: titleBox.left - card.left,
                topInset: titleBox.top - card.top,
                bottomInset: card.bottom - textBox.bottom,
                textFits: textBox.right < card.right,
                weight: Number(getComputedStyle(heading).fontWeight),
                columns: getComputedStyle(element.parentElement).gridTemplateColumns.split(" ").length,
              };
            });
            assert.ok(metrics.inset >= 20 && metrics.topInset >= 20 && metrics.bottomInset >= 20, JSON.stringify(metrics));
            assert.ok(metrics.textFits && metrics.weight >= 600);
            assert.equal(metrics.columns, width <= 640 ? 1 : 2);
          }
          const table = page.locator("#models table");
          assert.equal(await table.locator("tbody tr").count(), 5);
          const statuses = await table.locator("tbody tr td:last-child").allTextContents();
          assert.equal(statuses.filter((text) => text === "Guided setup · Diffusers").length, 3);
          assert.doesNotMatch(await page.locator("#sp-main").innerText(), /next (desktop )?release/i);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
          if (width < 900) {
            assert.ok(await table.evaluate((e) => e.parentElement.scrollWidth > e.parentElement.clientWidth));
          }
        } finally {
          await context.close();
        }
      });
    }
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
  }
});
