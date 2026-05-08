export const blogImageManifest = {
  "ace-step-integration-challenges": "/assets/blogs/ace-step-integration-challenges.webp",
  "ara2-hosting-challenges-blog": "/assets/blogs/ara2-hosting-challenges-blog.webp",
  "the-compute-heist": "/assets/blogs/the-compute-heist.webp",
} as const;

export type BlogImageSlug = keyof typeof blogImageManifest;
