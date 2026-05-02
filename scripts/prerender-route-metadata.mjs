import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(repoRoot, "dist");
const blogsRoot = path.join(repoRoot, "blogs");
const publicBlogAssetsRoot = path.join(repoRoot, "public", "assets", "blogs");
const siteUrl = "https://openstudio.org.in";
const siteName = "OpenStudio";
const image = `${siteUrl}/assets/openstudio/branding/og-image.png?v=2`;
const staticLastmod = "2026-05-02";
const wordsPerMinute = 225;
const blogImageExtensions = ["png", "jpg", "jpeg", "webp"];

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

const baseRoutes = [
  {
    path: "/",
    title: "OpenStudio | Free Open Source DAW for Music Production",
    description:
      "OpenStudio is a free, open source DAW for Windows, macOS, and Linux with multitrack recording, MIDI, pitch editing, stem separation, and plugin hosting.",
    keywords:
      "free daw, open source daw, music production software, digital audio workstation, audio editing software, music making software, daw free, free music production software, daw windows, daw mac, daw linux",
  },
  {
    path: "/features",
    title: "OpenStudio Features | Recording, MIDI, Mixing & Stem Separation",
    description:
      "Explore OpenStudio recording, MIDI instruments, pitch editing, mixing, plugin hosting, stem separation, and Lua scripting.",
    keywords:
      "daw features, music production software, audio editing software, midi software, plugin hosting daw, stem separation daw",
  },
  {
    path: "/download",
    title: "Download OpenStudio | Free DAW for Windows, macOS & Linux",
    description:
      "Download OpenStudio free for Windows, macOS, or Linux, with clear installer notes and optional AI runtime setup guidance.",
    keywords:
      "free daw download, daw free, free daw windows, free daw mac, free daw linux, open source daw download",
  },
  {
    path: "/ai",
    title: "OpenStudio AI | Free Stem Separation & Text-to-Audio in a DAW",
    description:
      "OpenStudio AI delivers local stem separation and ACE-Step text-to-audio inside a free, open source DAW, with no upload or subscription.",
    keywords:
      "free stem separation software, ai music tools, text to audio, ai stem splitter, daw with stem separation",
  },
  {
    path: "/github",
    title: "OpenStudio on GitHub | Open Source DAW Repository",
    description:
      "Explore OpenStudio's GitHub repository, contribution flow, release transparency, and architecture notes.",
    keywords: "open source daw, openstudio github, daw github, daw source code",
  },
  {
    path: "/releases",
    title: "OpenStudio Releases | Free Open Source DAW Updates",
    description:
      "Track OpenStudio release notes, distribution status, and Windows, macOS, and Linux build details.",
    keywords: "openstudio releases, daw release notes, open source daw updates",
  },
  {
    path: "/contact",
    title: "Contact OpenStudio | Open Source DAW Project",
    description:
      "Reach the OpenStudio maintainer for release feedback, contributions, website work, and product direction.",
    keywords: "openstudio contact, open source daw maintainer, daw project contact",
  },
  {
    path: "/privacy",
    title: "OpenStudio Privacy | Open Source DAW Project",
    description: "Read the OpenStudio privacy notes for the website, desktop app, local project files, and optional AI tooling.",
    keywords: "openstudio privacy, daw privacy, local audio workflow",
  },
  {
    path: "/security",
    title: "OpenStudio Security | Release & Vulnerability Reporting",
    description: "Read OpenStudio security notes for release verification, install trust, and vulnerability reporting.",
    keywords: "openstudio security, daw security, release verification",
  },
  {
    path: "/terms",
    title: "OpenStudio Terms | Open Source DAW Project",
    description: "Read the OpenStudio terms for using the website, downloads, open source code, and release materials.",
    keywords: "openstudio terms, open source daw terms",
  },
];

const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();

