import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const h = React.createElement;
const GENERATED_WIDTHS = [
  320, 480, 640, 768, 960, 1280, 1600, 1920, 2560, 3200, 3360,
];
const INLINE_IMAGE_SIZES =
  "(min-width: 824px) 760px, (min-width: 768px) calc(100vw - 4rem), calc(100vw - 2rem)";

export const normalizeBlogMarkdown = (markdown) => markdown.replace(/\r\n?/g, "\n");

const cleanImageSrc = (src) => src.split(/[?#]/)[0] ?? src;

const supportsImageOptimization = (src) => {
  const clean = cleanImageSrc(src);
  return (
    (clean.startsWith("/assets/openstudio/") || clean.startsWith("/assets/blogs/")) &&
    !clean.startsWith("/assets/openstudio/generated/") &&
    /\.(?:jpe?g|png|webp)$/i.test(clean)
  );
};

const generatedImagePath = (src, width) => {
  if (!supportsImageOptimization(src)) {
    return src;
  }

  const clean = cleanImageSrc(src);
  const isBlogAsset = clean.startsWith("/assets/blogs/");
  const prefix = isBlogAsset ? "/assets/blogs/" : "/assets/openstudio/";
  const relative = clean.slice(prefix.length);
  const dotIndex = relative.lastIndexOf(".");

  if (dotIndex === -1) {
    return src;
  }

  const extension = relative.slice(dotIndex + 1).toLowerCase();
  const directory = isBlogAsset ? "blogs/" : "";
  return `/assets/openstudio/generated/${directory}${relative.slice(0, dotIndex)}-${extension}-${width}.webp`;
};

const withVersionQuery = (src, hash) => {
  if (!hash) {
    return src;
  }

  const fragmentIndex = src.indexOf("#");
  const fragment = fragmentIndex >= 0 ? src.slice(fragmentIndex) : "";
  const withoutFragment = fragmentIndex >= 0 ? src.slice(0, fragmentIndex) : src;
  const queryIndex = withoutFragment.indexOf("?");
  const pathname = queryIndex >= 0 ? withoutFragment.slice(0, queryIndex) : withoutFragment;
  const query = queryIndex >= 0 ? withoutFragment.slice(queryIndex + 1) : "";
  const params = new URLSearchParams(query);

  params.set("v", hash);
  return `${pathname}?${params.toString()}${fragment}`;
};

const nearestGeneratedWidth = (targetWidth, sourceWidth = 3360) => {
  const maximum = Math.max(1, sourceWidth);
  const clamped = Math.max(
    GENERATED_WIDTHS[0],
    Math.min(Math.ceil(targetWidth), GENERATED_WIDTHS.at(-1), maximum),
  );
  const available = GENERATED_WIDTHS.filter((width) => width <= maximum);
  return available.find((width) => width >= clamped) ?? available.at(-1) ?? GENERATED_WIDTHS[0];
};

const inlineImageAttributes = (src, imageManifest) => {
  const entry = imageManifest[cleanImageSrc(src)];
  const variants = [...(entry?.variants ?? [])].sort((first, second) => first.width - second.width);
  const sourceWidth = entry
    ? Math.max(entry.width, ...variants.map((variant) => variant.width))
    : 1600;
  const targetWidth = nearestGeneratedWidth(768, sourceWidth);
  const selected = variants.find((variant) => variant.width >= targetWidth) ?? variants.at(-1);
  const optimizedSrc = selected?.src ?? generatedImagePath(src, targetWidth);
  const sourceSetItems = variants.length
    ? variants.filter((variant) => variant.width <= 1920)
    : GENERATED_WIDTHS.filter((width) => width <= 1920).map((width) => ({
        src: generatedImagePath(src, width),
        width,
      }));
  const aspectRatio = entry?.aspectRatio;

  return {
    decoding: "async",
    fetchpriority: "low",
    loading: "lazy",
    height:
      entry && Number.isFinite(aspectRatio) && aspectRatio > 0
        ? Math.max(1, Math.round(entry.width / aspectRatio))
        : undefined,
    sizes: INLINE_IMAGE_SIZES,
    src: withVersionQuery(optimizedSrc, entry?.hash),
    srcSet: supportsImageOptimization(src)
      ? sourceSetItems
          .map(
            (variant) =>
              `${withVersionQuery(variant.src, entry?.hash)} ${variant.width}w`,
          )
          .join(", ")
      : undefined,
    width: entry?.width,
  };
};

export const removeLeadingArticleMetadata = (markdown) => {
  let body = markdown.replace(/^\s*#\s+.+\r?\n+/, "").trimStart();
  const firstParagraph = body.match(/^([\s\S]*?)(?:\r?\n\s*\r?\n|$)/);
  const trimmed = firstParagraph?.[1]?.trim();
  const italicDek = trimmed?.match(/^([*_])(.+)\1$/s);

  if (firstParagraph?.[0] && italicDek) {
    body = body.slice(firstParagraph[0].length).trimStart();
  }

  body = body.replace(/^-{3,}\s*(?:\r?\n\s*\r?\n|\r?\n|$)/, "").trimStart();
  return body.trim();
};

const markdownComponents = (imageManifest) => ({
  h1: ({ children }) =>
    h("h2", { className: "mt-12 font-headline text-3xl font-bold leading-tight text-white md:text-[2.45rem]" }, children),
  h2: ({ children }) =>
    h("h2", { className: "mt-12 font-headline text-3xl font-bold leading-tight text-white md:text-[2.45rem]" }, children),
  h3: ({ children }) =>
    h("h3", { className: "mt-10 font-headline text-2xl font-semibold leading-tight text-white" }, children),
  h4: ({ children }) =>
    h("h4", { className: "mt-8 font-headline text-xl font-semibold leading-tight text-white" }, children),
  p: ({ children }) =>
    h("p", { className: "mt-5 text-[1.06rem] leading-[1.82] text-white/82 md:text-[1.12rem]" }, children),
  a: ({ children, href }) => {
    const external = href?.startsWith("http");
    return h("a", {
      className: "font-medium text-primary underline decoration-primary/35 underline-offset-4 transition hover:text-secondary hover:decoration-secondary/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
      href,
      rel: external ? "noreferrer" : undefined,
      target: external ? "_blank" : undefined,
    }, children);
  },
  blockquote: ({ children }) =>
    h("blockquote", { className: "mt-8 border-l-2 border-secondary/70 pl-6 text-white/82 [&>p]:mt-0 [&>p]:text-xl [&>p]:leading-9 [&>p]:text-white/82" }, children),
  ul: ({ children }) =>
    h("ul", { className: "mt-6 space-y-3 pl-6 text-[1.04rem] leading-8 text-white/80 marker:text-primary" }, children),
  ol: ({ children }) =>
    h("ol", { className: "mt-6 list-decimal space-y-3 pl-6 text-[1.04rem] leading-8 text-white/80 marker:text-primary" }, children),
  li: ({ children }) => h("li", { className: "pl-2" }, children),
  strong: ({ children }) => h("strong", { className: "font-semibold text-white" }, children),
  em: ({ children }) => h("em", { className: "text-white/82" }, children),
  hr: () => h("hr", { className: "my-12 border-white/10" }),
  pre: ({ children }) =>
    h("pre", { className: "mt-8 overflow-x-auto rounded-lg border border-white/10 bg-black/55 p-5 text-sm leading-7 text-white/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" }, children),
  code: ({ children, className }) =>
    h("code", {
      className: className
        ? `text-sm text-white/88 ${className}`
        : "rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[0.9em] text-secondary",
    }, children),
  table: ({ children }) =>
    h("div", { className: "mt-9 overflow-x-auto rounded-lg border border-white/10" },
      h("table", { className: "w-full min-w-[42rem] border-collapse text-left text-sm text-white/80" }, children)),
  thead: ({ children }) => h("thead", { className: "bg-white/[0.06] text-white" }, children),
  th: ({ children }) =>
    h("th", { className: "border-b border-white/10 px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.18em]" }, children),
  td: ({ children }) =>
    h("td", { className: "border-b border-white/10 px-4 py-3 align-top" }, children),
  img: ({ alt, src }) =>
    h("img", {
      ...inlineImageAttributes(src ?? "", imageManifest),
      alt: alt ?? "",
      className: "mt-9 block h-auto w-full rounded-lg border border-white/10 object-contain",
    }),
});

export const renderBlogArticleHtml = (markdown, imageManifest = {}) =>
  renderToStaticMarkup(
    h(ReactMarkdown, {
      components: markdownComponents(imageManifest),
      remarkPlugins: [remarkGfm],
    }, removeLeadingArticleMetadata(markdown)),
  );
