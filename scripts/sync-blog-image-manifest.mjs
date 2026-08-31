import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeBlogMarkdown } from "./blog-markdown-renderer.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const blogContentRoot = path.join(repoRoot, "blogs");
const publicBlogAssetsRoot = path.join(repoRoot, "public", "assets", "blogs");
const outputPath = path.join(repoRoot, "src", "data", "blogImageManifest.ts");
const blogIndexOutputPath = path.join(repoRoot, "src", "data", "generatedBlogIndex.ts");
const supportedExtensions = new Set([".webp", ".png", ".jpg", ".jpeg"]);
const WORDS_PER_MINUTE = 225;
const DEFAULT_BLOG_AUTHOR = "OpenStudio engineering team";
const DEFAULT_SUMMARY = "OpenStudio engineering notes from the public DAW development process.";
const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const blogPostSeoOverrides = {
  "building-openstudio-nam-rack": {
    author: DEFAULT_BLOG_AUTHOR,
    dateModified: "2026-08-31",
    imageSlug: "building-openstudio-nam-rack-free-guitar-rig",
    seoTitle: "Building a Free NAM Guitar Rig Inside OpenStudio | OpenStudio Blog",
    seoDescription:
      "How OpenStudio’s free NAM guitar rig brings A1/A2 captures, native pedals, cabinet IRs, TONE3000 access, presets, and project recall into one open-source DAW.",
    imageAlt:
      "OpenStudio NAM Rack amp, pedals, post effects, and TONE3000 capture browser arranged in a music studio.",
    imageFit: "contain",
    keywords: [
      "free guitar amp simulator",
      "free guitar rig",
      "open-source amp simulator",
      "NAM A2 player",
      "Neural Amp Modeler DAW",
      "AmpliTube alternative",
      "Guitar Rig alternative",
      "Neural DSP alternative",
      "free amp capture software",
      "TONE3000 integration",
    ],
  },
  "build-guitar-tones-with-openstudio-nam-rack": {
    author: "OpenStudio team",
    dateModified: "2026-08-29",
    imageSlug: "build-guitar-tones-with-openstudio-nam-rack-v2",
    seoTitle: "How to Build Clean and High-Gain Tones with OpenStudio NAM Rack",
    seoDescription:
      "A practical guitarist's guide to OpenStudio NAM Rack, with exact clean and high-gain preset settings plus tone advice from Rabea Massaad, Nolly Getgood, and Misha Mansoor.",
    imageAlt:
      "OpenStudio NAM Rack framed by blue clean-tone and red high-gain waveform treatments.",
    imageFit: "contain",
    keywords: [
      "OpenStudio NAM Rack tutorial",
      "NAM guitar tone",
      "Neural Amp Modeler preset",
      "clean guitar tone settings",
      "high gain guitar tone settings",
      "5150 NAM tone",
      "free guitar amp simulator",
      "Precision Drive settings",
      "guitar cabinet IR",
      "TONE3000",
    ],
  },
};

const pathExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const collectBlogImages = async () => {
  if (!await pathExists(publicBlogAssetsRoot)) {
    return [];
  }

  const entries = await fs.readdir(publicBlogAssetsRoot, { withFileTypes: true });

  const images = await Promise.all(entries
    .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map(async (entry) => {
      const slug = path.basename(entry.name, path.extname(entry.name)).toLowerCase();
      const filePath = path.join(publicBlogAssetsRoot, entry.name);
      const hash = createHash("sha256").update(await fs.readFile(filePath)).digest("hex").slice(0, 12);

      return {
        slug,
        src: `/assets/blogs/${entry.name}?v=${hash}`,
      };
    }));

  return images.sort((first, second) => first.slug.localeCompare(second.slug));
};

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

  const trimmed = summary
    .slice(0, Math.max(1, maxLength - 3))
    .replace(/\s+\S*$/, "")
    .trim();
  return `${trimmed}...`;
};

const sanitizeSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getSlugParts = (filename) => {
  const basename = filename.replace(/\.md$/i, "");
  const datedMatch = basename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);

  return {
    date: datedMatch?.[1],
    slug: sanitizeSlug(datedMatch?.[2] ?? basename),
  };
};

const toTitleFromSlug = (slug) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");

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