const stripMarkdown = (value) =>
  normalizeWhitespace(
    value
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^>\s?/gm, "")
      .replace(/[*_~]/g, "")
      .replace(/^-{3,}$/gm, " ")
      .replace(/[|#]/g, " "),
  );

const truncateSummary = (value, maxLength = 190) => {
  const summary = normalizeWhitespace(value);

  if (summary.length <= maxLength) {
    return summary;
  }

  const trimmed = summary.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return `${trimmed}...`;
};

const toTitleFromSlug = (slug) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");

const sanitizeSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getSlugParts = (filename) => {
  const basename = filename.replace(/\.md$/i, "");
  const datedMatch = basename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  const date = datedMatch?.[1];
  const slugBase = datedMatch?.[2] ?? basename;

  return {
    date,
    slug: sanitizeSlug(slugBase),
  };
};

const getBlogAssetUrl = (imageFilename) => `${siteUrl}/assets/blogs/${encodeURIComponent(imageFilename)}`;

const collectPublicBlogImages = async () => {
  try {
    const entries = await fs.readdir(publicBlogAssetsRoot, { withFileTypes: true });
    return new Map(
      entries
        .filter((entry) => entry.isFile() && blogImageExtensions.includes(path.extname(entry.name).slice(1).toLowerCase()))
        .map((entry) => [path.basename(entry.name, path.extname(entry.name)).toLowerCase(), entry.name]),
    );
  } catch {
    return new Map();
  }
};

const getPostImage = (slug, publicBlogImages) => {
  const candidate = publicBlogImages.get(slug.toLowerCase());

  if (!candidate) {
    return undefined;
  }

  return {
    imageUrl: getBlogAssetUrl(candidate),
  };
};

const getTitle = (markdown, fallbackSlug) => {
  const heading = markdown.match(/^\s*#\s+(.+)$/m)?.[1];
  return stripMarkdown(heading ?? toTitleFromSlug(fallbackSlug));
};

const getParagraphsAfterTitle = (markdown) =>
  markdown
    .replace(/^\s*#\s+.+\r?\n+/, "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const isPublishableParagraph = (paragraph) => {
  if (/^(#{1,6}\s|```|---$|>\s|!\[)/.test(paragraph)) {
    return false;
  }

  if (/^[-*+]\s/.test(paragraph) || /^\d+\.\s/.test(paragraph)) {
    return false;
  }

  return stripMarkdown(paragraph).length > 0;
};

const unwrapItalicParagraph = (paragraph) => {
  const trimmed = paragraph.trim();
  const match = trimmed.match(/^([*_])(.+)\1$/s);
  return match ? match[2].trim() : undefined;
};

const getSummary = (markdown) => {
  const paragraphs = getParagraphsAfterTitle(markdown);
  const italicIntro = paragraphs.map(unwrapItalicParagraph).find(Boolean);
  const firstBodyParagraph = paragraphs.find(isPublishableParagraph);
  const summary = stripMarkdown(italicIntro ?? firstBodyParagraph ?? markdown);

  return truncateSummary(summary || "OpenStudio engineering notes from the public DAW development process.");
};

const getWordCount = (markdown) => {
  const words = stripMarkdown(markdown).match(/\b[\w'-]+\b/g);
  return words?.length ?? 0;
};

const collectBlogPosts = async (publicBlogImages) => {
  let entries = [];

  try {
    entries = await fs.readdir(blogsRoot, { withFileTypes: true });
  } catch {
    return [];
  }

  const posts = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md") && entry.name.toLowerCase() !== "readme.md")
      .map(async (entry) => {
        const content = await fs.readFile(path.join(blogsRoot, entry.name), "utf8");
        const { date, slug } = getSlugParts(entry.name);
        const wordCount = getWordCount(content);
        const postImage = getPostImage(slug, publicBlogImages);

        return {
          slug,
          title: getTitle(content, slug),
          summary: getSummary(content),
          date,
          wordCount,
          readTimeMinutes: Math.max(1, Math.ceil(wordCount / wordsPerMinute)),
          ...postImage,
        };
      }),
  );

  return posts.sort((first, second) => {
    if (first.date && second.date) {
      return second.date.localeCompare(first.date);
    }

    if (first.date) {
      return -1;
    }

    if (second.date) {
      return 1;
    }

    return first.title.localeCompare(second.title);
  });
};

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const setTitle = (html, title) => html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`);

const setMeta = (html, selector, value) => {
  const escaped = escapeHtml(value);
  const [attribute, name] = selector;
  const pattern = new RegExp(`<meta\\s+${attribute}="${name}"\\s+content="[^"]*"\\s*/?>`, "s");
  const replacement = `<meta ${attribute}="${name}" content="${escaped}" />`;

  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }

  return html.replace("</head>", `    ${replacement}\n  </head>`);
};

const setCanonical = (html, url) => {
  const replacement = `<link rel="canonical" href="${escapeHtml(url)}" />`;
  if (/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/s.test(html)) {
    return html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/s, replacement);
  }
  return html.replace("</head>", `    ${replacement}\n  </head>`);
};

