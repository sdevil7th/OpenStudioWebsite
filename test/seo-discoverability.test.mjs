import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import sharp from "sharp";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const files = {
  article: read("blogs/2026-07-26-building-openstudio-nam-rack.md"),
  blogs:
    read("src/data/blogs.ts") + read("src/data/generatedBlogIndex.ts"),
  features: read("src/data/features.ts"),
  home: read("src/data/home.ts"),
  index: read("index.html"),
  netlify: read("netlify.toml"),
  pageSeo: read("src/components/PageSeo.tsx"),
  prerender: read("scripts/prerender-route-metadata.mjs"),
  sitemap: read("public/sitemap.xml"),
};

test("competitor discovery lives in visible, sourced comparison content", () => {
  [
    "AmpliTube alternative",
    "Guitar Rig alternative",
    "Neural DSP alternative",
  ].forEach((phrase) => assert.match(files.features, new RegExp(phrase)));

  assert.match(
    files.features,
    /OpenStudio compared with AmpliTube, Guitar Rig, and Neural DSP/,
  );
  assert.match(files.features, /Where the commercial option wins/);
  assert.match(files.features, /https:\/\/www\.ikmultimedia\.com\/products\/amplitube5/);
  assert.match(files.features, /https:\/\/www\.native-instruments\.com\/.+guitar-rig/);
  assert.match(files.features, /https:\/\/neuraldsp\.com\/plugins/);
  assert.match(files.features, /AmpliTube 5 \/ CS/);
  assert.match(files.features, /Guitar Rig 7 \/ Player/);
  assert.match(files.features, /Neural DSP plug-ins/);
});

test("unsupported keyword tags and invalid search schema are not emitted", () => {
  assert.doesNotMatch(files.index, /<meta[^>]+name=["']keywords["']/i);
  assert.doesNotMatch(files.index, /"@type":\s*"SearchAction"/);
  assert.doesNotMatch(
    files.pageSeo,
    /ensureMeta\("name",\s*"keywords"\)/,
  );
  assert.match(files.pageSeo, /removeMeta\("name", "keywords"\)/);
  assert.match(files.prerender, /\["name", "keywords"\]/);
  assert.doesNotMatch(
    files.prerender,
    /setMeta\(html,\s*\["name", "keywords"\]/,
  );
});

test("route intent is distinct while NAM remains discoverable", () => {
  assert.match(
    files.home,
    /OpenStudio \| Free Open-Source DAW for Music Production/,
  );
  assert.match(
    files.home,
    /built-in Neural Amp Modeler guitar rig/,
  );
  assert.match(
    files.features,
    /OpenStudio Features \| Free NAM Guitar Rig & Full DAW/,
  );
  assert.match(
    files.blogs,
    /Building a Free NAM Guitar Rig Inside OpenStudio \| OpenStudio Blog/,
  );
  assert.doesNotMatch(files.home, /Suno AI killer/);
});

test("static generation uses runtime sources and emits semantic route bodies", () => {
  [
    "/src/data/home.ts",
    "/src/data/features.ts",
    "/src/data/blogs.ts",
    "/src/data/downloads.ts",
    "/src/data/stemSeparation.ts",
  ].forEach((modulePath) =>
    assert.ok(
      files.prerender.includes(`vite.ssrLoadModule("${modulePath}")`),
      `prerender should load ${modulePath}`,
    ),
  );

  assert.match(files.prerender, /renderHomeStaticContent/);
  assert.match(files.prerender, /renderFeaturesStaticContent/);
  assert.match(files.prerender, /renderBlogsStaticContent/);
  assert.match(files.prerender, /renderBlogPostStaticContent/);
  assert.match(files.prerender, /renderGenericStaticContent/);
  assert.match(files.prerender, /renderLegalStaticContent/);
  assert.match(files.prerender, /setRootContent\(html, route\.staticContent\)/);
  assert.match(files.prerender, /homeData\.homeFaqs\.map/);
});

test("article metadata includes authorship, update dates, and page identity", () => {
  assert.match(files.blogs, /mainEntityOfPage:/);
  assert.match(files.blogs, /dateModified/);
  assert.match(files.blogs, /publisher:/);
  assert.match(files.blogs, /"@type": "ImageObject"/);
  assert.match(files.pageSeo, /article:published_time/);
  assert.match(files.pageSeo, /article:modified_time/);
  assert.match(files.pageSeo, /article:author/);
  assert.match(files.prerender, /\["property", "article:author"\]/);
});

test("sitemap and 404 handling expose current crawl state", () => {
  assert.match(
    files.sitemap,
    /<loc>https:\/\/openstudio\.org\.in\/blogs<\/loc>\s+<lastmod>2026-08-31<\/lastmod>/,
  );
  assert.match(
    files.sitemap,
    /<loc>https:\/\/openstudio\.org\.in\/blogs\/building-openstudio-nam-rack<\/loc>\s+<lastmod>2026-08-31<\/lastmod>/,
  );
  assert.match(files.prerender, /path\.join\(publicRoot, "sitemap\.xml"\)/);
  assert.match(
    files.netlify,
    /from = "\/\*"\s+to = "\/index\.html"\s+status = 404/,
  );
});

test("social metadata keeps the fingerprinted NAM image dimensions", async () => {
  const heroPath = new URL(
    "../public/assets/blogs/building-openstudio-nam-rack.webp",
    import.meta.url,
  );
  const heroBytes = readFileSync(heroPath);
  const heroHash = createHash("sha256")
    .update(heroBytes)
    .digest("hex")
    .slice(0, 14);
  const heroMetadata = await sharp(heroBytes).metadata();

  assert.ok(heroMetadata.width);
  assert.ok(heroMetadata.height);
  assert.ok(files.index.includes(`building-openstudio-nam-rack.webp?v=${heroHash}`));
  assert.ok(
    files.index.includes(
      `property="og:image:width" content="${heroMetadata.width}"`,
    ),
  );
  assert.ok(
    files.index.includes(
      `property="og:image:height" content="${heroMetadata.height}"`,
    ),
  );
  assert.match(files.pageSeo, /withVersionQuery/);
  assert.match(files.prerender, /getSocialImageMetadata/);
});
