import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { chromium } from "playwright";
import { createServer, preview } from "vite";

const published = JSON.parse(readFileSync(new URL("../public/github/latest-release.json", import.meta.url), "utf8"));
const future = {
  ...published,
  tagName: "v9.8.7",
  name: "OpenStudio 9.8.7",
  htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/v9.8.7",
  assets: published.assets.map((asset, index) => ({
    ...asset,
    size: (index + 1) * 10 * 1024 * 1024,
    downloadUrl: asset.downloadUrl.replace(published.tagName, "v9.8.7"),
  })),
};

test("release JSON validation and checksum matching reject incompatible metadata", async () => {
  const server = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
  try {
    const { parseGithubRelease, fromGithubRelease, fromManifest, withManifestChecksums } =
      await server.ssrLoadModule("/src/hooks/useReleaseInfo.ts");
    assert.equal(parseGithubRelease({ ...future, isPrerelease: true }), null);
    assert.equal(parseGithubRelease({ ...future, assets: [{ ...future.assets[0], size: -1 }] }), null);
    assert.equal(
      parseGithubRelease({ ...future, assets: [{ ...future.assets[0], downloadUrl: "javascript:alert(1)" }] }),
      null,
    );
    const release = fromGithubRelease(parseGithubRelease(future), "github");
    const windows = release.platforms.windows;
    const manifest = fromManifest({
      version: "9.8.7",
      platforms: {
        windows: { url: windows.directUrl, fileName: windows.fileName, size: windows.size, sha256: "a".repeat(64) },
      },
    });
    assert.equal(withManifestChecksums(release, manifest).platforms.windows.sha256, "a".repeat(64));
    assert.equal(withManifestChecksums(release, { ...manifest, version: "9.8.6" }).platforms.windows.sha256, null);
    manifest.platforms.windows.size += 1;
    assert.equal(withManifestChecksums(release, manifest).platforms.windows.sha256, null);
  } finally {
    await server.close();
  }
});

test(
  "GitHub updates the displayed version, sizes and exact installer links together",
  { timeout: 30_000 },
  async () => {
    const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
    const browser = await chromium.launch();
    try {
      const context = await browser.newContext({ reducedMotion: "reduce" });
      await context.route("https://**/*", (route) => route.abort());
      await context.route("**/github/latest-release.json", (route) =>
        route.fulfill({ contentType: "application/json", body: JSON.stringify(future) }),
      );
      await context.addInitScript(() =>
        localStorage.setItem(
          "openstudio.analytics-consent.v1",
          JSON.stringify({ choice: "rejected", time: Date.now() }),
        ),
      );
      const page = await context.newPage();
      const functionCalls = [];
      page.on("request", (request) => {
        if (new URL(request.url()).pathname.startsWith("/.netlify/functions/")) functionCalls.push(request.url());
      });
      await page.goto(server.resolvedUrls.local[0] + "download");
      await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
      await page.getByText("9.8.7", { exact: true }).waitFor();
      for (const [index, platform] of ["windows", "macos", "linux"].entries()) {
        const card = page.locator(`#${platform}`);
        assert.match(await card.innerText(), new RegExp(`${(index + 1) * 10}\.0 MB`));
        assert.equal(
          await card.getByRole("link", { name: /^Download for/ }).getAttribute("href"),
          future.assets[index].downloadUrl,
        );
        assert.equal(await card.locator("span[title]").count(), 0);
      }
      assert.deepEqual(functionCalls, [], "the download page must not invoke functions for release data");
      await context.close();
    } finally {
      await browser.close();
      await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())));
    }
  },
);
