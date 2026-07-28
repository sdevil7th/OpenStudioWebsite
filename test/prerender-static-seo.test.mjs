import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildRouteHtml,
  buildSitemapXml,
  getNewestPostModifiedDate,
  renderBlogPostStaticContent,
  renderGenericStaticContent,
} from "../scripts/prerender-route-metadata.mjs";

const template = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>OpenStudio</title>
    <meta name="description" content="Default description" />
    <meta name="keywords" content="legacy, keywords" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://openstudio.org.in/" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="OpenStudio" />
    <meta property="og:description" content="Default description" />
    <meta property="og:url" content="https://openstudio.org.in/" />
    <meta property="og:image" content="https://openstudio.org.in/og.png" />
    <meta property="og:image:alt" content="OpenStudio" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:title" content="OpenStudio" />
    <meta name="twitter:description" content="Default description" />
    <meta name="twitter:image" content="https://openstudio.org.in/og.png" />
    <meta name="twitter:image:alt" content="OpenStudio" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

const post = {
  author: "OpenStudio engineering team",
  slug: "building-openstudio-nam-rack",
  title: "Building a Free NAM Guitar Rig Inside OpenStudio",
  dek: "A complete NAM guitar workflow inside the DAW.",
  summary: "A complete NAM guitar workflow inside the DAW.",
  articleContent: `## A1 and A2 captures

OpenStudio sits alongside [AmpliTube](https://example.com/amplitube), [Guitar Rig](https://example.com/guitar-rig), [Neural DSP](https://example.com/neural-dsp) and similar amp modelers.

<script>alert("raw Markdown HTML must not execute")</script>`,
  wordCount: 42,
  readTimeMinutes: 1,
  date: "2026-07-26",
  dateLabel: "July 26, 2026",
  dateModified: "2026-07-28",
  dateModifiedLabel: "July 28, 2026",
};

const route = {
  path: "/blogs/building-openstudio-nam-rack",
  title: `${post.title} | OpenStudio Blog`,
  description: `Safe even with </script><script>alert("metadata")</script> text.`,
  imageAlt: "OpenStudio NAM Rack",
  ogType: "article",
  authorProfileUrl: "https://openstudio.org.in",
  datePublished: post.date,
  dateModified: post.dateModified,
  lastmod: post.dateModified,
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: `Safe even with </script><script>alert("schema")</script> text.`,
    datePublished: post.date,
    dateModified: post.dateModified,
    author: {
      "@type": "Organization",
      name: post.author,
    },
  },
  staticContent: renderBlogPostStaticContent({ post }),
};

const count = (value, pattern) => value.match(pattern)?.length ?? 0;

test("article output contains semantic escaped fallback content and article metadata", () => {
  const html = buildRouteHtml(template, route);
  const visibleText = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

  assert.equal(count(html, /<h1\b/g), 1);
  assert.match(html, /<h1>Building a Free NAM Guitar Rig Inside OpenStudio<\/h1>/);
  assert.match(
    visibleText,
    /AmpliTube.*Guitar Rig.*Neural DSP.*and similar amp modelers/,
  );
  assert.doesNotMatch(html, /<script>alert\("raw Markdown HTML must not execute"\)<\/script>/);
  assert.match(
    html,
    /&lt;script&gt;alert\(&quot;raw Markdown HTML must not execute&quot;\)&lt;\/script&gt;/,
  );
  assert.doesNotMatch(html, /name=["']keywords["']/i);
  assert.match(
    html,
    /property="article:published_time" content="2026-07-26"/,
  );
  assert.match(
    html,
    /property="article:modified_time" content="2026-07-28"/,
  );
  assert.match(
    html,
    /property="article:section" content="OpenStudio Blog"/,
  );
  assert.match(
    html,
    /property="article:author" content="https:\/\/openstudio\.org\.in"/,
  );

  const staticJson = html.match(
    /<script type="application\/ld\+json" data-static-route>([\s\S]*?)<\/script>/,
  )?.[1];

  assert.ok(staticJson);
  assert.doesNotMatch(staticJson, /<\/script>/i);
  assert.equal(JSON.parse(staticJson).dateModified, "2026-07-28");
});

test("route generation is idempotent and keeps one fallback and schema block", () => {
  const first = buildRouteHtml(template, route);
  const second = buildRouteHtml(first, route);

  assert.equal(count(second, /openstudio-static-route:start/g), 1);
  assert.equal(count(second, /data-static-route-styles/g), 1);
  assert.equal(count(second, /data-static-route>/g), 1);
  assert.equal(count(second, /<h1\b/g), 1);
});

test("generic route fallback supports href actions and clears article metadata", () => {
  const articleHtml = buildRouteHtml(template, route);
  const staticContent = renderGenericStaticContent({
    actions: [
      {
        href: "https://github.com/sdevil7th/OpenStudio",
        label: "Open the repository",
      },
    ],
    hero: {
      eyebrow: "Open source",
      title: "Build OpenStudio in public.",
      description: "Repository and release truth stay visible.",
    },
    sections: [
      {
        title: "Repository",
        items: [
          {
            title: "Inspectable source",
            description: "Review the code and contribution path.",
          },
        ],
      },
    ],
  });
  const html = buildRouteHtml(articleHtml, {
    path: "/github",
    title: "OpenStudio on GitHub",
    description: "OpenStudio source and contribution notes.",
    staticContent,
  });

  assert.equal(count(html, /<h1\b/g), 1);
  assert.match(html, /href="https:\/\/github\.com\/sdevil7th\/OpenStudio"/);
  assert.doesNotMatch(html, /article:(?:author|published_time|modified_time|section)/);
});

test("blog sitemap freshness follows the newest modified post", () => {
  const posts = [
    { date: "2026-06-04", dateModified: "2026-06-10" },
    { date: "2026-07-26", dateModified: "2026-07-28" },
    { date: "2026-05-15" },
  ];
  const blogLastmod = getNewestPostModifiedDate(posts);
  const xml = buildSitemapXml([
    {
      path: "/blogs",
      lastmod: blogLastmod,
    },
    {
      path: "/blogs/building-openstudio-nam-rack",
      lastmod: posts[1].dateModified,
      changefreq: "monthly",
      priority: "0.6",
    },
  ]);

  assert.equal(blogLastmod, "2026-07-28");
  assert.match(
    xml,
    /<loc>https:\/\/openstudio\.org\.in\/blogs<\/loc>\s+<lastmod>2026-07-28<\/lastmod>/,
  );
  assert.match(
    xml,
    /building-openstudio-nam-rack<\/loc>\s+<lastmod>2026-07-28<\/lastmod>/,
  );
});
