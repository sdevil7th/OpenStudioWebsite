import assert from "node:assert/strict";
import { createServer as createNetServer } from "node:net";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer as createViteServer } from "vite";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedLabels = ["Arrangement", "MIDI", "Mixer", "Engine", "Automation"];

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

const normalizeText = (value) => value.replace(/\s+/g, " ").trim();

test(
  "features chapter titles stay centered at 4k desktop scale",
  { timeout: 120_000 },
  async () => {
    const port = await getFreePort();
    const server = await createViteServer({
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
      const context = await browser.newContext({
        deviceScaleFactor: 1.5,
        viewport: { width: 2560, height: 1307 },
      });
      const page = await context.newPage();

      await page.goto(`http://127.0.0.1:${port}/features`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForSelector(".feature-canonical-story__stage", {
        state: "visible",
      });
      await page.waitForFunction(
        () =>
          window.__openstudioIntroHidden === true ||
          !document.querySelector("[data-openstudio-loader]"),
        { timeout: 12_000 },
      );
      await page.waitForFunction(
        () =>
          document.querySelectorAll("[data-feature-story-marker]").length === 5 &&
          document.querySelectorAll("[data-feature-chapter-title-layer]").length === 5,
      );
      await page.waitForTimeout(700);

      const initialGeometry = await page.evaluate(() => ({
        bodyWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
      }));
      assert.ok(
        initialGeometry.bodyWidth <= initialGeometry.viewportWidth + 2,
        `features page should not overflow horizontally at 4k scale: body=${initialGeometry.bodyWidth}, viewport=${initialGeometry.viewportWidth}`,
      );

      for (const [index, expectedLabel] of expectedLabels.entries()) {
        const targetScroll = await page.evaluate((chapterIndex) => {
          const markers = [
            ...document.querySelectorAll("[data-feature-story-marker]"),
          ];
          const marker = markers[chapterIndex];

          if (!marker) {
            return null;
          }

          const markerTop = marker.getBoundingClientRect().top + window.scrollY;
          const titleStartLine = window.innerHeight - 160;
          const markerTarget = Math.max(0, markerTop - titleStartLine + 8);
          const stage = document.querySelector(".feature-canonical-story__stage");
          const stageTop = stage
            ? stage.getBoundingClientRect().top + window.scrollY
            : markerTop;
          const firstChapterStageTarget = Math.max(
            0,
            stageTop - Math.min(180, window.innerHeight * 0.14),
          );
          const target =
            chapterIndex === 0 ? firstChapterStageTarget : markerTarget;
          window.scrollTo(0, target);
          return target;
        }, index);

        assert.notEqual(targetScroll, null, `chapter ${index + 1} marker exists`);
        await page.waitForTimeout(420);
        await page.waitForFunction(
          (label) =>
            document
              .querySelector(".feature-canonical-story__copy .design-badge")
              ?.textContent?.replace(/\s+/g, " ")
              .trim() === label,
          expectedLabel,
          { timeout: 5000 },
        );
        await page.waitForFunction(
          ({ chapterIndex }) => {
            const layers = [
              ...document.querySelectorAll("[data-feature-chapter-title-layer]"),
            ];
            const activeLayer = layers.find(
              (layer) => layer.getAttribute("data-current") === "true",
            );

            if (!activeLayer || layers.indexOf(activeLayer) !== chapterIndex) {
              return false;
            }

            const activeOpacity = Number(getComputedStyle(activeLayer).opacity);
            const inactiveMaxOpacity = Math.max(
              ...layers
                .filter((layer) => layer !== activeLayer)
                .map((layer) => Number(getComputedStyle(layer).opacity)),
            );

            return activeOpacity >= 0.72 && inactiveMaxOpacity <= 0.02;
          },
          { chapterIndex: index },
          { timeout: 5000 },
        );

        const state = await page.evaluate(() => {
          const stage = document.querySelector(".feature-canonical-story__stage");
          const layers = [
            ...document.querySelectorAll("[data-feature-chapter-title-layer]"),
          ];
          const activeLayer = layers.find(
            (layer) => layer.getAttribute("data-current") === "true",
          );
          const copyLabel = document.querySelector(
            ".feature-canonical-story__copy .design-badge",
          );

          if (!stage || !activeLayer || !copyLabel) {
            return null;
          }

          const stageRect = stage.getBoundingClientRect();
          const layerRect = activeLayer.getBoundingClientRect();
          const activeOpacity = Number(getComputedStyle(activeLayer).opacity);
          const inactiveOpacities = layers
            .filter((layer) => layer !== activeLayer)
            .map((layer) => Number(getComputedStyle(layer).opacity));

          return {
            activeIndex: layers.indexOf(activeLayer),
            activeOpacity,
            copyLabel: copyLabel.textContent ?? "",
            inactiveMaxOpacity: Math.max(...inactiveOpacities),
            layerCenterY: layerRect.top + layerRect.height / 2,
            stageCenterY: stageRect.top + stageRect.height / 2,
            viewportHeight: window.innerHeight,
            titleText:
              activeLayer.querySelector("h2")?.textContent?.replace(/\s+/g, " ") ??
              "",
          };
        });

        assert.ok(state, `chapter ${index + 1} rendered state exists`);
        assert.equal(
          state.activeIndex,
          index,
          `chapter ${index + 1} title layer should be active`,
        );
        assert.equal(
          normalizeText(state.copyLabel),
          expectedLabel,
          `chapter ${index + 1} copy label should match active chapter`,
        );
        assert.equal(
          normalizeText(state.titleText),
          expectedLabel,
          `chapter ${index + 1} visible title should match active chapter`,
        );
        assert.ok(
          state.activeOpacity >= 0.72,
          `chapter ${index + 1} active title should be visible, opacity=${state.activeOpacity}`,
        );
        assert.ok(
          state.inactiveMaxOpacity <= 0.02,
          `chapter ${index + 1} inactive titles should be hidden, max opacity=${state.inactiveMaxOpacity}`,
        );
        assert.ok(
          Math.abs(state.layerCenterY - state.stageCenterY) <= 2,
          `chapter ${index + 1} title center should match stage center: title=${state.layerCenterY}, stage=${state.stageCenterY}`,
        );
        assert.ok(
          state.stageCenterY > 0 && state.stageCenterY < state.viewportHeight,
          `chapter ${index + 1} stage center should be visible: center=${state.stageCenterY}, viewport=${state.viewportHeight}`,
        );
      }
    } finally {
      await browser?.close();
      await server.close();
    }
  },
);
