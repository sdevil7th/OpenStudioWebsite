import { readdirSync } from "node:fs";

// Assert the public inventory independently of the generated sitemap/rewrites.
// Editorial additions must be covered without changing a fixed page count.
const pageRoutes = [
  "/", "/features", "/nam-rack", "/ai", "/download", "/docs", "/compare",
  "/community", "/blog", "/releases", "/roadmap", "/privacy", "/terms", "/security",
];
const docs = readdirSync(new URL("../../src/features/docs/content/", import.meta.url))
  .filter((name) => name.endsWith(".ts"))
  .map((name) => `/docs/${name.slice(0, -3)}`);
const posts = readdirSync(new URL("../../blogs/", import.meta.url))
  .filter((name) => name.endsWith(".md") && name !== "README.md")
  .map((name) => `/blog/${name.replace(/^\d{4}-\d{2}-\d{2}-/, "").slice(0, -3).toLowerCase()}`);

export const authoredRoutes = [...pageRoutes, ...docs, ...posts].sort();