const getDek = (markdown) => {
  const paragraphs = getParagraphsAfterTitle(markdown);
  const leadingDek = paragraphs[0] ? unwrapItalicParagraph(paragraphs[0]) : undefined;
  const firstBodyParagraph = paragraphs.find(isPublishableParagraph);
  const summary = stripMarkdown(leadingDek ?? firstBodyParagraph ?? markdown);

  return truncateSummary(summary || DEFAULT_SUMMARY, 220);
};

const getDateLabel = (date) => {
  if (!date) {
    return undefined;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : dateFormatter.format(parsed);
};

const getSeoTitle = (title, override) => {
  if (override) {
    return override;
  }

  const brandedTitle = `${title} | OpenStudio Blog`;
  return brandedTitle.length <= 65 ? brandedTitle : title;
};

const createBlogIndex = async (images) => {
  if (!await pathExists(blogContentRoot)) {
    return [];
  }

  const imageBySlug = new Map(images.map(({ slug, src }) => [slug, src]));
  const entries = await fs.readdir(blogContentRoot, { withFileTypes: true });
  const posts = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md") && entry.name.toLowerCase() !== "readme.md")
      .map(async (entry) => {
        const content = normalizeBlogMarkdown(
          await fs.readFile(path.join(blogContentRoot, entry.name), "utf8"),
        );
        const { date, slug } = getSlugParts(entry.name);
        const title = getTitle(content, slug);
        const dek = getDek(content);
        const words = stripMarkdown(content).match(/\b[\w'-]+\b/g);
        const wordCount = words?.length ?? 0;
        const override = blogPostSeoOverrides[slug];
        const image = imageBySlug.get(override?.imageSlug ?? slug);
        const dateModified = override?.dateModified ?? date;

        return {
          author: override?.author ?? DEFAULT_BLOG_AUTHOR,
          slug,
          title,
          dek,
          summary: truncateSummary(dek),
          sourcePath: `blogs/${entry.name}`,
          filename: entry.name,
          wordCount,
          readTimeMinutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
          ...(image ? { image } : {}),
          ...(image ? { imageAlt: override?.imageAlt ?? `${title} social share image` } : {}),
          ...(override?.imageFit ? { imageFit: override.imageFit } : {}),
          ...(override?.keywords ? { keywords: override.keywords } : {}),
          seoDescription: override?.seoDescription ?? truncateSummary(dek, 160),
          seoTitle: getSeoTitle(title, override?.seoTitle),
          ...(date ? { date, dateLabel: getDateLabel(date) } : {}),
          ...(dateModified ? { dateModified, dateModifiedLabel: getDateLabel(dateModified) } : {}),
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

const serializeManifest = (images) => {
  const body = images
    .map((image) => `  ${JSON.stringify(image.slug)}: ${JSON.stringify(image.src)},`)
    .join("\n");

  return [
    "export const blogImageManifest = {",
    body,
    "} as const;",
    "",
    "export type BlogImageSlug = keyof typeof blogImageManifest;",
    "",
  ].join("\n");
};

const serializeBlogIndex = (posts) => [
  "// Generated by scripts/sync-blog-image-manifest.mjs from blogs/*.md.",
  "// Keep article bodies out of this file so the blog index never downloads every post.",
  `export const generatedBlogPostSeoOverrides = ${JSON.stringify(blogPostSeoOverrides)} as const;`,
  "",
  `export const generatedBlogPosts = ${JSON.stringify(posts)} as const;`,
  "",
].join("\n");

const images = await collectBlogImages();
const posts = await createBlogIndex(images);
const nextContent = serializeManifest(images);
const nextBlogIndexContent = serializeBlogIndex(posts);

let currentContent = "";

try {
  currentContent = await fs.readFile(outputPath, "utf8");
} catch {
  // The manifest may not exist on the first sync.
}

if (currentContent !== nextContent) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, nextContent, "utf8");
}

let currentBlogIndexContent = "";

try {
  currentBlogIndexContent = await fs.readFile(blogIndexOutputPath, "utf8");
} catch {
  // The generated index may not exist on the first sync.
}

if (currentBlogIndexContent !== nextBlogIndexContent) {
  await fs.mkdir(path.dirname(blogIndexOutputPath), { recursive: true });
  await fs.writeFile(blogIndexOutputPath, nextBlogIndexContent, "utf8");
}

console.log(`[blogs] synced ${images.length} public blog image${images.length === 1 ? "" : "s"} and ${posts.length} post metadata record${posts.length === 1 ? "" : "s"}.`);
