import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { selectVariantWidths } from "../scripts/generate-image-assets.mjs";

const blogPostSource = readFileSync(
  new URL("../src/pages/BlogPostPage.tsx", import.meta.url),
  "utf8",
);
const blogsPageSource = readFileSync(
  new URL("../src/pages/BlogsPage.tsx", import.meta.url),
  "utf8",
);
const featuresPageSource = readFileSync(
  new URL("../src/pages/FeaturesPage.tsx", import.meta.url),
  "utf8",
);
const generatorSource = readFileSync(
  new URL("../scripts/generate-image-assets.mjs", import.meta.url),
  "utf8",
);
const namHeroGeneratorSource = readFileSync(
  new URL("../scripts/generate-nam-blog-hero.mjs", import.meta.url),
  "utf8",
);
const imagePlanSource = readFileSync(
  new URL("../shared/asset-image-plan.ts", import.meta.url),
  "utf8",
);
const assetLoadingSource = readFileSync(
  new URL("../src/lib/assetLoading.ts", import.meta.url),
  "utf8",
);
const blogDataSource = readFileSync(
  new URL("../src/data/blogs.ts", import.meta.url),
  "utf8",
);
const blogContentSource = readFileSync(
  new URL("../src/data/blogContent.ts", import.meta.url),
  "utf8",
);
const blogHtmlGeneratorSource = readFileSync(
  new URL("../scripts/blog-markdown-renderer.mjs", import.meta.url),
  "utf8",
);
const pageSeoSource = readFileSync(
  new URL("../src/components/PageSeo.tsx", import.meta.url),
  "utf8",
);
const compiledImagePlan = ts.transpileModule(imagePlanSource, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const imagePlan = await import(
  `data:text/javascript;base64,${Buffer.from(compiledImagePlan).toString("base64")}`
);

test("all blog surfaces use responsive image attributes", () => {
  assert.match(blogPostSource, /getResponsiveImageAttributes/);
  assert.match(blogPostSource, /BLOG_HERO_SIZES/);
  assert.match(blogHtmlGeneratorSource, /INLINE_IMAGE_SIZES/);
  assert.match(blogHtmlGeneratorSource, /nearestGeneratedWidth\(768, sourceWidth\)/);
  assert.match(blogPostSource, /maxWidth: 3360/);
  assert.match(blogPostSource, /max-w-\[1920px\]/);
  assert.match(blogPostSource, /max-w-\[760px\]/);
  assert.match(blogPostSource, /data-blog-masthead/);
  assert.match(blogPostSource, /data-blog-hero/);
  assert.match(blogPostSource, /data-blog-body/);
  assert.doesNotMatch(blogPostSource, /3xl:w-\[80vw\]/);
  assert.doesNotMatch(blogPostSource, /md:w-\[88vw\]/);
  assert.match(blogsPageSource, /getResponsiveImageAttributes/);
  assert.match(blogsPageSource, /FEATURED_BLOG_IMAGE_SIZES/);
  assert.match(blogsPageSource, /BLOG_CARD_IMAGE_SIZES/);
});

test("the blog index carries metadata while generated article HTML is split per post", () => {
  assert.doesNotMatch(blogDataSource, /import\.meta\.glob/);
  assert.match(blogDataSource, /generatedBlogPosts/);
  assert.match(blogContentSource, /import\.meta\.glob<string>/);
  assert.match(blogContentSource, /\.\/generatedBlogContent\/\*\.ts/);
  assert.doesNotMatch(blogContentSource, /\?raw/);
  assert.doesNotMatch(blogContentSource, /eager:\s*true/);
  assert.match(blogContentSource, /pendingPosts/);
  assert.doesNotMatch(blogPostSource, /react-markdown|remark-gfm|ReactMarkdown/);
  assert.match(blogPostSource, /dangerouslySetInnerHTML/);
  assert.match(blogPostSource, /loadBlogPostContent/);
  assert.match(blogPostSource, /\.catch\(\(\) => \{/);
  assert.match(blogPostSource, /setArticleLoadError\(true\)/);
  assert.match(blogPostSource, /Retry article/);
  assert.match(blogsPageSource, /preloadBlogPostContent/);
});

test("SEO routes use the metadata-only generated image index", () => {
  assert.match(pageSeoSource, /generatedImageSeoIndex/);
  assert.doesNotMatch(pageSeoSource, /from "@\/lib\/generatedImageIndex"/);
  assert.match(generatorSource, /generatedImageSeoIndex/);
});

test("responsive blog images reserve their manifest aspect ratio before loading", () => {
  assert.deepEqual(imagePlan.intrinsicImageDimensions(1920, 16 / 9), {
    height: 1080,
    width: 1920,
  });
  assert.match(assetLoadingSource, /height: entry\?\.intrinsicHeight/);
  assert.match(assetLoadingSource, /width: entry\?\.intrinsicWidth/);
  assert.match(assetLoadingSource, /intrinsicImageDimensions\(entry\[0\], entry\[1\] \|\| undefined\)/);
});

test("asset versioning replaces an existing version while preserving other query data", () => {
  const versionedSrc = imagePlan.withVersionQuery(
    "/assets/blogs/example.webp?download=1&v=old#preview",
    "new hash",
  );

  assert.equal(
    versionedSrc,
    "/assets/blogs/example.webp?download=1&v=new+hash#preview",
  );

  const cdnUrl = imagePlan.netlifyImageCdnUrl({
    hash: "manifest-hash",
    quality: 72,
    src: "/assets/blogs/example.webp?download=1&v=stale",
    width: 640,
  });
  const cdnParams = new URL(cdnUrl, "https://openstudio.org.in").searchParams;
  const nestedSource = new URL(
    cdnParams.get("url"),
    "https://openstudio.org.in",
  );

  assert.equal(nestedSource.searchParams.get("download"), "1");
  assert.deepEqual(nestedSource.searchParams.getAll("v"), ["manifest-hash"]);
  assert.equal((cdnParams.get("url").match(/\?/g) ?? []).length, 1);
});

test("TONE3000 mobile art uses its full native candidate without being stretched", () => {
  assert.deepEqual(
    selectVariantWidths([320, 480, 640, 768, 960, 1280, 1600], 380),
    [320, 380],
  );
  assert.match(
    featuresPageSource,
    /tone3000Feature\.mobileScreenshot\.src[\s\S]*maxWidth: 380/,
  );
  assert.match(
    featuresPageSource,
    /<source[\s\S]*height=\{tone3000MobileImage\.height\}[\s\S]*width=\{tone3000MobileImage\.width\}/,
  );
  assert.match(featuresPageSource, /max-w-\[380px\][\s\S]*sm:max-w-none/);
});

test("responsive generation never labels an enlarged image as a native-width candidate", () => {
  for (const sourceWidth of [24, 380, 1200, 1920]) {
    const variants = selectVariantWidths(
      [320, 480, 640, 768, 960, 1280, 1600],
      sourceWidth,
    );

    assert.ok(variants.every((width) => width <= sourceWidth));
  }
});

test("the shared image pipeline plans and generates blog assets", () => {
  assert.match(imagePlanSource, /BLOG_ASSET_PREFIX = "\/assets\/blogs\/"/);
  assert.match(imagePlanSource, /generatedDirectory = isBlogAsset \? "blogs\/" : ""/);
  assert.match(imagePlanSource, /3200, 3360/);
  assert.match(generatorSource, /blogAssetsRoot/);
  assert.match(generatorSource, /HIGH_RESOLUTION_BLOG_MASTERS/);
  assert.match(generatorSource, /withoutEnlargement: true/);
  assert.doesNotMatch(generatorSource, /allowEnlargement/);
  assert.doesNotMatch(generatorSource, /publishedBlogSlugs/);
  assert.match(generatorSource, /writeGeneratedImageIndex/);
  assert.match(generatorSource, /height: sourceHeight/);
  assert.match(generatorSource, /width: sourceWidth/);
  assert.match(imagePlanSource, /maximumAvailableWidth/);
});

test("the NAM hero keeps real screenshots in a clean foreground stack", () => {
  const preIndex = namHeroGeneratorSource.indexOf("input: preScreen");
  const postIndex = namHeroGeneratorSource.indexOf("input: postScreen");
  const ampIndex = namHeroGeneratorSource.indexOf("input: ampScreen");

  assert.ok(preIndex >= 0);
  assert.ok(postIndex > preIndex);
  assert.ok(ampIndex > postIndex);
  assert.match(namHeroGeneratorSource, /nearLossless: true/);
  assert.doesNotMatch(namHeroGeneratorSource, /stroke=/);
});
