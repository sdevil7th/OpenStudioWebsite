import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const homeDataSource = readFileSync(
  new URL("../src/data/home.ts", import.meta.url),
  "utf8",
);
const homePageSource = readFileSync(
  new URL("../src/pages/HomePage.tsx", import.meta.url),
  "utf8",
);
const blogDataSource = readFileSync(
  new URL("../src/data/blogs.ts", import.meta.url),
  "utf8",
);
const blogPageSource = readFileSync(
  new URL("../src/pages/BlogPostPage.tsx", import.meta.url),
  "utf8",
);

test("homepage FAQ schema and visible answers share one source", () => {
  assert.match(homeDataSource, /export const homeFaqs = \[/);
  assert.match(
    homeDataSource,
    /mainEntity: homeFaqs\.map\(\(\{ answer, question \}\) => \(\{/,
  );
  assert.match(homePageSource, /homeFaqs\.map\(\(\{ answer, question \}\) => \(/);
  assert.match(homePageSource, /id="home-faq-title"/);
});

test("homepage keeps broad DAW intent and links to deeper product intents", () => {
  assert.match(
    homeDataSource,
    /OpenStudio \| Free Open-Source DAW for Music Production/,
  );
  assert.match(homeDataSource, /lastModified: "2026-07-28"/);
  assert.match(homeDataSource, /open-source alternative built around the complete session/);
  assert.match(homeDataSource, /to: "\/features"/);
  assert.match(homeDataSource, /to: "\/ai"/);
  assert.match(homeDataSource, /to: "\/github"/);
  assert.doesNotMatch(homeDataSource, /Suno AI killer/);
  assert.doesNotMatch(homePageSource, /homeAlternativePositioning\.terms/);
});

test("blog articles expose visible and machine-readable authorship dates", () => {
  assert.match(blogDataSource, /const DEFAULT_BLOG_AUTHOR = "OpenStudio engineering team"/);
  assert.match(blogDataSource, /dateModified: "2026-07-28"/);
  assert.match(blogDataSource, /const dateModified = seoOverride\?\.dateModified \?\? date/);
  assert.match(blogDataSource, /mainEntityOfPage:/);
  assert.match(blogDataSource, /"@type": "ImageObject"/);
  assert.match(blogPageSource, /authorProfileUrl=\{SITE_URL\}/);
  assert.match(blogPageSource, /publishedTime=\{post\.date\}/);
  assert.match(blogPageSource, /modifiedTime=\{post\.dateModified\}/);
  assert.match(blogPageSource, /By \{post\.author\}/);
  assert.match(blogPageSource, /Updated \{post\.dateModifiedLabel\}/);
});
