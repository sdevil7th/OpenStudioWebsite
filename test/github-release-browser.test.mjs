import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
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

    const currentManifest = fromManifest(JSON.parse(readFileSync(new URL("../public/releases/stable/latest.json", import.meta.url), "utf8")));
    assert.equal(currentManifest.platforms.linux.href, "/download/linux/latest", "AppImage manifest fallback must keep its matching download endpoint");
    assert.match(currentManifest.platforms.linux.fileName, /\.AppImage$/);
    const current = withManifestChecksums(fromGithubRelease(published, "build"), currentManifest);
    const deb = published.assets.find(({ name }) => name.toLowerCase().endsWith(".deb"));
    assert.equal(current.platforms.linux.directUrl, deb?.downloadUrl ?? current.linuxAppImage?.directUrl);
    if (deb) {
      assert.equal(current.platforms.linux.sha256, null, "The DEB must never inherit the AppImage checksum");
      assert.equal(current.platforms.linux.href, "/download/linux/deb/latest");
      assert.equal(current.linuxAppImage.sha256, currentManifest.platforms.linux.sha256);
    }
    const previous = JSON.parse(readFileSync(new URL("./fixtures/release-v0.1.01/releases/stable/latest.json", import.meta.url), "utf8"));
    const oldLinux = previous.platforms.linux;
    const oldRelease = fromGithubRelease({ ...published, assets: [{
      name: oldLinux.fileName, size: oldLinux.size, downloadUrl: oldLinux.url, downloadCount: 0,
    }] }, "build");
    assert.equal(oldRelease.platforms.linux.directUrl, oldLinux.url);
    assert.equal(oldRelease.platforms.linux.href, "/download/linux/latest");
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
      for (const [platform, extension] of [["windows", ".exe"], ["macos", ".dmg"], ["linux", ".deb"]]) {
        const asset = future.assets.find(({ name }) => name.toLowerCase().endsWith(extension)) ??
          future.assets.find(({ name }) => name.toLowerCase().endsWith(".appimage"));
        const index = future.assets.indexOf(asset);
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

test("Linux native installer and optional AppImage remain usable across screen sizes", { timeout: 60_000 }, async () => {
  const deb = published.assets.find(({ name }) => name.toLowerCase().endsWith(".deb"));
  const appImage = published.assets.find(({ name }) => name.toLowerCase().endsWith(".appimage"));
  assert.ok(deb && appImage, "The published release provides native and AppImage packages");
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  let browser;
  try {
    browser = await chromium.launch();
    mkdirSync("output/review", { recursive: true });
    for (const width of [390, 768, 900, 901, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: width === 390 ? "no-preference" : "reduce" });
      await context.route("https://**/*", route => route.abort());
      await context.addInitScript(() => localStorage.setItem("openstudio.analytics-consent.v1",
        JSON.stringify({ choice: "rejected", time: Date.now() })));
      const page = await context.newPage();
      await page.goto(server.resolvedUrls.local[0] + "download");
      await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
      const card = page.locator("#linux");
      await card.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => getComputedStyle(document.querySelector("#linux")).opacity === "1");
      assert.equal(await card.getByRole("link", { name: "Download for Linux", exact: true }).getAttribute("href"), deb.downloadUrl);
      const optional = card.getByRole("link", { name: "Optional AppImage download", exact: true });
      assert.equal(await optional.getAttribute("href"), appImage.downloadUrl);
      assert.match(await card.innerText(), /Ubuntu App Center or Software, or Linux Mint’s package installer/);
      assert.match(await card.innerText(), /Ubuntu 22\.04\+ \(including 24\.04\)/);
      assert.match(await card.innerText(), /Use the \.deb on Ubuntu and Linux Mint/);
      await optional.focus();
      assert.equal(await optional.evaluate(element => element === document.activeElement && element.matches(":focus-visible")), true);
      assert.equal(await optional.evaluate(element => {
        const style = getComputedStyle(element);
        return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2;
      }), true, `${width}: optional link retains a visible focus indicator`);
      const geometry = await card.evaluate(element => ({
        scrollWidth: element.scrollWidth, clientWidth: element.clientWidth,
        left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right,
      }));
      assert.ok(geometry.scrollWidth <= geometry.clientWidth + 1, `${width}: card content must fit`);
      assert.ok(geometry.left >= 0 && geometry.right <= width, `${width}: card must fit viewport`);
      assert.ok((await optional.boundingBox()).height >= 24, `${width}: optional link retains its hit target`);
      assert.equal(await optional.evaluate(element => {
        const bounds = element.getBoundingClientRect();
        return element.contains(document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2));
      }), true, `${width}: optional link must be unobstructed`);
      if (width === 390 || width === 1440) await card.screenshot({ path: `output/review/linux-download-${width}.png` });
      await context.close();
    }
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(server.resolvedUrls.local[0] + "download");
    assert.equal(await page.locator("#linux").getByRole("link", { name: "Download for Linux", exact: true }).getAttribute("href"), deb.downloadUrl);
    assert.equal(await page.getByRole("link", { name: "Optional AppImage download", exact: true }).getAttribute("href"), appImage.downloadUrl);
    for (const slug of ["getting-started", "faq", "troubleshooting"]) {
      await page.goto(server.resolvedUrls.local[0] + `docs/${slug}`);
      const text = await page.locator("#sp-main").innerText();
      assert.match(text, /\.deb/);
      assert.match(text, /Ubuntu App Center or Software/);
      assert.match(text, /Linux Mint’s package installer/);
      assert.match(text, /optional AppImage/i);
      assert.match(text, /Ubuntu 22\.04\+ \(including 24\.04\)/);
    }
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
  }
});
