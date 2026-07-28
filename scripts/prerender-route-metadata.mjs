import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createServer } from "vite";

const scriptPath = fileURLToPath(import.meta.url);
const defaultRepoRoot = path.resolve(path.dirname(scriptPath), "..");

const DEFAULT_STATIC_LASTMOD = "2026-06-09";
const DEFAULT_NAM_RACK_LASTMOD = "2026-07-27";
const DEFAULT_SITE_NAME = "OpenStudio";
const DEFAULT_SITE_URL = "https://openstudio.org.in";
const DEFAULT_SITE_IMAGE =
  "/assets/openstudio/branding/og-image.png?v=2";
const DEFAULT_IMAGE_METADATA = {
  height: 630,
  width: 1200,
};
const STATIC_ROUTE_START = "<!-- openstudio-static-route:start -->";
const STATIC_ROUTE_END = "<!-- openstudio-static-route:end -->";

const sitemapMetadata = new Map([
  ["/", { changefreq: "weekly", priority: "1.0" }],
  ["/features", { changefreq: "monthly", priority: "0.9" }],
  ["/download", { changefreq: "weekly", priority: "0.9" }],
  ["/ai", { changefreq: "monthly", priority: "0.8" }],
  ["/releases", { changefreq: "weekly", priority: "0.8" }],
  ["/blogs", { changefreq: "weekly", priority: "0.7" }],
  ["/github", { changefreq: "monthly", priority: "0.6" }],
  ["/contact", { changefreq: "monthly", priority: "0.5" }],
  ["/privacy", { changefreq: "yearly", priority: "0.3" }],
  ["/security", { changefreq: "yearly", priority: "0.3" }],
  ["/terms", { changefreq: "yearly", priority: "0.3" }],
]);

const staticRouteStyles = `
      #root > [data-static-route-content] {
        box-sizing: border-box;
        width: min(100% - 2rem, 80rem);
        margin: 0 auto;
        padding: 1.25rem 0 5rem;
        color: #edf3fa;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.7;
      }
      [data-static-route-content] * { box-sizing: border-box; }
      [data-static-route-content] a { color: #cdb1ff; }
      [data-static-route-content] img {
        display: block;
        max-width: 100%;
        height: auto;
        border-radius: 1rem;
      }
      [data-static-route-content] h1,
      [data-static-route-content] h2,
      [data-static-route-content] h3 {
        line-height: 1.12;
        text-wrap: balance;
      }
      [data-static-route-content] h1 {
        max-width: 18ch;
        margin: 1.25rem 0;
        font-size: clamp(2.5rem, 7vw, 5.75rem);
      }
      [data-static-route-content] h2 {
        margin-top: 2.75rem;
        font-size: clamp(1.75rem, 4vw, 3rem);
      }
      [data-static-route-content] h3 { margin-bottom: 0.35rem; }
      [data-static-route-content] p,
      [data-static-route-content] li { max-width: 72ch; }
      [data-static-route-content] figure { margin: 2rem 0; }
      [data-static-route-content] figcaption {
        max-width: 72ch;
        margin-top: 0.75rem;
        color: #aeb9c8;
        font-size: 0.92rem;
      }
      [data-static-route-content] table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
      }
      [data-static-route-content] th,
      [data-static-route-content] td {
        padding: 0.75rem;
        border: 1px solid #29303d;
        text-align: left;
        vertical-align: top;
      }
      [data-static-route-content] pre {
        max-width: 100%;
        overflow: auto;
        padding: 1rem;
        border: 1px solid #29303d;
        border-radius: 0.75rem;
        background: #090c13;
      }
      .os-static-site-header,
      .os-static-site-footer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.85rem 0;
        border-bottom: 1px solid #202633;
      }
      .os-static-site-footer {
        margin-top: 4rem;
        border-top: 1px solid #202633;
        border-bottom: 0;
      }
      .os-static-brand {
        color: #f8fbff !important;
        font-weight: 800;
        text-decoration: none;
      }
      .os-static-nav,
      .os-static-actions,
      .os-static-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem 1.25rem;
      }
      .os-static-nav a,
      .os-static-actions a { text-decoration: none; }
      .os-static-hero,
      .os-static-section { padding: 2.5rem 0; }
      .os-static-eyebrow {
        color: #76e6bd;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .os-static-lede {
        max-width: 68ch;
        color: #c8d2df;
        font-size: clamp(1.05rem, 2vw, 1.3rem);
      }
      .os-static-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
        gap: 1rem;
        padding: 0;
        list-style: none;
      }
      .os-static-card {
        padding: 1.1rem;
        border: 1px solid #252d3a;
        border-radius: 0.85rem;
        background: #090c13;
      }
      .os-static-card > :first-child { margin-top: 0; }
      .os-static-card > :last-child { margin-bottom: 0; }
      .os-static-article {
        width: min(100%, 76rem);
        margin: 0 auto;
      }
      .os-static-article-body {
        width: min(100%, 72ch);
        margin: 0 auto;
      }
      .os-static-article-body figure,
      .os-static-article-body p:has(> a > img) {
        width: min(92vw, 76rem);
        max-width: none;
        margin-left: 50%;
        transform: translateX(-50%);
      }
      @media (max-width: 42rem) {
        #root > [data-static-route-content] { width: min(100% - 1.25rem, 80rem); }
        [data-static-route-content] h1 { font-size: clamp(2.25rem, 12vw, 3.5rem); }
        [data-static-route-content] th,
        [data-static-route-content] td { padding: 0.5rem; }
      }
`;

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const safeJson = (value) =>
  JSON.stringify(value)
    .replaceAll("&", "\\u0026")
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");

const normalizeDate = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1];
};

