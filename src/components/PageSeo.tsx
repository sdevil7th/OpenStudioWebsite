import { useEffect } from "react";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/constants/site";
import { generatedImageIndex } from "@/lib/generatedImageIndex";
import {
  intrinsicImageDimensions,
  withVersionQuery,
} from "../../shared/asset-image-plan";

interface PageSeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  jsonLd?: object | object[];
  ogType?: "website" | "article";
  robots?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authorProfileUrl?: string;
  articleSection?: string;
}

const ensureMeta = (attribute: "name" | "property", value: string) => {
  const selector = `meta[${attribute}="${value}"]`;
  let node = document.head.querySelector<HTMLMetaElement>(selector);

  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, value);
    document.head.appendChild(node);
  }

  return node;
};

const ensureCanonical = () => {
  let node = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", "canonical");
    document.head.appendChild(node);
  }

  return node;
};

const ensurePageJsonLd = (data: object | object[]) => {
  let node = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"][data-page]');

  if (!node) {
    node = document.createElement("script");
    node.setAttribute("type", "application/ld+json");
    node.dataset.page = "true";
    document.head.appendChild(node);
  }

  node.textContent = JSON.stringify(data);
};

const removePageJsonLd = () => {
  document.head.querySelector('script[type="application/ld+json"][data-page]')?.remove();
};

const getDefaultPageJsonLd = ({
  description,
  image,
  title,
  url,
}: {
  description: string;
  image: string;
  title: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  description,
  image,
  url,
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
});

const removeMeta = (attribute: "name" | "property", value: string) => {
  document.head
    .querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${value}"]`)
    .forEach((node) => node.remove());
};

const syncOptionalMeta = (
  attribute: "name" | "property",
  value: string,
  content?: string,
) => {
  if (content) {
    ensureMeta(attribute, value).setAttribute("content", content);
    return;
  }

  removeMeta(attribute, value);
};

const getSocialImageMetadata = (image: string) => {
  const imageUrl = new URL(image, SITE_URL);
  const entry =
    generatedImageIndex[
      imageUrl.pathname as keyof typeof generatedImageIndex
    ];

  if (!entry) {
    return {
      height: 630,
      src: image,
      width: 1200,
    };
  }

  const dimensions = intrinsicImageDimensions(entry[0], entry[1] || undefined);

  return {
    height: dimensions.height ?? 630,
    src: withVersionQuery(image, entry[2] || undefined),
    width: dimensions.width,
  };
};

const PageSeo = ({
  title,
  description,
  path,
  image = SITE_OG_IMAGE,
  imageAlt = `${SITE_NAME} share image`,
  jsonLd,
  ogType = "website",
  robots = "index, follow",
  publishedTime,
  modifiedTime,
  authorProfileUrl,
  articleSection = "OpenStudio Blog",
}: PageSeoProps) => {
  useEffect(() => {
    const url = new URL(path, SITE_URL).toString();
    const imageMetadata = getSocialImageMetadata(image);
    const imageUrl = new URL(imageMetadata.src, SITE_URL).toString();
    const isArticle = ogType === "article";

    document.head.querySelector('script[type="application/ld+json"][data-static-route]')?.remove();
    document.title = title;
    removeMeta("name", "keywords");
    ensureMeta("name", "description").setAttribute("content", description);
    ensureMeta("name", "robots").setAttribute("content", robots);
    ensureMeta("property", "og:type").setAttribute("content", ogType);
    ensureMeta("property", "og:site_name").setAttribute("content", SITE_NAME);
    ensureMeta("property", "og:title").setAttribute("content", title);
    ensureMeta("property", "og:description").setAttribute("content", description);
    ensureMeta("property", "og:url").setAttribute("content", url);
    ensureMeta("property", "og:image").setAttribute("content", imageUrl);
    ensureMeta("property", "og:image:alt").setAttribute("content", imageAlt);
    ensureMeta("property", "og:image:width").setAttribute(
      "content",
      String(imageMetadata.width),
    );
    ensureMeta("property", "og:image:height").setAttribute(
      "content",
      String(imageMetadata.height),
    );
    ensureMeta("property", "og:locale").setAttribute("content", "en_US");
    ensureMeta("name", "twitter:card").setAttribute("content", "summary_large_image");
    ensureMeta("name", "twitter:title").setAttribute("content", title);
    ensureMeta("name", "twitter:description").setAttribute("content", description);
    ensureMeta("name", "twitter:image").setAttribute("content", imageUrl);
    ensureMeta("name", "twitter:image:alt").setAttribute("content", imageAlt);
    ensureCanonical().setAttribute("href", url);
    syncOptionalMeta(
      "property",
      "article:published_time",
      isArticle ? publishedTime : undefined,
    );
    syncOptionalMeta(
      "property",
      "article:modified_time",
      isArticle ? modifiedTime : undefined,
    );
    syncOptionalMeta(
      "property",
      "article:author",
      isArticle ? authorProfileUrl : undefined,
    );
    syncOptionalMeta(
      "property",
      "article:section",
      isArticle ? articleSection : undefined,
    );

    if (jsonLd) {
      ensurePageJsonLd(jsonLd);
    } else if (!robots.toLowerCase().includes("noindex")) {
      ensurePageJsonLd(
        getDefaultPageJsonLd({
          description,
          image: imageUrl,
          title,
          url,
        }),
      );
    } else {
      removePageJsonLd();
    }
  }, [
    authorProfileUrl,
    articleSection,
    description,
    image,
    imageAlt,
    jsonLd,
    modifiedTime,
    ogType,
    path,
    publishedTime,
    robots,
    title,
  ]);

  return null;
};

export default PageSeo;
