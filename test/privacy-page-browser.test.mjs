import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

// Exercise the deployed HTML and bundles, including the certification failure
// mode where a URL resolves but the visitor cannot actually read the policy.
test("production privacy policy is readable with and without application JavaScript", { timeout: 90_000 }, async t => {
  const html = await readFile(new URL("../dist/privacy/index.html", import.meta.url), "utf8");
  assert.match(html, /<h1>Privacy Policy<\/h1>/);
  assert.match(html, /href="https:\/\/openstudio\.org\.in\/privacy"/);
  const legalRoutes = [
    { path: "privacy", title: "Privacy Policy" },
    { path: "security", title: "Security Policy" },
    { path: "terms", title: "Terms of Use" },
  ];
  const netlify = await readFile(new URL("../netlify.toml", import.meta.url), "utf8");
  for (const { path } of legalRoutes) {
    const rewrite = netlify.split("[[redirects]]").find(rule => rule.includes(`from = "/${path}"`));
    assert.ok(rewrite?.includes(`to = "/${path}/index.html"`));
    assert.match(rewrite, /status = 200/);
    assert.match(rewrite, /force = true/);
    const document = await readFile(new URL(`../dist/${path}/index.html`, import.meta.url), "utf8");
    assert.match(document, /<html\b[^>]*data-openstudio-immediate-content/);
    assert.doesNotMatch(document, /<div[^>]*data-openstudio-loader/);
    assert.doesNotMatch(document, /constructing the production surface/);
  }
  const homeHtml = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(homeHtml, /<div[^>]*data-openstudio-loader/);
  assert.doesNotMatch(homeHtml, /<html\b[^>]*data-openstudio-immediate-content/);
  // Vite preview does not implement netlify.toml: without this middleware it
  // silently serves the home document at /privacy and invalidates fallback QA.
  const server = await preview({
    plugins: [{
      name: "privacy-netlify-rewrite",
      configurePreviewServer(server) {
        server.middlewares.use((request, _response, next) => {
          const legalRoute = legalRoutes.find(({ path }) => request.url?.split("?")[0] === `/${path}`);
          if (legalRoute) request.url = `/${legalRoute.path}/index.html`;
          next();
        });
      },
    }],
    preview: { host: "127.0.0.1", port: 0, strictPort: true },
  });
  let browser;
  try {
    browser = await chromium.launch();
    const baseUrl = server.resolvedUrls.local[0];
    for (const { path, title } of legalRoutes) {
      await t.test(`${path} is readable before bundles arrive and after React takes over`, async () => {
        const context = await browser.newContext();
        let releaseScripts;
        const scriptsReleased = new Promise(resolve => { releaseScripts = resolve; });
        try {
          await context.route("**/*.js", async route => {
            await scriptsReleased;
            await route.continue();
          });
          const page = await context.newPage();
          await page.goto(`${baseUrl}${path}`, { waitUntil: "commit" });
          const heading = page.getByRole("heading", { name: title, exact: true });
          await heading.waitFor({ state: "visible", timeout: 2000 });
          await heading.click({ trial: true });
          assert.equal(await page.locator("[data-openstudio-loader]").count(), 0);
          assert.equal(await page.evaluate(() => Boolean(window.__openstudioAppReady)), false);
          releaseScripts();
          await page.waitForFunction(() => window.__openstudioAppReady);
          await heading.click({ trial: true });
          assert.equal(await page.getByRole("main").count(), 1);
          assert.equal(await page.locator("[data-section-reveal], main.route-appear").count(), 0);
          assert.equal(await page.locator("#openstudio-static-route-fallback").count(), 0);
        } finally {
          releaseScripts();
          await context.close();
        }
      });
    }
    for (const scenario of [
      { name: "desktop", path: "privacy", options: {} },
      { name: "mobile trailing-slash URL", path: "privacy/", options: { viewport: { width: 390, height: 844 } } },
      { name: "JavaScript disabled", path: "privacy", options: { javaScriptEnabled: false } },
      { name: "application bundles fail to load", path: "privacy", options: {}, blockScripts: true },
      { name: "privacy route chunk fails to load", path: "privacy", options: {}, blockPrivacyChunk: true },
    ]) {
      await t.test(scenario.name, async () => {
        const context = await browser.newContext({ reducedMotion: "reduce", ...scenario.options });
        try {
          const providerRequests = [];
          await context.route(/https:\/\/([^/]+\.)?(googletagmanager\.com|google-analytics\.com|clarity\.ms)\//, route => {
            providerRequests.push(route.request().url());
            return route.abort();
          });
          if (scenario.blockScripts || scenario.blockPrivacyChunk) {
            await context.route("**/*.js", route => {
              if (scenario.blockScripts || /\/PrivacyPage-[^/]+\.js$/.test(route.request().url())) return route.abort();
              return route.continue();
            });
          }
          const page = await context.newPage();
          const response = await page.goto(`${baseUrl}${scenario.path}`);
          assert.equal(response.status(), 200);
          assert.equal(await page.locator("[data-openstudio-loader]").count(), 0);
          const heading = page.getByRole("heading", { name: "Privacy Policy", exact: true });
          await heading.waitFor({ state: "visible" });
          // Visibility includes hit-testing: an opaque loading overlay must not
          // cover the policy even when its HTML is present underneath.
          await heading.click({ trial: true, timeout: 20_000 });
          const main = page.getByRole("main");
          assert.match(await main.innerText(), /Microsoft Store distribution/);
          assert.match(await main.innerText(), /Windows Data Protection \(DPAPI\)/);
          assert.match(await main.innerText(), /access, correct, delete or obtain a copy/);
          const controls = page.getByRole("heading", { name: "Your controls and privacy requests" });
          await controls.scrollIntoViewIfNeeded();
          await controls.click({ trial: true });
          assert.equal(await page.getByRole("link", { name: "Email privacy contact" }).getAttribute("href"), "mailto:support@openstudio.org.in");
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
          assert.deepEqual(providerRequests, [], "reading the policy must not require analytics consent");
        } finally {
          await context.close();
        }
      });
    }
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
  }
});
