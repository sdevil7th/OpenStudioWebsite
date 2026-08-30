import {
  withBlogPostHtml,
  type BlogPost,
  type BlogPostSummary,
} from "@/data/blogs";

const articleLoaders = import.meta.glob<string>(
  ["./generatedBlogContent/*.ts"],
  {
    import: "default",
  },
);

const pendingPosts = new Map<string, Promise<BlogPost>>();
const loadedPosts = new Map<string, BlogPost>();

const loaderFor = (post: BlogPostSummary) =>
  articleLoaders[
    `./generatedBlogContent/${post.filename.replace(/\.md$/i, ".ts")}`
  ];

export const getLoadedBlogPost = (post: BlogPostSummary) =>
  loadedPosts.get(post.filename);

export const loadBlogPostContent = (post: BlogPostSummary) => {
  const loaded = getLoadedBlogPost(post);
  if (loaded) {
    return Promise.resolve(loaded);
  }

  const pending = pendingPosts.get(post.filename);
  if (pending) {
    return pending;
  }

  const loader = loaderFor(post);
  if (!loader) {
    return Promise.reject(new Error(`No generated article found for ${post.filename}.`));
  }

  const request = loader()
    .then((articleHtml) => {
      const hydratedPost = withBlogPostHtml(post, articleHtml);
      loadedPosts.set(post.filename, hydratedPost);
      return hydratedPost;
    })
    .finally(() => {
      pendingPosts.delete(post.filename);
    });

  pendingPosts.set(post.filename, request);
  return request;
};

export const preloadBlogPostContent = (post: BlogPostSummary) => {
  void loadBlogPostContent(post).catch(() => undefined);
};
