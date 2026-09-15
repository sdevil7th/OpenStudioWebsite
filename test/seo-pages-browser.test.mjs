import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { chromium } from "playwright";
import sharp from "sharp";
import { preview } from "vite";
import { XMLParser } from "fast-xml-parser";

const origin = "https://openstudio.org.in";
const sitemap = new XMLParser().parse(readFileSync(new URL("../dist/sitemap.xml", import.meta.url), "utf8"));
const entries = sitemap.urlset.url;
const routes = entries.map(({ loc }) => new URL(loc).pathname);
const nodes = (schema) => Array.isArray(schema) ? schema.flatMap(nodes) : schema["@graph"] ? schema["@graph"].flatMap(nodes) : [schema];

const readHead = (page) => page.evaluate(() => ({
  titles: [...document.querySelectorAll("head title")].map(el => el.textContent),
  canonicals: [...document.querySelectorAll('link[rel="canonical"]')].map(el => el.href),
  metas: [...document.querySelectorAll("head meta[name], head meta[property]")].map(el => [el.getAttribute("name") ?? el.getAttribute("property"), el.content]),
  schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(el => JSON.parse(el.textContent)),
}));

function verifyHead(head, route) {
  assert.equal(head.titles.length, 1, route);
  assert.ok(head.titles[0].trim(), route);
  assert.deepEqual(head.canonicals, [origin + route], route);
  const meta = Object.fromEntries(head.metas);
  assert.equal(new Set(head.metas.map(([key]) => key)).size, head.metas.length, `duplicate metadata: ${route}`);
  assert.equal(meta.robots, "index, follow", route);
  assert.ok(meta.description?.trim(), route);
  assert.equal(meta["og:url"], origin + route, route);
  assert.equal(meta["og:title"], head.titles[0], route);
  assert.equal(meta["twitter:title"], head.titles[0], route);
  assert.equal(meta["og:description"], meta.description, route);
  assert.equal(meta["twitter:description"], meta.description, route);
  assert.equal(meta["twitter:image"], meta["og:image"], route);
  assert.equal(new URL(meta["og:image"]).origin, origin, route);
  assert.ok(meta["og:image:alt"] && meta["twitter:image:alt"], route);
  assert.equal(meta["twitter:card"], "summary_large_image", route);
  assert.equal(head.schemas.length, 1, `one owned schema document: ${route}`);
  const schemaNodes = nodes(head.schemas);
  if (route === "/") {
    for (const type of ["Organization", "WebSite", "WebPage", "SoftwareApplication"])
      assert.ok(schemaNodes.some(node => node["@type"] === type), type);
    const app = schemaNodes.find(node => node["@type"] === "SoftwareApplication");
    assert.equal(app.offers.price, 0);
    assert.equal(app.aggregateRating, undefined, "do not invent ratings for rich results");
  } else if (route === "/blog") {
    assert.equal(schemaNodes[0]["@type"], "Blog");
    assert.deepEqual(schemaNodes[0].blogPost.map(post => new URL(post.url).pathname).sort(), routes.filter(path => path.startsWith("/blog/")).sort());
  } else if (route.startsWith("/blog/")) {
    const article = schemaNodes.find(node => node["@type"] === "BlogPosting");
    assert.equal(article.url, origin + route);
    assert.equal(article.datePublished, meta["article:published_time"]);
    assert.equal(article.dateModified, meta["article:modified_time"]);
    assert.ok(article.author.name && article.publisher.logo.url);
  } else if (route.startsWith("/docs/")) {
    assert.equal(schemaNodes.find(node => node["@type"] === "TechArticle").url, origin + route);
  }
  if (route.startsWith("/docs/") || route.startsWith("/blog/")) {
    const crumbs = schemaNodes.find(node => node["@type"] === "BreadcrumbList").itemListElement;
    assert.equal(crumbs.at(-1).item, origin + route);
    for (const [index, crumb] of crumbs.entries()) {
      assert.equal(crumb.position, index + 1);
      assert.ok(routes.includes(new URL(crumb.item).pathname), crumb.item);
    }
  }
  if (!route.startsWith("/blog/")) assert.ok(!head.metas.some(([key]) => key.startsWith("article:")), route);
  return meta;
}

