import { APP_REPOSITORY_URL, BRANDING_ASSETS, SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/constants/site";

const absolute = (path: string) => new URL(path, SITE_URL).href;
const organizationId = `${SITE_URL}/#organization`;
const websiteId = `${SITE_URL}/#website`;

export const getBreadcrumbJsonLd = (items: readonly { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(({ name, path }, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    item: absolute(path),
  })),
});

export const getHomeJsonLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: SITE_NAME,
      url: absolute("/"),
      logo: absolute(BRANDING_ASSETS.android512),
      sameAs: [APP_REPOSITORY_URL],
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: SITE_NAME,
      url: absolute("/"),
      publisher: { "@id": organizationId },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      name: "OpenStudio: Free Open-Source DAW for Windows, macOS & Linux",
      url: absolute("/"),
      image: absolute(SITE_OG_IMAGE),
      isPartOf: { "@id": websiteId },
      mainEntity: { "@id": `${SITE_URL}/#application` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#application`,
      name: SITE_NAME,
      description: "Free, open-source digital audio workstation for recording, editing, mixing and music production.",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Windows, macOS, Linux",
      url: absolute("/download"),
      image: absolute(BRANDING_ASSETS.android512),
      license: `${APP_REPOSITORY_URL}/blob/main/LICENSE`,
      publisher: { "@id": organizationId },
      offers: { "@type": "Offer", price: 0, priceCurrency: "USD", url: absolute("/download") },
    },
  ],
});

export const getGuideJsonLd = (guide: { title: string; summary: string; slug: string }) => [
  {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: guide.title,
    description: guide.summary,
    url: absolute(`/docs/${guide.slug}`),
    mainEntityOfPage: absolute(`/docs/${guide.slug}`),
    author: { "@type": "Organization", name: SITE_NAME, url: absolute("/") },
    publisher: { "@id": organizationId, "@type": "Organization", name: SITE_NAME },
    isPartOf: { "@type": "CollectionPage", name: "OpenStudio Documentation", url: absolute("/docs") },
  },
  getBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Documentation", path: "/docs" },
    { name: guide.title, path: `/docs/${guide.slug}` },
  ]),
];
