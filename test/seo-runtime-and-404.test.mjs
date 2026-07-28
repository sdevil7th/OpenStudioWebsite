import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const pageSeo = read("src/components/PageSeo.tsx");
const notFound = read("src/pages/NotFound.tsx");
const indexHtml = read("index.html");
const netlify = read("netlify.toml");

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