const getDefaultJsonLd = (route, url) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: route.title,
  description: route.description,
  url,
  image,
  isPartOf: {
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  },
});

const setRouteJsonLd = (html, route, url) => {
  const data = route.jsonLd ?? getDefaultJsonLd(route, url);

  return html.replace(
    "</head>",
    `    <script type="application/ld+json" data-static-route>${JSON.stringify(data)}</script>\n  </head>`,
  );
};

const writeRoute = async (template, route) => {
  const url = new URL(route.path, siteUrl).toString();
  const routeImage = route.image ?? image;
  const routeImageAlt = route.imageAlt ?? `${siteName} share image`;
  let html = setTitle(template, route.title);

  html = setMeta(html, ["name", "description"], route.description);
  html = setMeta(html, ["name", "keywords"], route.keywords);
  html = setMeta(html, ["property", "og:type"], route.ogType ?? "website");
  html = setMeta(html, ["property", "og:title"], route.title);
  html = setMeta(html, ["property", "og:description"], route.description);
  html = setMeta(html, ["property", "og:url"], url);
  html = setMeta(html, ["property", "og:image"], routeImage);
  html = setMeta(html, ["property", "og:image:alt"], routeImageAlt);
  html = setMeta(html, ["name", "twitter:title"], route.title);
  html = setMeta(html, ["name", "twitter:description"], route.description);
  html = setMeta(html, ["name", "twitter:image"], routeImage);
  html = setCanonical(html, url);
  html = setRouteJsonLd(html, route, url);

  const outputPath = route.path === "/" ? path.join(distRoot, "index.html") : path.join(distRoot, route.path.slice(1), "index.html");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, "utf8");
};

const writeSitemap = async (routes) => {
  const urlEntries = routes
    .map((route) => {
      const metadata = sitemapMetadata.get(route.path) ?? { changefreq: route.changefreq ?? "monthly", priority: route.priority ?? "0.6" };
      const loc = new URL(route.path, siteUrl).toString();
      const lastmod = route.lastmod ?? staticLastmod;

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

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    "</urlset>",
    "",
  ].join("\n");

  await fs.writeFile(path.join(distRoot, "sitemap.xml"), sitemap, "utf8");
};

const publicBlogImages = await collectPublicBlogImages();
const blogPosts = await collectBlogPosts(publicBlogImages);
const blogIndexRoute = {
  path: "/blogs",
  title: "OpenStudio Blog | Engineering Notes from an Open Source DAW",
  description:
    "Read OpenStudio engineering notes on DAW development, audio plugin hosting, AI music workflows, runtime packaging, and open source product decisions.",
  keywords:
    "openstudio blog, open source daw blog, audio software engineering, music production software development, daw development",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteName} Blog`,
    description:
      "Read OpenStudio engineering notes on DAW development, audio plugin hosting, AI music workflows, runtime packaging, and open source product decisions.",
    url: new URL("/blogs", siteUrl).toString(),
    image,
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary,
      url: new URL(`/blogs/${post.slug}`, siteUrl).toString(),
      ...(post.imageUrl ? { image: post.imageUrl } : {}),
      ...(post.date ? { datePublished: post.date } : {}),
    })),
  },
};

const blogPostRoutes = blogPosts.map((post) => ({
  path: `/blogs/${post.slug}`,
  title: `${post.title} | ${siteName} Blog`,
  description: post.summary,
  image: post.imageUrl,
  imageAlt: post.imageUrl ? `${post.title} social share image` : undefined,
  keywords: `openstudio blog, ${post.title}, open source daw, audio software engineering`,
  ogType: "article",
  lastmod: post.date ?? staticLastmod,
  changefreq: "monthly",
  priority: "0.6",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    url: new URL(`/blogs/${post.slug}`, siteUrl).toString(),
    image: post.imageUrl ?? image,
    wordCount: post.wordCount,
    timeRequired: `PT${post.readTimeMinutes}M`,
    isPartOf: {
      "@type": "Blog",
      name: `${siteName} Blog`,
      url: new URL("/blogs", siteUrl).toString(),
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
  },
}));

const routes = [...baseRoutes, blogIndexRoute, ...blogPostRoutes];
const templatePath = path.join(distRoot, "index.html");
const template = await fs.readFile(templatePath, "utf8");

for (const route of routes) {
  await writeRoute(template, route);
}

await writeSitemap(routes);

console.log(`[seo] wrote static metadata HTML for ${routes.length} routes and ${blogPosts.length} blog post routes.`);
