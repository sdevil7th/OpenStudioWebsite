import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compactImageIndex,
  runtimeImageGroupsForAsset,
  splitRuntimeImageIndex,
} from "../scripts/generate-image-assets.mjs";
import { renderBlogArticleHtml } from "../scripts/blog-markdown-renderer.mjs";

const assetLoadingSource = readFileSync(
  new URL("../src/lib/assetLoading.ts", import.meta.url),
  "utf8",
);
const homePageSource = readFileSync(
  new URL("../src/pages/HomePage.tsx", import.meta.url),
  "utf8",
);
const blogPostSource = readFileSync(
  new URL("../src/pages/BlogPostPage.tsx", import.meta.url),
  "utf8",
);
const homeIndexSource = readFileSync(
  new URL("../src/lib/generatedImageRoutes/home.ts", import.meta.url),
  "utf8",
);

const entry = (width, src) => ({
  aspectRatio: 16 / 9,
  hash: "asset-hash",
  variants: [
    { src: `${src}-320.webp`, width: 320 },
    { src: `${src}-768.webp`, width: 768 },
    { src: `${src}-1600.webp`, width: 1600 },
  ],
  width,
});

test("runtime image metadata is split without changing compact entry semantics", () => {
  const homeAsset = "/assets/openstudio/screenshots/hero-timeline.webp";
  const transitionAsset =
    "/assets/openstudio/feature-story/transitions/mixer-collapse-mask.png";
  const blogAsset = "/assets/blogs/example.webp";
  const manifest = {
    [homeAsset]: entry(3838, "/generated/home"),
    [transitionAsset]: entry(1600, "/generated/transition"),
    [blogAsset]: entry(1200, "/generated/blog"),
  };
  const compact = compactImageIndex(manifest);
  const split = splitRuntimeImageIndex(manifest);

  assert.deepEqual(split.home[homeAsset], compact[homeAsset]);
  assert.deepEqual(split.features[transitionAsset], compact[transitionAsset]);
  assert.deepEqual(split.blogs[blogAsset], compact[blogAsset]);
  assert.equal(split.home[transitionAsset], undefined);
  assert.equal(split.home[blogAsset], undefined);
  assert.deepEqual(runtimeImageGroupsForAsset(homeAsset), ["home", "features", "ai"]);
});

test("client routes register scoped image metadata instead of importing the full registry", () => {
  assert.match(assetLoadingSource, /getGeneratedImageIndexEntry/);
  assert.doesNotMatch(assetLoadingSource, /generatedImageIndex(?:"|')/);
  assert.match(homePageSource, /generatedImageRoutes\/home/);
  assert.doesNotMatch(homeIndexSource, /feature-story\/transitions/);
  assert.doesNotMatch(homeIndexSource, /ace-step-diffusers/);
});

test("trusted Markdown is converted to controlled GFM HTML with responsive images", () => {
  const markdown = `# Hidden article title

*Hidden article dek.*

---

## Visible heading

Text with **weight**, ~~removed text~~, [an internal link](/features), and [an external link](https://example.com).

> A quoted paragraph.

\`inline code\`

\`\`\`js
const value = 1;
\`\`\`

| Feature | State |
| --- | --- |
| GFM | Working |

![Example image](/assets/blogs/example.webp)

<script>alert("unsafe")</script>`;
  const manifest = {
    "/assets/blogs/example.webp": entry(
      1920,
      "/assets/openstudio/generated/blogs/example-webp",
    ),
  };
  const html = renderBlogArticleHtml(markdown, manifest);

  assert.doesNotMatch(html, /Hidden article title|Hidden article dek/);
  assert.match(html, /<h2 class="mt-12[^>]*">Visible heading<\/h2>/);
  assert.match(html, /<strong class="font-semibold text-white">weight<\/strong>/);
  assert.match(html, /<del>removed text<\/del>/);
  assert.match(html, /href="\/features"/);
  assert.match(html, /href="https:\/\/example\.com" rel="noreferrer" target="_blank"/);
  assert.match(html, /<pre class="mt-8[^>]*"><code class="text-sm text-white\/88 language-js">/);
  assert.match(html, /<table class="w-full[^>]*"><thead/);
  assert.match(html, /src="\/assets\/openstudio\/generated\/blogs\/example-webp-768\.webp\?v=asset-hash"/);
  assert.match(html, /srcSet="[^\"]+320w, [^\"]+768w, [^\"]+1600w"/);
  assert.match(html, /height="1080"[^>]*width="1920"/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;alert/);
});

test("the BlogPost client keeps lazy loading and retry UI without Markdown runtimes", () => {
  assert.doesNotMatch(blogPostSource, /react-markdown|remark-gfm|ReactMarkdown/);
  assert.match(blogPostSource, /loadedPost\.articleHtml/);
  assert.match(blogPostSource, /dangerouslySetInnerHTML/);
  assert.match(blogPostSource, /Retry article/);
  assert.match(blogPostSource, /Loading article/);
});
