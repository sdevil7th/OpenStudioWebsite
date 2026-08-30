import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const pageSeo = read("src/components/PageSeo.tsx");
const notFound = read("src/pages/NotFound.tsx");
const indexHtml = read("index.html");
const netlify = read("netlify.toml");
const blogSlugs = readdirSync(new URL("../blogs", import.meta.url), {
  withFileTypes: true,
})
  .filter(
    (entry) =>
      entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md",
  )
  .map((entry) =>
    entry.name
      .replace(/\.md$/i, "")
      .replace(/^\d{4}-\d{2}-\d{2}-/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  );

const redirectRules = [
  ...netlify.matchAll(
    /\[\[redirects\]\]([\s\S]*?)(?=\r?\n\[\[redirects\]\]|$)/g,
  ),
].map(([, block]) => {
  const readString = (key) =>
    block.match(new RegExp(`^\\s*${key}\\s*=\\s*"([^"]+)"`, "m"))?.[1];
  const readBoolean = (key) =>
    block.match(new RegExp(`^\\s*${key}\\s*=\\s*(true|false)`, "m"))?.[1] ===
    "true";

  return {
    force: readBoolean("force"),
    from: readString("from"),
    status: Number(block.match(/^\s*status\s*=\s*(\d+)/m)?.[1]),
    to: readString("to"),
  };
});

test("runtime SEO removes legacy keywords and resets robots metadata", () => {
  assert.doesNotMatch(indexHtml, /<meta\s+name="keywords"/i);
  assert.doesNotMatch(pageSeo, /ensureMeta\("name",\s*"keywords"\)/);
  assert.match(pageSeo, /removeMeta\("name",\s*"keywords"\)/);
  assert.match(pageSeo, /robots = "index, follow"/);
  assert.match(
    pageSeo,
    /ensureMeta\("name",\s*"robots"\)\.setAttribute\("content", robots\)/,
  );
});

test("runtime SEO synchronizes and clears article Open Graph metadata", () => {
  assert.match(pageSeo, /publishedTime\?: string/);
  assert.match(pageSeo, /modifiedTime\?: string/);
  assert.match(pageSeo, /authorProfileUrl\?: string/);

  for (const property of [
    "article:published_time",
    "article:modified_time",
    "article:author",
    "article:section",
  ]) {
    assert.match(pageSeo, new RegExp(`"${property}"`));
  }

  assert.match(pageSeo, /isArticle \? publishedTime : undefined/);
  assert.match(pageSeo, /isArticle \? modifiedTime : undefined/);
  assert.match(pageSeo, /isArticle \? authorProfileUrl : undefined/);
  assert.match(pageSeo, /isArticle \? articleSection : undefined/);
});

test("the base document has valid global schema and a no-JavaScript escape hatch", () => {
  assert.doesNotMatch(indexHtml, /SearchAction|potentialAction|query-input/);
  assert.match(
    indexHtml,
    /#openstudio-instant-loader\s*\{[\s\S]*?display:\s*none\s*!important/,
  );
  assert.match(indexHtml, /interactive controls are unavailable/);
});

test("unknown routes are noindex pages backed by a real host-level 404", () => {
  assert.match(notFound, /robots="noindex, nofollow"/);
  assert.match(notFound, /path=\{location\.pathname\}/);

  const homeRedirect = netlify.indexOf('from = "/home"');
  const stemRedirect = netlify.indexOf('from = "/stem-separation"');
  const ogCardRewrite = netlify.indexOf('from = "/og-card"');
  const catchAll = netlify.indexOf('from = "/*"');

  assert.ok(homeRedirect >= 0 && homeRedirect < catchAll);
  assert.ok(stemRedirect >= 0 && stemRedirect < catchAll);
  assert.ok(ogCardRewrite >= 0 && ogCardRewrite < catchAll);
  assert.match(
    netlify.slice(catchAll),
    /from = "\/\*"[\s\S]*?to = "\/index\.html"[\s\S]*?status = 404/,
  );
});

test("canonical slashless routes internally serve their prerendered documents", () => {
  const prerenderedRoutes = [
    "/features",
    "/ai",
    "/download",
    "/github",
    "/releases",
    "/blogs",
    "/contact",
    "/privacy",
    "/security",
    "/terms",
  ];
  const catchAllIndex = redirectRules.findIndex(({ from }) => from === "/*");
  const firstDownloadFunctionIndex = redirectRules.findIndex(
    ({ from }) => from === "/download/windows/latest",
  );

  assert.ok(catchAllIndex >= 0, "expected the host-level 404 catch-all");

  for (const route of prerenderedRoutes) {
    const ruleIndex = redirectRules.findIndex(({ from }) => from === route);
    const rule = redirectRules[ruleIndex];

    assert.ok(ruleIndex >= 0, `expected a rewrite for ${route}`);
    assert.ok(ruleIndex < catchAllIndex, `${route} must precede the catch-all`);
    assert.equal(rule.to, `${route}/index.html`);
    assert.equal(rule.status, 200, `${route} must remain an internal rewrite`);
    assert.equal(rule.force, true, `${route} must bypass static-file shadowing`);
  }

  for (const slug of blogSlugs) {
    const route = `/blogs/${slug}`;
    const ruleIndex = redirectRules.findIndex(({ from }) => from === route);
    const rule = redirectRules[ruleIndex];

    assert.ok(ruleIndex >= 0, `expected a rewrite for ${route}`);
    assert.ok(ruleIndex < catchAllIndex, `${route} must precede the catch-all`);
    assert.equal(rule.to, `${route}/index.html`);
    assert.equal(rule.status, 200);
    assert.equal(rule.force, true);
  }

  assert.equal(
    redirectRules.some(({ from }) => from === "/blogs/:slug"),
    false,
    "a broad blog rewrite would intercept unknown slugs before the 404 page",
  );

  assert.ok(
    firstDownloadFunctionIndex >= 0 &&
      firstDownloadFunctionIndex <
        redirectRules.findIndex(({ from }) => from === "/download"),
    "download function rewrites must retain priority over the page rewrite",
  );
});
