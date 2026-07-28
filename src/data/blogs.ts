import {
  BRANDING_ASSETS,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_URL,
} from "@/constants/site";
import { blogImageManifest } from "@/data/blogImageManifest";
import type { SeoMeta } from "@/data/marketing";

const markdownFiles = import.meta.glob<string>("../../blogs/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const WORDS_PER_MINUTE = 225;
const BLOG_ROUTE = "/blogs";
const DEFAULT_BLOG_AUTHOR = "OpenStudio engineering team";
const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export interface BlogPost {
  author: string;
  slug: string;
  title: string;
  dek: string;
  summary: string;
  content: string;
  articleContent: string;
  sourcePath: string;
  filename: string;
  wordCount: number;
  readTimeMinutes: number;
  image?: string;
  imageAlt?: string;
  imageFit?: "cover" | "contain";
  keywords?: string[];
  seoDescription?: string;
  seoTitle?: string;
  date?: string;
  dateLabel?: string;
  dateModified?: string;
  dateModifiedLabel?: string;
}

type BlogPostSeoOverride = Partial<
  Pick<
    BlogPost,
    | "author"
    | "dateModified"
    | "imageAlt"
    | "imageFit"
    | "keywords"
    | "seoDescription"
    | "seoTitle"
  >
>;

export const blogPostSeoOverrides: Record<string, BlogPostSeoOverride> = {
  "building-openstudio-nam-rack": {
    author: DEFAULT_BLOG_AUTHOR,
    dateModified: "2026-07-28",
    seoTitle: "Building a Free NAM Guitar Rig Inside OpenStudio | OpenStudio Blog",
    seoDescription:
      "How OpenStudio’s free NAM guitar rig brings A1/A2 captures, native pedals, cabinet IRs, TONE3000 access, presets, and project recall into one open-source DAW.",
    imageAlt:
      "OpenStudio NAM Rack showing pre-FX pedals, an A2 amp capture, and post-FX pedals.",
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
};

export const blogsSeo: SeoMeta = {
  title: "OpenStudio Blog | Engineering Notes from an Open Source DAW",
  description:
    "Read OpenStudio engineering notes on DAW development, audio plugin hosting, AI music workflows, runtime packaging, and open source product decisions.",
  path: BLOG_ROUTE,
};

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const stripMarkdown = (value: string) =>
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

const truncateSummary = (value: string, maxLength = 190) => {
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

const getSeoTitle = (title: string, override?: string) => {
  if (override) {
    return override;
  }

  const brandedTitle = `${title} | ${SITE_NAME} Blog`;
  return brandedTitle.length <= 65 ? brandedTitle : title;
};

const DEFAULT_SUMMARY = "OpenStudio engineering notes from the public DAW development process.";

const toTitleFromSlug = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");

const sanitizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getFilename = (filePath: string) => filePath.split("/").pop() ?? filePath;

const getSlugParts = (filename: string) => {
  const basename = filename.replace(/\.md$/i, "");
  const datedMatch = basename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  const date = datedMatch?.[1];
  const slugBase = datedMatch?.[2] ?? basename;

  return {
    date,
    slug: sanitizeSlug(slugBase),
  };
};

const getPostImage = (slug: string): string | undefined => blogImageManifest[slug as keyof typeof blogImageManifest];

const getDateLabel = (date?: string) => {
  if (!date) {
    return undefined;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : dateFormatter.format(parsed);
};

const getTitle = (markdown: string, fallbackSlug: string) => {
  const heading = markdown.match(/^\s*#\s+(.+)$/m)?.[1];
  return stripMarkdown(heading ?? toTitleFromSlug(fallbackSlug));
};

const getParagraphsAfterTitle = (markdown: string) =>
  markdown
    .replace(/^\s*#\s+.+\r?\n+/, "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const isPublishableParagraph = (paragraph: string) => {
  if (/^(#{1,6}\s|```|---$|>\s|!\[)/.test(paragraph)) {
    return false;
  }

  if (/^[-*+]\s/.test(paragraph) || /^\d+\.\s/.test(paragraph)) {
    return false;
  }

  return stripMarkdown(paragraph).length > 0;
};

const unwrapItalicParagraph = (paragraph: string) => {
  const trimmed = paragraph.trim();
  const match = trimmed.match(/^([*_])(.+)\1$/s);
  return match ? match[2].trim() : undefined;
};

const getDek = (markdown: string) => {
  const paragraphs = getParagraphsAfterTitle(markdown);
  const leadingDek = paragraphs[0] ? unwrapItalicParagraph(paragraphs[0]) : undefined;
  const firstBodyParagraph = paragraphs.find(isPublishableParagraph);
  const summary = stripMarkdown(leadingDek ?? firstBodyParagraph ?? markdown);

  return truncateSummary(summary || DEFAULT_SUMMARY, 220);
};

const removeLeadingArticleMetadata = (markdown: string) => {
  let body = markdown.replace(/^\s*#\s+.+\r?\n+/, "").trimStart();
  const firstParagraph = body.match(/^([\s\S]*?)(?:\r?\n\s*\r?\n|$)/);

  if (firstParagraph?.[1] && unwrapItalicParagraph(firstParagraph[1].trim())) {
    body = body.slice(firstParagraph[0].length).trimStart();
  }

  body = body.replace(/^-{3,}\s*(?:\r?\n\s*\r?\n|\r?\n|$)/, "").trimStart();

  return body.trim();
};

const getSummary = (markdown: string) => truncateSummary(getDek(markdown));

const getArticleContent = (markdown: string) => removeLeadingArticleMetadata(markdown);

const getWordCount = (markdown: string) => {
  const words = stripMarkdown(markdown).match(/\b[\w'-]+\b/g);
  return words?.length ?? 0;
};

const createBlogPost = ([sourcePath, content]: [string, string]): BlogPost | null => {
  const filename = getFilename(sourcePath);

  if (filename.toLowerCase() === "readme.md") {
    return null;
  }

  const { date, slug } = getSlugParts(filename);
  const wordCount = getWordCount(content);
  const title = getTitle(content, slug);
  const dek = getDek(content);
  const postImage = getPostImage(slug);
  const seoOverride = blogPostSeoOverrides[slug];
  const dateModified = seoOverride?.dateModified ?? date;

  return {
    author: seoOverride?.author ?? DEFAULT_BLOG_AUTHOR,
    slug,
    title,
    dek,
    summary: getSummary(content),
    content,
    articleContent: getArticleContent(content),
    sourcePath,
    filename,
    wordCount,
    readTimeMinutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
    image: postImage,
    imageAlt:
      seoOverride?.imageAlt ??
      (postImage ? `${title} social share image` : undefined),
    imageFit: seoOverride?.imageFit,
    keywords: seoOverride?.keywords,
    seoDescription: seoOverride?.seoDescription ?? truncateSummary(dek, 160),
    seoTitle: getSeoTitle(title, seoOverride?.seoTitle),
    date,
    dateLabel: getDateLabel(date),
    dateModified,
    dateModifiedLabel: getDateLabel(dateModified),
  };
};

export const blogPosts = Object.entries(markdownFiles)
  .map(createBlogPost)
  .filter((post): post is BlogPost => Boolean(post))
  .sort((first, second) => {
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

export const getBlogPostBySlug = (slug?: string) => blogPosts.find((post) => post.slug === slug);

export const getBlogPostUrl = (post: Pick<BlogPost, "slug">) => `${BLOG_ROUTE}/${post.slug}`;

export const getBlogIndexJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Blog",
  name: `${SITE_NAME} Blog`,
  description: blogsSeo.description,
  url: new URL(BLOG_ROUTE, SITE_URL).toString(),
  image: new URL(SITE_OG_IMAGE, SITE_URL).toString(),
  blogPost: blogPosts.map((post) => ({
    "@type": "BlogPosting",
    author: {
      "@type": "Organization",
      name: post.author,
      url: SITE_URL,
    },
    headline: post.title,
    description: post.summary,
    url: new URL(getBlogPostUrl(post), SITE_URL).toString(),
    ...(post.image ? { image: new URL(post.image, SITE_URL).toString() } : {}),
    ...(post.date ? { datePublished: post.date } : {}),
    ...(post.dateModified ? { dateModified: post.dateModified } : {}),
  })),
});

export const getBlogPostJsonLd = (post: BlogPost) => {
  const postUrl = new URL(getBlogPostUrl(post), SITE_URL).toString();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    author: {
      "@type": "Organization",
      name: post.author,
      url: SITE_URL,
    },
    headline: post.title,
    description: post.seoDescription ?? post.summary,
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    image: new URL(post.image ?? SITE_OG_IMAGE, SITE_URL).toString(),
    wordCount: post.wordCount,
    timeRequired: `PT${post.readTimeMinutes}M`,
    ...(post.keywords ? { keywords: post.keywords.join(", ") } : {}),
    isPartOf: {
      "@type": "Blog",
      name: `${SITE_NAME} Blog`,
      url: new URL(BLOG_ROUTE, SITE_URL).toString(),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: new URL(BRANDING_ASSETS.android512, SITE_URL).toString(),
      },
    },
    ...(post.date ? { datePublished: post.date } : {}),
    ...(post.dateModified ? { dateModified: post.dateModified } : {}),
  };
};
