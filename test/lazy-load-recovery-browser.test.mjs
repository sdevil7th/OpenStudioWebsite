import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer as createNetServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer as createViteServer } from "vite";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const getFreePort = () =>
  new Promise((resolvePort, reject) => {
    const server = createNetServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === "object") {
          resolvePort(address.port);
          return;
        }

        reject(new Error("Could not allocate a local test port"));
      });
    });
  });

const waitForApp = async (page) => {
  await page.waitForFunction(() => window.__openstudioAppReady === true);
  await page.waitForFunction(
    () =>
      window.__openstudioIntroHidden === true ||
      !document.querySelector("[data-openstudio-loader]"),
    undefined,
    { timeout: 12_000 },
  );
};

test(
  "lazy UI fallbacks recover from failed chunks and viewport changes",
  { timeout: 120_000 },
  async () => {
    const port = await getFreePort();
    const cacheDir = await mkdtemp(resolve(tmpdir(), "openstudio-vite-test-"));
    const server = await createViteServer({
      cacheDir,
      configFile: resolve(rootDir, "vite.config.ts"),
      logLevel: "error",
      root: rootDir,
      server: {
        host: "127.0.0.1",
        port,
        strictPort: true,
      },
    });

    let browser;
    try {
      await server.listen();
      browser = await chromium.launch();
      const baseUrl = `http://127.0.0.1:${port}`;

      const navContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      const navPage = await navContext.newPage();
      let navChunkRequests = 0;
      await navPage.route("**/src/components/MobileNavSheet.tsx*", async (route) => {
        navChunkRequests += 1;
        if (navChunkRequests === 1) {
          await route.abort("failed");
          return;
        }
        await route.continue();
      });

      await navPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
      await waitForApp(navPage);
      await navPage.getByRole("button", { name: "Open navigation" }).click();
      await navPage.getByRole("dialog", { name: "Navigate OpenStudio" }).waitFor();

      assert.equal(navChunkRequests, 1);
      assert.equal(
        await navPage.getByRole("dialog", { name: "Navigate OpenStudio" }).count(),
        1,
      );
      assert.deepEqual(
        await navPage.locator("#root").evaluate((element) => ({
          ariaHidden: element.getAttribute("aria-hidden"),
          inert: element.inert,
        })),
        { ariaHidden: "true", inert: true },
      );
      await navPage.keyboard.press("Escape");
      await navPage.getByRole("dialog", { name: "Navigate OpenStudio" }).waitFor({
        state: "detached",
      });
      assert.equal(
        await navPage.getByRole("button", { name: "Open navigation" }).evaluate(
          (element) => document.activeElement === element,
        ),
        true,
      );
      assert.deepEqual(
        await navPage.locator("#root").evaluate((element) => ({
          ariaHidden: element.getAttribute("aria-hidden"),
          inert: element.inert,
        })),
        { ariaHidden: null, inert: false },
      );

      await navPage.getByRole("button", { name: "Open navigation" }).click();
      const loadedNavDialog = navPage.getByRole("dialog", { name: "Navigate OpenStudio" });
      await loadedNavDialog.waitFor();
      await loadedNavDialog.getByRole("link", { name: /OpenStudio/ }).click();
      await loadedNavDialog.waitFor({ state: "detached" });
      assert.equal(navChunkRequests, 1);

      await navPage.getByRole("button", { name: "Open navigation" }).click();
      await navPage.getByRole("dialog", { name: "Navigate OpenStudio" }).waitFor();
      await navPage.setViewportSize({ width: 1440, height: 900 });
      await navPage.getByRole("dialog", { name: "Navigate OpenStudio" }).waitFor({
        state: "detached",
      });
      await navContext.close();

      const blogContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      const blogPage = await blogContext.newPage();
      let articleChunkRequests = 0;
      await blogPage.route(
        "**/src/data/generatedBlogContent/2026-07-26-building-openstudio-nam-rack.ts*",
        async (route) => {
          articleChunkRequests += 1;
          if (articleChunkRequests === 1) {
            await route.abort("failed");
            return;
          }
          await route.continue();
        },
      );

      await blogPage.goto(`${baseUrl}/blogs/building-openstudio-nam-rack`, {
        waitUntil: "domcontentloaded",
      });
      await waitForApp(blogPage);
      await blogPage.getByRole("alert").waitFor();
      await blogPage.getByRole("button", { name: "Retry article" }).click();
      await blogPage.locator("[data-blog-body] h2").first().waitFor({ timeout: 12_000 });

      assert.equal(articleChunkRequests, 2);
      assert.equal(await blogPage.getByRole("alert").count(), 0);
      await blogContext.close();

      const resizeContext = await browser.newContext({
        reducedMotion: "no-preference",
        viewport: { width: 390, height: 844 },
      });
      const resizePage = await resizeContext.newPage();
      let neuralStageRequests = 0;
      resizePage.on("request", (request) => {
        if (request.url().includes("/src/components/scene/AiNeuralStudioStage.tsx")) {
          neuralStageRequests += 1;
        }
      });

      await resizePage.goto(`${baseUrl}/ai`, { waitUntil: "domcontentloaded" });
      await waitForApp(resizePage);
      await resizePage.waitForTimeout(2200);
      const aiHeroLine = resizePage.locator("[data-ai-genesis-headline] .ai-genesis-overlay__line").first();
      await resizePage.setViewportSize({ width: 1440, height: 900 });
      await resizePage.waitForTimeout(700);
      assert.deepEqual(
        await aiHeroLine.evaluate((element) => ({
          opacity: getComputedStyle(element).opacity,
          transform: getComputedStyle(element).transform,
        })),
        { opacity: "1", transform: "none" },
      );
      await resizePage.locator("[data-ai-neural-lab]").waitFor();
      assert.equal(neuralStageRequests, 0);
      await resizePage.evaluate(() => {
        const lab = document.querySelector("[data-ai-neural-lab]");
        if (!lab) {
          return;
        }

        const top = lab.getBoundingClientRect().top + window.scrollY;
        const range = lab.getBoundingClientRect().height - window.innerHeight;
        window.scrollTo({ top: top + range * 0.5, behavior: "instant" });
      });
      await resizePage.waitForFunction(
        () => {
          const value = Number.parseInt(
            document.querySelector("[data-ai-neural-global-pct]")?.textContent ?? "",
            10,
          );
          return value >= 40 && value <= 60;
        },
        undefined,
        { timeout: 12_000 },
      );
      await resizePage.waitForFunction(
        () => performance
          .getEntriesByType("resource")
          .some((entry) => entry.name.includes("/src/components/scene/AiNeuralStudioStage.tsx")),
        undefined,
        { timeout: 12_000 },
      );
      assert.equal(neuralStageRequests, 1);
      await resizeContext.close();

      const featuresContext = await browser.newContext({
        reducedMotion: "no-preference",
        viewport: { width: 390, height: 844 },
      });
      const featuresPage = await featuresContext.newPage();

      await featuresPage.goto(`${baseUrl}/features`, { waitUntil: "domcontentloaded" });
      await waitForApp(featuresPage);
      await featuresPage.waitForTimeout(2200);
      const featuresHeroItem = featuresPage.locator("[data-features-hero] > *").last();
      await featuresPage.setViewportSize({ width: 1440, height: 900 });
      await featuresPage.waitForTimeout(700);
      const featuresHeroMotion = await featuresHeroItem.evaluate((element) => ({
        opacity: getComputedStyle(element).opacity,
        transform: getComputedStyle(element).transform,
      }));
      assert.equal(featuresHeroMotion.opacity, "1");
      assert.match(featuresHeroMotion.transform, /^(?:none|matrix\(1, 0, 0, 1, 0, 0\))$/);
      await featuresPage.locator(".feature-canonical-story__stage").waitFor();
      await featuresPage.waitForFunction(
        () =>
          document
            .querySelector(".feature-canonical-story__copy .design-badge")
            ?.textContent?.replace(/\s+/g, " ")
            .trim() === "Arrangement",
        undefined,
        { timeout: 12_000 },
      );
      await featuresContext.close();
    } finally {
      await browser?.close();
      await server.close();
      await rm(cacheDir, { force: true, recursive: true });
    }
  },
);