test("all sitemap pages expose matching SEO before and after JavaScript", { timeout: 180_000 }, async () => {
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  const browser = await chromium.launch();
  const base = server.resolvedUrls.local[0];
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const runtimeContext = await browser.newContext({ reducedMotion: "reduce" });
  try {
    for (const context of [staticContext, runtimeContext]) await context.route("https://**/*", route => route.abort());
    await runtimeContext.addInitScript(() => localStorage.setItem("openstudio.analytics-consent.v1", JSON.stringify({choice: "rejected", time: Date.now()})));
    const staticPage = await staticContext.newPage();
    const runtimePage = await runtimeContext.newPage();
    const errors = [];
    runtimePage.on("pageerror", error => errors.push(error.message));
    const titles = new Set();
    const descriptions = new Set();
    const checkedImages = new Set();
    for (const route of routes) {
      assert.equal((await staticPage.goto(new URL(route, base).href)).status(), 200, route);
      await staticPage.locator("main h1").waitFor({ state: "visible" });
      assert.equal(await staticPage.locator("main h1").count(), 1, route);
      assert.ok((await staticPage.locator("main").innerText()).length > 200, `readable content: ${route}`);
      const staticHead = await readHead(staticPage);
      const meta = verifyHead(staticHead, route);
      assert.ok(!titles.has(staticHead.titles[0]), `unique title: ${route}`);
      assert.ok(!descriptions.has(meta.description), `unique description: ${route}`);
      titles.add(staticHead.titles[0]);
      descriptions.add(meta.description);
      if (!checkedImages.has(meta["og:image"])) {
        const image = await sharp(fileURLToPath(new URL(`../dist${new URL(meta["og:image"]).pathname}`, import.meta.url))).metadata();
        assert.equal(Number(meta["og:image:width"]), image.width, route);
        assert.equal(Number(meta["og:image:height"]), image.height, route);
        checkedImages.add(meta["og:image"]);
      }
      assert.equal((await runtimePage.goto(new URL(route, base).href)).status(), 200, route);
      await runtimePage.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden && document.querySelector('script[data-page]'));
      const runtimeHead = await readHead(runtimePage);
      verifyHead(runtimeHead, route);
      // Attribute order is irrelevant; compare the semantic values, including schema.
      assert.deepEqual({ ...runtimeHead, metas: runtimeHead.metas.sort() }, { ...staticHead, metas: staticHead.metas.sort() }, `static/runtime agreement: ${route}`);
    }
    assert.deepEqual(errors, []);
    assert.equal(routes.length, 35);

    // Actual SPA link navigation must clear blog-only metadata and update the canonical.
    await runtimePage.locator('header a[href="/docs"]').click();
    await runtimePage.waitForFunction(() => document.querySelector('link[rel="canonical"]')?.href.endsWith("/docs"));
    verifyHead(await readHead(runtimePage), "/docs");
    await runtimePage.locator('a[href="/docs/keyboard-shortcuts"]').first().click();
    await runtimePage.waitForFunction(() => document.querySelector('link[rel="canonical"]')?.href.endsWith("/docs/keyboard-shortcuts"));
    verifyHead(await readHead(runtimePage), "/docs/keyboard-shortcuts");

    for (const route of ["/seo-audit-missing-page", "/docs/not-a-guide", "/blog/not-a-post", "/og-card"]) {
      assert.equal((await runtimePage.goto(new URL(route, base).href)).status(), 404, route);
      await runtimePage.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
      const head = await readHead(runtimePage);
      assert.match(Object.fromEntries(head.metas).robots, /noindex/);
      assert.deepEqual(head.canonicals, []);
      assert.deepEqual(head.schemas, []);
    }
    await runtimePage.locator('header a[href="/"]').click();
    await runtimePage.waitForFunction(() => document.querySelector('link[rel="canonical"]')?.href === "https://openstudio.org.in/");
    verifyHead(await readHead(runtimePage), "/");
  } finally {
    await browser.close();
    await server.httpServer.close();
  }
});
