import {
  BRANDING_ASSETS,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_URL,
} from "@/constants/site";
import {
  generatedBlogPosts,
  generatedBlogPostSeoOverrides,
} from "@/data/generatedBlogIndex";
import type { SeoMeta } from "@/data/marketing";

const BLOG_ROUTE = "/blogs";
const DEFAULT_BLOG_AUTHOR = "OpenStudio engineering team";

export interface BlogPostSummary {
  author: string;
  slug: string;
  title: string;
  dek: string;
  summary: string;
  sourcePath: string;
  filename: string;
  wordCount: number;
  readTimeMinutes: number;
  image?: string;
  imageAlt?: string;
  imageFit?: "cover" | "contain";
  keywords?: readonly string[];
  seoDescription?: string;
  seoTitle?: string;
  date?: string;
  dateLabel?: string;
  dateModified?: string;
  dateModifiedLabel?: string;
}

export interface BlogPost extends BlogPostSummary {
  articleHtml: string;
}

export interface MarkdownBlogPost extends BlogPostSummary {
  content: string;
  articleContent: string;
}

type BlogPostSeoOverride = Partial<
  Pick<
    BlogPostSummary,
    | "author"
    | "dateModified"
    | "imageAlt"
    | "imageFit"
    | "keywords"
    | "seoDescription"
    | "seoTitle"
  >
>;

export const blogPostSeoOverrides: Record<string, BlogPostSeoOverride> =
  generatedBlogPostSeoOverrides;

export const blogsSeo: SeoMeta = {
  title: "OpenStudio Blog | Engineering Notes from an Open Source DAW",
  description:
    "Read OpenStudio engineering notes on DAW development, audio plugin hosting, AI music workflows, runtime packaging, and open source product decisions.",
  path: BLOG_ROUTE,
};

const unwrapItalicParagraph = (paragraph: string) => {
  const trimmed = paragraph.trim();
  const match = trimmed.match(/^([*_])(.+)\1$/s);
  return match ? match[2].trim() : undefined;
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

export const withBlogPostContent = (
  post: BlogPostSummary,
  content: string,
): MarkdownBlogPost => ({
  ...post,
  content,
  articleContent: removeLeadingArticleMetadata(content),
});

export const withBlogPostHtml = (
  post: BlogPostSummary,
  articleHtml: string,
): BlogPost => ({
  ...post,
  articleHtml,
});

export const blogPosts: readonly BlogPostSummary[] = generatedBlogPosts;

export const getBlogPostBySlug = (slug?: string) =>
  blogPosts.find((post) => post.slug === slug);

export const getBlogPostUrl = (post: Pick<BlogPostSummary, "slug">) =>
  `${BLOG_ROUTE}/${post.slug}`;

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

export const getBlogPostJsonLd = (post: BlogPostSummary) => {
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
