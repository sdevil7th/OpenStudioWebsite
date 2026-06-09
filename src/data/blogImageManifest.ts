export const blogImageManifest = {
  "ace-step-diffusers-almost-3x-faster": "/assets/blogs/ace-step-diffusers-almost-3x-faster.webp?v=9bb2edb7ffce",
  "ace-step-integration-challenges": "/assets/blogs/ace-step-integration-challenges.webp?v=e8abb27b9f02",
  "ara2-hosting-challenges-blog": "/assets/blogs/ara2-hosting-challenges-blog.webp?v=0de1365f6f18",
  "building-the-midi-editor-harness": "/assets/blogs/building-the-midi-editor-harness.webp?v=d9aebc44146b",
  "the-compute-heist": "/assets/blogs/the-compute-heist.webp?v=f99012174b29",
} as const;

export type BlogImageSlug = keyof typeof blogImageManifest;