const getPostPublishedDate = (post) =>
  normalizeDate(post.datePublished ?? post.date);

export const getPostModifiedDate = (post) =>
  normalizeDate(
    post.dateModified ??
      post.modifiedDate ??
      post.updatedAt ??
      post.datePublished ??
      post.date,
  );

export const getNewestPostModifiedDate = (
  posts,
  fallback = DEFAULT_STATIC_LASTMOD,
) => {
  const newest = posts
    .map(getPostModifiedDate)
    .filter(Boolean)
    .sort((first, second) => second.localeCompare(first))[0];

  return newest ?? fallback;
};

const getSeoLastModified = (seo, fallback = DEFAULT_STATIC_LASTMOD) =>
  normalizeDate(seo?.lastModified) ?? fallback;

const withVersionQuery = (src, hash) => {
  if (!hash) {
    return src;
  }

  const url = new URL(src, DEFAULT_SITE_URL);
  url.searchParams.set("v", hash);

  if (/^https?:\/\//i.test(src)) {
    return url.toString();
  }

  return `${url.pathname}${url.search}${url.hash}`;
};

const getGeneratedImageEntry = (src, generatedImageIndex, siteUrl) => {
  if (!src) {
    return undefined;
  }

  const pathname = new URL(src, siteUrl).pathname;
  return generatedImageIndex[pathname];
};

const getSocialImageMetadata = (
  src,
  generatedImageIndex,
  siteUrl,
) => {
  const source = src ?? DEFAULT_SITE_IMAGE;
  const url = new URL(source, siteUrl);
  const entry = generatedImageIndex[url.pathname];

  if (!entry) {
    return {
      ...DEFAULT_IMAGE_METADATA,
      src: url.toString(),
    };
  }

  const [width, aspectRatio, hash] = entry;
  url.searchParams.set("v", hash);

  return {
    height: Math.max(1, Math.round(width / aspectRatio)),
    src: url.toString(),
    width,
  };
};

const getResponsiveImageProps = ({
  alt,
  generatedImageIndex,
  loading = "lazy",
  sizes = "(min-width: 80rem) 72rem, calc(100vw - 2rem)",
  src,
  siteUrl,
}) => {
  if (!src) {
    return undefined;
  }

  const entry = getGeneratedImageEntry(src, generatedImageIndex, siteUrl);
  const sourceUrl = new URL(src, siteUrl);
  const relativeSource = `${sourceUrl.pathname}${sourceUrl.search}`;

  if (!entry) {
    return {
      alt: alt ?? "",
      decoding: "async",
      loading,
      src: relativeSource,
    };
  }

  const [width, aspectRatio, hash, variants] = entry;
  const versionedVariants = variants.map(([variantWidth, variantSrc]) => [
    variantWidth,
    withVersionQuery(variantSrc, hash),
  ]);
  const fallbackSrc =
    versionedVariants.at(-1)?.[1] ??
    withVersionQuery(sourceUrl.pathname, hash);

  return {
    alt: alt ?? "",
    decoding: "async",
    height: Math.max(1, Math.round(width / aspectRatio)),
    loading,
    sizes,
    src: fallbackSrc,
    srcSet: versionedVariants
      .map(([variantWidth, variantSrc]) => `${variantSrc} ${variantWidth}w`)
      .join(", "),
    width,
  };
};

const normalizeAuthorSchema = (author, siteName, siteUrl) => {
  if (Array.isArray(author) || (author && typeof author === "object")) {
    return author;
  }

  if (typeof author === "string" && author.trim()) {
    return {
      "@type": "Organization",
      name: author.trim(),
      url: siteUrl,
    };
  }

  return {
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
  };
};

