import { useEffect } from "react";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/constants/site";

interface PageSeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  jsonLd?: object | object[];
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

const PageSeo = ({ title, description, path, image = SITE_OG_IMAGE, jsonLd }: PageSeoProps) => {
  useEffect(() => {
    const url = new URL(path, SITE_URL).toString();
    const imageUrl = new URL(image, SITE_URL).toString();

    document.title = title;
    ensureMeta("name", "description").setAttribute("content", description);
    ensureMeta("property", "og:type").setAttribute("content", "website");
    ensureMeta("property", "og:site_name").setAttribute("content", SITE_NAME);
    ensureMeta("property", "og:title").setAttribute("content", title);
    ensureMeta("property", "og:description").setAttribute("content", description);
    ensureMeta("property", "og:url").setAttribute("content", url);
    ensureMeta("property", "og:image").setAttribute("content", imageUrl);
    ensureMeta("property", "og:image:alt").setAttribute("content", `${SITE_NAME} share image`);
    ensureMeta("property", "og:image:width").setAttribute("content", "1200");
    ensureMeta("property", "og:image:height").setAttribute("content", "630");
    ensureMeta("property", "og:locale").setAttribute("content", "en_US");
    ensureMeta("name", "twitter:card").setAttribute("content", "summary_large_image");
    ensureMeta("name", "twitter:title").setAttribute("content", title);
    ensureMeta("name", "twitter:description").setAttribute("content", description);
    ensureMeta("name", "twitter:image").setAttribute("content", imageUrl);
    ensureCanonical().setAttribute("href", url);

    if (jsonLd) {
      ensurePageJsonLd(jsonLd);
    } else {
      removePageJsonLd();
    }
  }, [description, image, jsonLd, path, title]);

  return null;
};

export default PageSeo;
