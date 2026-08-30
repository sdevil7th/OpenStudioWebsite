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

test(
  "AI neural HUD keeps its progress when a phase change replaces the HUD nodes",
  { timeout: 60_000 },
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
      const context = await browser.newContext({
        reducedMotion: "reduce",
        viewport: { width: 1440, height: 1000 },
      });
      const page = await context.newPage();

      await page.goto(`http://127.0.0.1:${port}/ai`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForFunction(() => window.__openstudioAppReady === true);
      await page.waitForSelector("[data-ai-neural-hud]");

      const scrollToProgress = (progress) =>
        page.evaluate((nextProgress) => {
          const lab = document.querySelector("[data-ai-neural-lab]");
          if (!lab) {
            return false;
          }

          const top = lab.getBoundingClientRect().top + window.scrollY;
          const range = lab.getBoundingClientRect().height - window.innerHeight;
          window.scrollTo({
            top: top + range * nextProgress,
            behavior: "instant",
          });
          return true;
        }, progress);

      assert.equal(await scrollToProgress(0.17), true);
      await page.waitForFunction(
        () =>
          document.querySelector("[data-ai-neural-global-pct]")?.textContent ===
            "17%" &&
          document.querySelector("[data-ai-neural-phase-pct]")?.textContent ===
            "94%",
      );

      assert.equal(await scrollToProgress(0.2), true);
      await page.waitForFunction(
        () => {
          const hud = document.querySelector("[data-ai-neural-hud]");
          return (
            hud?.textContent?.includes("Stem lanes") &&
            document.querySelector("[data-ai-neural-global-pct]")?.textContent ===
              "20%" &&
            document.querySelector("[data-ai-neural-phase-pct]")?.textContent ===
              "10%"
          );
        },
      );
      await page.waitForTimeout(300);

      const settled = await page.evaluate(() => ({
        global: document.querySelector("[data-ai-neural-global-pct]")?.textContent,
        phase: document.querySelector("[data-ai-neural-phase-pct]")?.textContent,
        progressBar: document.querySelector("[data-ai-neural-progress-bar]")?.style
          .width,
      }));

      assert.deepEqual(settled, {
        global: "20%",
        phase: "10%",
        progressBar: "20%",
      });
    } finally {
      await browser?.close();
      await server.close();
      await rm(cacheDir, { force: true, recursive: true });
    }
  },
);
