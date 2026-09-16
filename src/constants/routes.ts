// Canonical website routes. Legacy URL aliases are handled by the router and host.

export const SITE_PATHS = {
  home: "/",
  features: "/features",
  namRack: "/nam-rack",
  ai: "/ai",
  download: "/download",
  docs: "/docs",
  docsGettingStarted: "/docs/getting-started",
  compare: "/compare",
  community: "/community",
  blog: "/blog",
  releases: "/releases",
  roadmap: "/roadmap",
  privacy: "/privacy",
  terms: "/terms",
  security: "/security",
} as const;

export const docPath = (slug: string) => `${SITE_PATHS.docs}/${slug}`;
export const blogPostPath = (slug: string) => `${SITE_PATHS.blog}/${slug}`;

