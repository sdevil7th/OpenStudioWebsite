import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
const read = p => readFileSync(new URL("../"+p,import.meta.url),"utf8");
const pageSeo=read("src/components/PageSeo.tsx"), indexHtml=read("index.html");
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

test("the base document avoids unsupported search schema and has a no-JavaScript escape hatch", () => {
  assert.doesNotMatch(indexHtml, /SearchAction|potentialAction|query-input/);
  assert.match(
    indexHtml,
    /#openstudio-instant-loader\s*\{[\s\S]*?display:\s*none/,
  );
  assert.match(indexHtml, /interactive controls are unavailable/);
});
