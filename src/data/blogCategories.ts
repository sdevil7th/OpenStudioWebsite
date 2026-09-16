import type { BlogPostSummary } from "./blogs";

export const CATEGORY_BY_SLUG: Record<string, string> = {
  "minimax-stable-audio-diffusers-openstudio": "AI",
  "build-guitar-tones-with-openstudio-nam-rack": "NAM Rack",
  "building-openstudio-nam-rack": "Engineering",
  "ace-step-diffusers-almost-3x-faster": "AI",
  "building-the-midi-editor-harness": "Engineering",
  "ace-step-integration-challenges": "AI",
  "ara2-hosting-challenges-blog": "Plugins",
};

export const categoryOf = (post: BlogPostSummary) => CATEGORY_BY_SLUG[post.slug] ?? "Engineering";