const normalizeBlogPostJsonLd = ({
  jsonLd,
  post,
  postUrl,
  siteImage,
  siteName,
  siteUrl,
  socialImage,
}) => {
  const datePublished = getPostPublishedDate(post);
  const dateModified = getPostModifiedDate(post);
  const data = {
    ...(jsonLd ?? {}),
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    author: normalizeAuthorSchema(jsonLd?.author ?? post.author, siteName, siteUrl),
    headline: post.title,
    description: post.seoDescription ?? post.summary,
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    image:
      socialImage ??
      new URL(post.image ?? siteImage, siteUrl).toString(),
    wordCount: post.wordCount,
    timeRequired: `PT${post.readTimeMinutes}M`,
    isPartOf: {
      "@type": "Blog",
      name: `${siteName} Blog`,
      url: new URL("/blogs", siteUrl).toString(),
    },
    publisher: jsonLd?.publisher ?? {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    ...(post.keywords?.length
      ? { keywords: post.keywords.join(", ") }
      : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };

  if (!datePublished) {
    delete data.datePublished;
  }

  if (!dateModified) {
    delete data.dateModified;
  }

  return data;
};

const normalizeBlogIndexJsonLd = ({
  jsonLd,
  posts,
  siteImage,
  siteName,
  siteUrl,
}) => {
  const postsByUrl = new Map(
    posts.map((post) => [
      new URL(`/blogs/${post.slug}`, siteUrl).toString(),
      post,
    ]),
  );
  const runtimeEntries = Array.isArray(jsonLd?.blogPost)
    ? jsonLd.blogPost
    : [];
  const runtimeEntriesByUrl = new Map(
    runtimeEntries
      .filter((entry) => entry?.url)
      .map((entry) => [entry.url, entry]),
  );

  return {
    ...(jsonLd ?? {}),
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteName} Blog`,
    url: new URL("/blogs", siteUrl).toString(),
    image: new URL(siteImage, siteUrl).toString(),
    blogPost: posts.map((post) => {
      const url = new URL(`/blogs/${post.slug}`, siteUrl).toString();
      const entry = runtimeEntriesByUrl.get(url);
      const datePublished = getPostPublishedDate(post);
      const dateModified = getPostModifiedDate(post);

      return {
        ...(entry ?? {}),
        "@type": "BlogPosting",
        author: normalizeAuthorSchema(
          entry?.author ?? post.author,
          siteName,
          siteUrl,
        ),
        headline: post.title,
        description: post.summary,
        url,
        ...(post.image
          ? { image: new URL(post.image, siteUrl).toString() }
          : {}),
        ...(datePublished ? { datePublished } : {}),
        ...(dateModified ? { dateModified } : {}),
      };
    }),
  };
};

const staticHeader = (siteName) =>
  h(
    "header",
    { className: "os-static-site-header" },
    h("a", { className: "os-static-brand", href: "/" }, siteName),
    h(
      "nav",
      { "aria-label": "Primary navigation", className: "os-static-nav" },
      [
        ["Features", "/features"],
        ["AI", "/ai"],
        ["Releases", "/releases"],
        ["Blog", "/blogs"],
        ["Download", "/download"],
      ].map(([label, href]) =>
        h("a", { href, key: href }, label),
      ),
    ),
  );

const staticFooter = (siteName) =>
  h(
    "footer",
    { className: "os-static-site-footer" },
    h("span", null, `© ${new Date().getUTCFullYear()} ${siteName}`),
    h(
      "nav",
      { "aria-label": "Footer navigation", className: "os-static-nav" },
      h("a", { href: "/privacy" }, "Privacy"),
      h("a", { href: "/security" }, "Security"),
      h("a", { href: "/terms" }, "Terms"),
    ),
  );

const staticShell = (main, siteName) =>
  h(
    "div",
    {
      className: "os-static-route",
      "data-static-route-content": "",
    },
    staticHeader(siteName),
    main,
    staticFooter(siteName),
  );

const actionLinks = (actions) =>
  h(
    "div",
    { className: "os-static-actions" },
    actions
      .map((action) => ({
        ...action,
        href: action?.to ?? action?.href,
      }))
      .filter((action) => action?.label && action?.href)
      .map((action) =>
        h(
          "a",
          {
            href: action.href,
            key: `${action.label}-${action.href}`,
            ...(action.external ? { rel: "noreferrer" } : {}),
          },
          action.label,
        ),
      ),
  );

const dataCards = (items) =>
  h(
    "ul",
    { className: "os-static-grid" },
    items.map((item, index) =>
      h(
        "li",
        {
          className: "os-static-card",
          key: item.id ?? item.title ?? index,
        },
        item.eyebrow
          ? h("p", { className: "os-static-eyebrow" }, item.eyebrow)
          : null,
        h(
          "h3",
          null,
          item.href
            ? h("a", { href: item.href }, item.title ?? item.label ?? item.value)
            : item.title ?? item.label ?? item.value,
        ),
        item.description || item.summary || item.note
          ? h("p", null, item.description ?? item.summary ?? item.note)
          : null,
        item.value &&
        item.value !== (item.title ?? item.label)
          ? h("p", null, item.value)
          : null,
        item.artifactType ||
        item.status ||
        item.dateLabel ||
        item.metric ||
        item.version
          ? h(
              "p",
              { className: "os-static-meta" },
              [
                item.artifactType,
                item.status,
                item.dateLabel,
                item.metric,
                item.version,
              ]
                .filter(Boolean)
                .join(" · "),
            )
          : null,
        (item.points ?? item.details ?? item.bullets ?? item.notes)?.length
          ? h(
              "ul",
              null,
              (
                item.points ??
                item.details ??
                item.bullets ??
                item.notes
              ).map((point) => h("li", { key: point }, point)),
            )
          : null,
      ),
    ),
  );

const staticFigure = ({
  asset,
  generatedImageIndex,
  loading,
  siteUrl,
}) => {
  if (!asset?.src) {
    return null;
  }

  return h(
    "figure",
    null,
    h(
      "img",
      getResponsiveImageProps({
        alt: asset.alt,
        generatedImageIndex,
        loading,
        src: asset.src,
        siteUrl,
      }),
    ),
    asset.caption ? h("figcaption", null, asset.caption) : null,
  );
};

export const renderHomeStaticContent = ({
  generatedImageIndex = {},
  homeData,
  siteName = DEFAULT_SITE_NAME,
  siteUrl = DEFAULT_SITE_URL,
}) =>
  renderToStaticMarkup(
    staticShell(
      h(
        "main",
        null,
        h(
          "section",
          { className: "os-static-hero" },
          h("p", { className: "os-static-eyebrow" }, homeData.homeHero.eyebrow),
          h("h1", null, homeData.homeHero.title),
          homeData.homeHero.supportLine
            ? h("p", { className: "os-static-lede" }, homeData.homeHero.supportLine)
            : null,
          h("p", { className: "os-static-lede" }, homeData.homeHero.description),
          actionLinks([
            homeData.homeHero.primaryCta,
            homeData.homeHero.secondaryCta,
            homeData.homeHero.tertiaryCta,
          ]),
        ),
        h(
          "section",
          { className: "os-static-section" },
          h("p", { className: "os-static-eyebrow" }, homeData.homeNamRack.eyebrow),
          h("h2", null, homeData.homeNamRack.title),
          h("p", { className: "os-static-lede" }, homeData.homeNamRack.description),
          h(
            "ul",
            null,
            homeData.homeNamRack.proof.map((item) =>
              h("li", { key: item }, item),
            ),
          ),
          h("p", null, homeData.homeNamRack.caveat),
          actionLinks([homeData.homeNamRack.cta]),
          staticFigure({
            asset: homeData.homeNamRack.screenshot,
            generatedImageIndex,
            loading: "eager",
            siteUrl,
          }),
        ),
        h(
          "section",
          { className: "os-static-section" },
          h(
            "p",
            { className: "os-static-eyebrow" },
            homeData.homeAlternativePositioning.eyebrow,
          ),
          h("h2", null, homeData.homeAlternativePositioning.title),
          h("p", null, homeData.homeAlternativePositioning.description),
          h("p", null, homeData.homeAlternativePositioning.supporting),
          homeData.homeAlternativePositioning.terms?.length
            ? h(
                "ul",
                null,
                homeData.homeAlternativePositioning.terms.map((term) =>
                  h("li", { key: term }, term),
                ),
              )
            : null,
          homeData.homeAlternativePositioning.links?.length
            ? actionLinks(homeData.homeAlternativePositioning.links)
            : null,
        ),
        h(
          "section",
          { className: "os-static-section" },
          h("h2", null, "Production workflows that stay connected"),
          dataCards(homeData.homePillars),
        ),
        h(
          "section",
          { className: "os-static-section" },
          h("h2", null, "OpenStudio questions, answered"),
          h(
            "dl",
            null,
            homeData.homeFaqs.map(({ answer, question }) =>
              h(
                "div",
                { className: "os-static-card", key: question },
                h("dt", null, h("strong", null, question)),
                h("dd", null, answer),
              ),
            ),
          ),
        ),
      ),
      siteName,
    ),
  );

const comparisonTable = (comparison) =>
  h(
    "div",
    { className: "os-static-comparison" },
    h(
      "table",
      null,
      h("caption", null, comparison.title),
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          h("th", { scope: "col" }, "Capability"),
          comparison.products.map((product) =>
            h("th", { key: product, scope: "col" }, product),
          ),
        ),
      ),
      h(
        "tbody",
        null,
        comparison.rows.map((row) =>
          h(
            "tr",
            { key: row.label },
            h("th", { scope: "row" }, row.label),
            row.values.map((value, index) =>
              h(
                "td",
                { key: `${row.label}-${comparison.products[index]}` },
                value,
              ),
            ),
          ),
        ),
      ),
    ),
  );

export const renderFeaturesStaticContent = ({
  featureData,
  generatedImageIndex = {},
  siteName = DEFAULT_SITE_NAME,
  siteUrl = DEFAULT_SITE_URL,
}) =>
  renderToStaticMarkup(
    staticShell(
      h(
        "main",
        null,
        h(
          "section",
          { className: "os-static-hero" },
          h(
            "p",
            { className: "os-static-eyebrow" },
            featureData.featurePageHero.eyebrow,
          ),
          h("h1", null, featureData.featurePageHero.title),
          h(
            "p",
            { className: "os-static-lede" },
            featureData.featurePageHero.description,
          ),
          h(
            "ul",
            null,
            featureData.featureHighlights.map((item) =>
              h("li", { key: item }, item),
            ),
          ),
        ),
        h(
          "section",
          { className: "os-static-section", id: "nam-rack" },
          h(
            "p",
            { className: "os-static-eyebrow" },
            featureData.guitarRigComparison.eyebrow,
          ),
          h("h2", null, featureData.guitarRigComparison.title),
          h("p", null, featureData.guitarRigComparison.description),
          comparisonTable(featureData.guitarRigComparison),
          h("p", null, featureData.guitarRigComparison.note),
          h(
            "ul",
            null,
            featureData.guitarRigComparison.sources.map((source) =>
              h(
                "li",
                { key: source.href },
                h("a", { href: source.href }, source.label),
              ),
            ),
          ),
        ),
        h(
          "section",
          { className: "os-static-section" },
          h(
            "p",
            { className: "os-static-eyebrow" },
            featureData.tone3000Feature.eyebrow,
          ),
          h("h2", null, featureData.tone3000Feature.title),
          h("p", null, featureData.tone3000Feature.description),
          h(
            "ul",
            null,
            featureData.tone3000Feature.points.map((point) =>
              h("li", { key: point }, point),
            ),
          ),
          staticFigure({
            asset: featureData.tone3000Feature.screenshot,
            generatedImageIndex,
            siteUrl,
          }),
        ),
        h(
          "section",
          { className: "os-static-section" },
          h("h2", null, "OpenStudio feature map"),
          featureData.featureCategories.map((category) =>
            h(
              "section",
              { key: category.id },
              h("h2", null, category.title),
              h("p", null, category.description),
              dataCards(category.items),
            ),
          ),
        ),
      ),
      siteName,
    ),
  );

const genericSectionContent = (items) => {
  if (!items?.length) {
    return null;
  }

  if (items.every((item) => typeof item === "string")) {
    return h(
      "ul",
      null,
      items.map((item) => h("li", { key: item }, item)),
    );
  }

  return dataCards(items);
};

export const renderGenericStaticContent = ({
  actions = [],
  eyebrow,
  hero,
  sections = [],
  siteName = DEFAULT_SITE_NAME,
}) =>
  renderToStaticMarkup(
    staticShell(
      h(
        "main",
        null,
        h(
          "header",
          { className: "os-static-hero" },
          h(
            "p",
            { className: "os-static-eyebrow" },
            eyebrow ?? hero.eyebrow,
          ),
          h("h1", null, hero.title),
          h("p", { className: "os-static-lede" }, hero.description),
          actionLinks(
            actions.length
              ? actions
              : [hero.primaryCta, hero.secondaryCta].filter(Boolean),
          ),
        ),
        sections.map((section, index) =>
          h(
            "section",
            {
              className: "os-static-section",
              id: section.id,
              key: section.id ?? section.title ?? index,
            },
            section.eyebrow
              ? h(
                  "p",
                  { className: "os-static-eyebrow" },
                  section.eyebrow,
                )
              : null,
            h("h2", null, section.title),
            section.description ? h("p", null, section.description) : null,
            genericSectionContent(section.items),
          ),
        ),
      ),
      siteName,
    ),
  );

export const renderLegalStaticContent = ({
  document,
  siteName = DEFAULT_SITE_NAME,
}) =>
  renderToStaticMarkup(
    staticShell(
      h(
        "main",
        null,
        h(
          "header",
          { className: "os-static-hero" },
          h("p", { className: "os-static-eyebrow" }, document.eyebrow),
          h("h1", null, document.title),
          h("p", { className: "os-static-lede" }, document.summary),
          actionLinks(document.links ?? []),
        ),
        document.facts?.length
          ? h(
              "section",
              { "aria-label": `${document.title} facts`, className: "os-static-section" },
              dataCards(
                document.facts.map((fact) => ({
                  title: fact.label,
                  description: fact.value,
                })),
              ),
            )
          : null,
        document.sections.map((section) =>
          h(
            "section",
            { className: "os-static-section", key: section.title },
            h("h2", null, section.title),
            section.paragraphs.map((paragraph, index) =>
              h("p", { key: `${section.title}-paragraph-${index}` }, paragraph),
            ),
            section.bullets?.length
              ? h(
                  "ul",
                  null,
                  section.bullets.map((bullet) =>
                    h("li", { key: bullet }, bullet),
                  ),
                )
              : null,
          ),
        ),
      ),
      siteName,
    ),
  );

const blogPostMeta = (post) => {
  const values = [];

  if (post.author) {
    values.push(h("span", { key: "author" }, post.author));
  }

  if (post.date) {
    values.push(
      h(
        "time",
        { dateTime: post.date, key: "published" },
        post.dateLabel ?? post.date,
      ),
    );
  }

  if (post.dateModified && post.dateModified !== post.date) {
    values.push(
      h(
        "time",
        { dateTime: post.dateModified, key: "modified" },
        `Updated ${post.dateModifiedLabel ?? post.dateModified}`,
      ),
    );
  }

  values.push(
    h(
      "span",
      { key: "read-time" },
      `${post.readTimeMinutes} min read`,
    ),
  );

  return h("div", { className: "os-static-meta" }, values);
};

export const renderBlogsStaticContent = ({
  blogData,
  generatedImageIndex = {},
  siteName = DEFAULT_SITE_NAME,
  siteUrl = DEFAULT_SITE_URL,
}) =>
  renderToStaticMarkup(
    staticShell(
      h(
        "main",
        null,
        h(
          "header",
          { className: "os-static-hero" },
          h("p", { className: "os-static-eyebrow" }, "OpenStudio Blog"),
          h("h1", null, "Engineering notes from an open-source DAW"),
          h("p", { className: "os-static-lede" }, blogData.blogsSeo.description),
        ),
        h(
          "section",
          { "aria-label": "Blog posts", className: "os-static-section" },
          blogData.blogPosts.map((post) =>
            h(
              "article",
              { className: "os-static-card", key: post.slug },
              h(
                "h2",
                null,
                h("a", { href: `/blogs/${post.slug}` }, post.title),
              ),
              blogPostMeta(post),
              h("p", null, post.summary),
              post.image
                ? staticFigure({
                    asset: {
                      alt: post.imageAlt,
                      caption: post.dek,
                      src: post.image,
                    },
                    generatedImageIndex,
                    siteUrl,
                  })
                : null,
            ),
          ),
        ),
      ),
      siteName,
    ),
  );

const markdownComponents = ({
  generatedImageIndex,
  siteUrl,
}) => ({
  a: ({ children, href, ...props }) =>
    h(
      "a",
      {
        ...props,
        href,
        ...(href && /^https?:\/\//i.test(href)
          ? { rel: "noreferrer" }
          : {}),
      },
      children,
    ),
  h1: ({ children, ...props }) => h("h2", props, children),
  img: ({ alt, src, title }) =>
    h("img", {
      ...getResponsiveImageProps({
        alt,
        generatedImageIndex,
        src,
        siteUrl,
      }),
      title,
    }),
});

export const renderBlogPostStaticContent = ({
  generatedImageIndex = {},
  post,
  siteName = DEFAULT_SITE_NAME,
  siteUrl = DEFAULT_SITE_URL,
}) =>
  renderToStaticMarkup(
    staticShell(
      h(
        "main",
        null,
        h(
          "article",
          { className: "os-static-article" },
          h(
            "header",
            { className: "os-static-hero" },
            h("p", { className: "os-static-eyebrow" }, "OpenStudio Blog"),
            h("h1", null, post.title),
            h("p", { className: "os-static-lede" }, post.dek),
            blogPostMeta(post),
            post.image
              ? staticFigure({
                  asset: {
                    alt: post.imageAlt,
                    caption: post.dek,
                    src: post.image,
                  },
                  generatedImageIndex,
                  loading: "eager",
                  siteUrl,
                })
              : null,
          ),
          h(
            "div",
            { className: "os-static-article-body" },
            post.articleContent
              ? h(
                  ReactMarkdown,
                  {
                    components: markdownComponents({
                      generatedImageIndex,
                      siteUrl,
                    }),
                    remarkPlugins: [remarkGfm],
                  },
                  post.articleContent,
                )
              : h("p", null, post.summary),
          ),
        ),
      ),
      siteName,
    ),
  );

const metaPattern = (attribute, name) =>
  new RegExp(
    `<meta\\b(?=[^>]*\\b${escapeRegExp(attribute)}=["']${escapeRegExp(name)}["'])[^>]*>\\s*`,
    "gi",
  );

export const removeMeta = (html, selector) => {
  const [attribute, name] = selector;
  return html.replace(metaPattern(attribute, name), "");
};

const setMeta = (html, selector, value) => {
  const [attribute, name] = selector;
  const withoutExisting = removeMeta(html, selector);

  if (value === undefined || value === null || value === "") {
    return withoutExisting;
  }

  const replacement = `<meta ${attribute}="${escapeHtml(name)}" content="${escapeHtml(value)}" />`;
  return withoutExisting.replace(
    "</head>",
    `    ${replacement}\n  </head>`,
  );
};

const setTitle = (html, title) => {
  const replacement = `<title>${escapeHtml(title)}</title>`;

  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, replacement);
  }

  return html.replace("</head>", `    ${replacement}\n  </head>`);
};

const setCanonical = (html, url) => {
  const withoutExisting = html.replace(
    /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi,
    "",
  );
  const replacement = `<link rel="canonical" href="${escapeHtml(url)}" />`;

  return withoutExisting.replace(
    "</head>",
    `    ${replacement}\n  </head>`,
  );
};

const setRouteJsonLd = (html, jsonLd) =>
  html.replace(
    "</head>",
    `    <script type="application/ld+json" data-static-route>${safeJson(jsonLd)}</script>\n  </head>`,
  );

const setStaticRouteStyles = (html, enabled) => {
  const withoutExisting = html.replace(
    /<style\b(?=[^>]*\bdata-static-route-styles\b)[^>]*>[\s\S]*?<\/style>\s*/gi,
    "",
  );

  if (!enabled) {
    return withoutExisting;
  }

  return withoutExisting.replace(
    "</head>",
    `    <style data-static-route-styles>${staticRouteStyles}</style>\n  </head>`,
  );
};

const clearGeneratedArtifacts = (html) =>
  removeMeta(
    removeMeta(
      removeMeta(
        removeMeta(
          removeMeta(
            html
              .replace(
                /<script\b(?=[^>]*\bdata-static-route\b)[^>]*>[\s\S]*?<\/script>\s*/gi,
                "",
              )
              .replace(
                /<style\b(?=[^>]*\bdata-static-route-styles\b)[^>]*>[\s\S]*?<\/style>\s*/gi,
                "",
              )
              .replace(
                new RegExp(
                  `${escapeRegExp(STATIC_ROUTE_START)}[\\s\\S]*?${escapeRegExp(STATIC_ROUTE_END)}`,
                  "g",
                ),
                "",
              ),
            ["property", "article:author"],
          ),
          ["property", "article:published_time"],
        ),
        ["property", "article:modified_time"],
      ),
      ["property", "article:section"],
    ),
    ["name", "keywords"],
  );

const setRootContent = (html, staticContent) => {
  const rootPattern =
    /(<div\b(?=[^>]*\bid=["']root["'])[^>]*>)\s*<\/div>/i;

  if (!rootPattern.test(html)) {
    throw new Error(
      "Unable to inject static route content because #root is not empty or is missing.",
    );
  }

  return html.replace(
    rootPattern,
    `$1${STATIC_ROUTE_START}${staticContent ?? ""}${STATIC_ROUTE_END}</div>`,
  );
};

const getDefaultJsonLd = ({
  route,
  routeImage,
  siteName,
  siteUrl,
  url,
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: route.title,
  description: route.description,
  url,
  image: routeImage,
  isPartOf: {
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  },
});

export const buildRouteHtml = (
  template,
  route,
  {
    generatedImageIndex = {},
    siteImage = DEFAULT_SITE_IMAGE,
    siteName = DEFAULT_SITE_NAME,
    siteUrl = DEFAULT_SITE_URL,
  } = {},
) => {
  const url = new URL(route.path, siteUrl).toString();
  const imageMetadata = getSocialImageMetadata(
    route.image ?? siteImage,
    generatedImageIndex,
    siteUrl,
  );
  const routeImageAlt = route.imageAlt ?? `${siteName} share image`;
  const jsonLd =
    route.jsonLd ??
    getDefaultJsonLd({
      route,
      routeImage: imageMetadata.src,
      siteName,
      siteUrl,
      url,
    });
  let html = clearGeneratedArtifacts(template);

  html = setTitle(html, route.title);
  html = setMeta(html, ["name", "description"], route.description);
  html = setMeta(html, ["property", "og:type"], route.ogType ?? "website");
  html = setMeta(html, ["property", "og:title"], route.title);
  html = setMeta(html, ["property", "og:description"], route.description);
  html = setMeta(html, ["property", "og:url"], url);
  html = setMeta(html, ["property", "og:image"], imageMetadata.src);
  html = setMeta(html, ["property", "og:image:alt"], routeImageAlt);
  html = setMeta(
    html,
    ["property", "og:image:width"],
    String(imageMetadata.width),
  );
  html = setMeta(
    html,
    ["property", "og:image:height"],
    String(imageMetadata.height),
  );
  html = setMeta(html, ["name", "twitter:title"], route.title);
  html = setMeta(
    html,
    ["name", "twitter:description"],
    route.description,
  );
  html = setMeta(html, ["name", "twitter:image"], imageMetadata.src);
  html = setMeta(
    html,
    ["name", "twitter:image:alt"],
    routeImageAlt,
  );
  html = setMeta(
    html,
    ["property", "article:published_time"],
    route.ogType === "article" ? route.datePublished : undefined,
  );
  html = setMeta(
    html,
    ["property", "article:modified_time"],
    route.ogType === "article" ? route.dateModified : undefined,
  );
  html = setMeta(
    html,
    ["property", "article:section"],
    route.ogType === "article" ? "OpenStudio Blog" : undefined,
  );
  html = setMeta(
    html,
    ["property", "article:author"],
    route.ogType === "article" ? route.authorProfileUrl : undefined,
  );
  html = setCanonical(html, url);
  html = setRouteJsonLd(html, jsonLd);
  html = setStaticRouteStyles(html, Boolean(route.staticContent));
  html = setRootContent(html, route.staticContent);

  return html;
};

export const buildSitemapXml = (
  routes,
  {
    siteUrl = DEFAULT_SITE_URL,
    staticLastmod = DEFAULT_STATIC_LASTMOD,
  } = {},
) => {
  const urlEntries = routes
    .map((route) => {
      const metadata = sitemapMetadata.get(route.path) ?? {
        changefreq: route.changefreq ?? "monthly",
        priority: route.priority ?? "0.6",
      };
      const loc = new URL(route.path, siteUrl).toString();
      const lastmod = normalizeDate(route.lastmod) ?? staticLastmod;

      return [
        "  <url>",
        `    <loc>${escapeHtml(loc)}</loc>`,
        `    <lastmod>${escapeHtml(lastmod)}</lastmod>`,
        `    <changefreq>${escapeHtml(metadata.changefreq)}</changefreq>`,
        `    <priority>${escapeHtml(metadata.priority)}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    "</urlset>",
    "",
  ].join("\n");
};

const loadRuntimeData = async (repoRoot) => {
  const vite = await createServer({
    appType: "custom",
    configFile: false,
    logLevel: "error",
    resolve: {
      alias: {
        "@": path.join(repoRoot, "src"),
      },
    },
    root: repoRoot,
    server: {
      middlewareMode: true,
    },
  });

  try {
    const [
      constants,
      homeData,
      featureData,
      blogData,
      downloadData,
      aiData,
      githubData,
      releasesData,
      contactData,
      legalData,
      generatedImages,
    ] = await Promise.all([
      vite.ssrLoadModule("/src/constants/site.ts"),
      vite.ssrLoadModule("/src/data/home.ts"),
      vite.ssrLoadModule("/src/data/features.ts"),
      vite.ssrLoadModule("/src/data/blogs.ts"),
      vite.ssrLoadModule("/src/data/downloads.ts"),
      vite.ssrLoadModule("/src/data/stemSeparation.ts"),
      vite.ssrLoadModule("/src/data/github.ts"),
      vite.ssrLoadModule("/src/data/releases.ts"),
      vite.ssrLoadModule("/src/data/contact.ts"),
      vite.ssrLoadModule("/src/data/legal.ts"),
      vite.ssrLoadModule("/src/lib/generatedImageIndex.ts"),
    ]);

    return {
      aiData,
      blogData,
      constants,
      contactData,
      downloadData,
      featureData,
      generatedImageIndex: generatedImages.generatedImageIndex,
      githubData,
      homeData,
      legalData,
      releasesData,
    };
  } finally {
    await vite.close();
  }
};

const createRoutes = (runtime) => {
  const {
    aiData,
    blogData,
    constants,
    contactData,
    downloadData,
    featureData,
    generatedImageIndex,
    githubData,
    homeData,
    legalData,
    releasesData,
  } = runtime;
  const siteName = constants.SITE_NAME;
  const siteUrl = constants.SITE_URL;
  const siteImage = constants.SITE_OG_IMAGE;
  const standardSeoRoutes = [
    {
      seo: downloadData.downloadSeo,
      staticContent: renderGenericStaticContent({
        hero: downloadData.downloadHero,
        sections: [
          {
            title: "Choose your platform",
            description:
              "Use the current stable redirect for your operating system and keep the platform-specific trust notes visible.",
            items: downloadData.platformDownloads,
          },
          {
            title: "System requirements",
            items: downloadData.systemRequirements,
          },
          {
            title: "Release and install notes",
            items: [
              ...downloadData.releaseNotes,
              ...downloadData.autoUpdateNotes,
              ...downloadData.knownLimitations,
            ],
          },
        ],
        siteName,
      }),
    },
    {
      seo: aiData.stemSeparationSeo,
      staticContent: renderGenericStaticContent({
        hero: aiData.stemHero,
        sections: [
          {
            title: "Optional AI production tools",
            items: aiData.aiPillars,
          },
          {
            title: "How the local workflow is framed",
            items: aiData.aiRuntimePrinciples,
          },
          {
            title: "Practical stem workflows",
            items: aiData.stemUseCases,
          },
        ],
        siteName,
      }),
    },
    {
      seo: githubData.githubSeo,
      staticContent: renderGenericStaticContent({
        actions: [
          {
            href: githubData.githubHero.repositoryHref,
            label: "Open the repository",
          },
        ],
        hero: githubData.githubHero,
        sections: [
          {
            title: "Public engineering",
            items: githubData.githubHighlights,
          },
          {
            title: "Open-source principles",
            items: githubData.githubPillars,
          },
        ],
        siteName,
      }),
    },
    {
      seo: releasesData.releasesSeo,
      staticContent: renderGenericStaticContent({
        hero: releasesData.releasesHero,
        sections: [
          {
            title: "Release timeline",
            items: releasesData.releaseTimeline,
          },
          {
            title: "Release channels",
            items: releasesData.releaseChannels,
          },
          {
            title: "Release principles",
            items: releasesData.releasePrinciples,
          },
        ],
        siteName,
      }),
    },
    {
      seo: contactData.contactSeo,
      staticContent: renderGenericStaticContent({
        hero: contactData.contactHero,
        sections: [
          {
            title: "Contact methods",
            items: contactData.contactMethods,
          },
          {
            title: "Good reasons to get in touch",
            items: contactData.contactAvailability,
          },
        ],
        siteName,
      }),
    },
    ...[
      legalData.privacyDocument,
      legalData.securityDocument,
      legalData.termsDocument,
    ].map((document) => ({
      seo: document.seo,
      staticContent: renderLegalStaticContent({
        document,
        siteName,
      }),
    })),
  ].map(({ seo, staticContent }) => ({
    ...seo,
    lastmod: getSeoLastModified(seo),
    staticContent,
  }));
  const homeRoute = {
    ...homeData.homeSeo,
    lastmod: getSeoLastModified(
      homeData.homeSeo,
      DEFAULT_NAM_RACK_LASTMOD,
    ),
    staticContent: renderHomeStaticContent({
      generatedImageIndex,
      homeData,
      siteName,
      siteUrl,
    }),
  };
  const featureRoute = {
    ...featureData.featurePageSeo,
    lastmod: getSeoLastModified(
      featureData.featurePageSeo,
      DEFAULT_NAM_RACK_LASTMOD,
    ),
    staticContent: renderFeaturesStaticContent({
      featureData,
      generatedImageIndex,
      siteName,
      siteUrl,
    }),
  };
  const blogIndexLastmod = getNewestPostModifiedDate(blogData.blogPosts);
  const blogIndexRoute = {
    ...blogData.blogsSeo,
    jsonLd: normalizeBlogIndexJsonLd({
      jsonLd: blogData.getBlogIndexJsonLd(),
      posts: blogData.blogPosts,
      siteImage,
      siteName,
      siteUrl,
    }),
    lastmod: blogIndexLastmod,
    staticContent: renderBlogsStaticContent({
      blogData,
      generatedImageIndex,
      siteName,
      siteUrl,
    }),
  };
  const blogPostRoutes = blogData.blogPosts.map((post) => {
    const pathName = blogData.getBlogPostUrl(post);
    const postUrl = new URL(pathName, siteUrl).toString();
    const imageMetadata = getSocialImageMetadata(
      post.image ?? siteImage,
      generatedImageIndex,
      siteUrl,
    );
    const datePublished = getPostPublishedDate(post);
    const dateModified = getPostModifiedDate(post);

    return {
      path: pathName,
      title: post.seoTitle ?? `${post.title} | ${siteName} Blog`,
      description: post.seoDescription ?? post.summary,
      image: post.image,
      imageAlt:
        post.imageAlt ??
        (post.image ? `${post.title} social share image` : undefined),
      ogType: "article",
      authorProfileUrl: siteUrl,
      datePublished,
      dateModified,
      lastmod: dateModified ?? datePublished ?? DEFAULT_STATIC_LASTMOD,
      changefreq: "monthly",
      priority: "0.6",
      jsonLd: normalizeBlogPostJsonLd({
        jsonLd: blogData.getBlogPostJsonLd(post),
        post,
        postUrl,
        siteImage,
        siteName,
        siteUrl,
        socialImage: imageMetadata.src,
      }),
      staticContent: renderBlogPostStaticContent({
        generatedImageIndex,
        post,
        siteName,
        siteUrl,
      }),
    };
  });

  return [
    homeRoute,
    featureRoute,
    ...standardSeoRoutes,
    blogIndexRoute,
    ...blogPostRoutes,
  ];
};

const writeRoute = async ({
  context,
  distRoot,
  route,
  template,
}) => {
  const html = buildRouteHtml(template, route, context);
  const outputPath =
    route.path === "/"
      ? path.join(distRoot, "index.html")
      : path.join(distRoot, route.path.slice(1), "index.html");

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, "utf8");
};

const writeSitemaps = async ({
  distRoot,
  publicRoot,
  routes,
  siteUrl,
}) => {
  const sitemap = buildSitemapXml(routes, { siteUrl });

  await Promise.all([
    fs.writeFile(path.join(distRoot, "sitemap.xml"), sitemap, "utf8"),
    fs.writeFile(path.join(publicRoot, "sitemap.xml"), sitemap, "utf8"),
  ]);
};

export const generateStaticSeo = async ({
  repoRoot = defaultRepoRoot,
} = {}) => {
  const distRoot = path.join(repoRoot, "dist");
  const publicRoot = path.join(repoRoot, "public");
  const templatePath = path.join(distRoot, "index.html");
  const [runtime, template] = await Promise.all([
    loadRuntimeData(repoRoot),
    fs.readFile(templatePath, "utf8"),
  ]);
  const routes = createRoutes(runtime);
  const context = {
    generatedImageIndex: runtime.generatedImageIndex,
    siteImage: runtime.constants.SITE_OG_IMAGE,
    siteName: runtime.constants.SITE_NAME,
    siteUrl: runtime.constants.SITE_URL,
  };

  for (const route of routes) {
    await writeRoute({
      context,
      distRoot,
      route,
      template,
    });
  }

  await writeSitemaps({
    distRoot,
    publicRoot,
    routes,
    siteUrl: runtime.constants.SITE_URL,
  });

  return {
    blogPostCount: runtime.blogData.blogPosts.length,
    routeCount: routes.length,
  };
};

const invokedPath = process.argv[1]
  ? path.resolve(process.argv[1])
  : undefined;

if (invokedPath === scriptPath) {
  const result = await generateStaticSeo();
  console.log(
    `[seo] wrote semantic static HTML for ${result.routeCount} routes and ${result.blogPostCount} blog post routes; sitemap synced to dist and public.`,
  );
}
