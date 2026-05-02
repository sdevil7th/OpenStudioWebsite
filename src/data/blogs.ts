import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/constants/site";
import { blogImageManifest } from "@/data/blogImageManifest";
import type { SeoMeta } from "@/data/marketing";

const markdownFiles = import.meta.glob<string>("../../blogs/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const WORDS_PER_MINUTE = 225;
const BLOG_ROUTE = "/blogs";
const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  content: string;
  articleContent: string;
  sourcePath: string;
  filename: string;
  wordCount: number;
  readTimeMinutes: number;
  image?: string;
  imageAlt?: string;
  date?: string;
  dateLabel?: string;
}

export const blogsSeo: SeoMeta = {
  title: "OpenStudio Blog | Engineering Notes from an Open Source DAW",
  description:
    "Read OpenStudio engineering notes on DAW development, audio plugin hosting, AI music workflows, runtime packaging, and open source product decisions.",
  path: BLOG_ROUTE,
  keywords: [
    "openstudio blog",
    "open source daw blog",
    "audio software engineering",
    "music production software development",
    "daw development",
  ],
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

  const trimmed = summary.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return `${trimmed}...`;
};

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

const getSummary = (markdown: string) => {
  const paragraphs = getParagraphsAfterTitle(markdown);
  const italicIntro = paragraphs.map(unwrapItalicParagraph).find((paragraph): paragraph is string => Boolean(paragraph));
  const firstBodyParagraph = paragraphs.find(isPublishableParagraph);
  const summary = stripMarkdown(italicIntro ?? firstBodyParagraph ?? markdown);

  return truncateSummary(summary || "OpenStudio engineering notes from the public DAW development process.");
};

const getArticleContent = (markdown: string) => markdown.replace(/^\s*#\s+.+\r?\n+/, "").trim();

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
  const postImage = getPostImage(slug);

  return {
    slug,
    title,
    summary: getSummary(content),
    content,
    articleContent: getArticleContent(content),
    sourcePath,
    filename,
    wordCount,
    readTimeMinutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
    image: postImage,
    imageAlt: postImage ? `${title} social share image` : undefined,
    date,
    dateLabel: getDateLabel(date),
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
    headline: post.title,
    description: post.summary,
    url: new URL(getBlogPostUrl(post), SITE_URL).toString(),
    ...(post.image ? { image: new URL(post.image, SITE_URL).toString() } : {}),
    ...(post.date ? { datePublished: post.date } : {}),
  })),
});

export const getBlogPostJsonLd = (post: BlogPost) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.summary,
  url: new URL(getBlogPostUrl(post), SITE_URL).toString(),
  image: new URL(post.image ?? SITE_OG_IMAGE, SITE_URL).toString(),
  wordCount: post.wordCount,
  isPartOf: {
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    url: new URL(BLOG_ROUTE, SITE_URL).toString(),
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  },
  ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
});
