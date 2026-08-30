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
  "fragment navigation waits for a target inside a delayed lazy route",
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
    let releaseFeatureModule;

    try {
      await server.listen();

      browser = await chromium.launch();
      const page = await browser.newPage({
        viewport: { width: 1280, height: 900 },
      });
      let markFeatureModuleRequested;
      const featureModuleRequested = new Promise((resolveRequest) => {
        markFeatureModuleRequested = resolveRequest;
      });
      const holdFeatureModule = new Promise((resolveModule) => {
        releaseFeatureModule = resolveModule;
      });

      await page.route(
        /\/src\/pages\/FeaturesPage\.tsx(?:\?.*)?$/,
        async (route) => {
          markFeatureModuleRequested();
          await holdFeatureModule;
          await route.continue();
        },
      );

      const navigation = page.goto(
        `http://127.0.0.1:${port}/features#nam-rack`,
        { waitUntil: "domcontentloaded" },
      );

      await featureModuleRequested;
      await page.waitForSelector(".site-shell-route-frame");
      assert.equal(
        await page.locator(".site-shell-content").getAttribute("data-route-pending"),
        "true",
        "the shell should be pending from its first commit",
      );
      assert.equal(
        await page.locator("footer").count(),
        0,
        "the footer should not mount beneath an unresolved initial route",
      );
      assert.equal(
        await page.locator("#nam-rack").count(),
        0,
        "the hash target should still be absent while the lazy route is held",
      );

      releaseFeatureModule();
      await navigation;
      await page.waitForSelector("#nam-rack");
      await page.waitForFunction(() => window.__openstudioAppReady === true);
      await page.waitForSelector("footer");
      await page.waitForFunction(
        () => {
          const target = document.getElementById("nam-rack");

          if (!target || window.scrollY <= 0) {
            return false;
          }

          return Math.abs(target.getBoundingClientRect().top - 96) <= 4;
        },
        undefined,
        { timeout: 12_000 },
      );
    } finally {
      releaseFeatureModule?.();
      await browser?.close();
      await server.close();
      await rm(cacheDir, { force: true, recursive: true });
    }
  },
);
