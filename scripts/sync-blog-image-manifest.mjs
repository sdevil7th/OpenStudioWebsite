import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicBlogAssetsRoot = path.join(repoRoot, "public", "assets", "blogs");
const outputPath = path.join(repoRoot, "src", "data", "blogImageManifest.ts");
const supportedExtensions = new Set([".webp", ".png", ".jpg", ".jpeg"]);

const pathExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const collectBlogImages = async () => {
  if (!await pathExists(publicBlogAssetsRoot)) {
    return [];
  }

  const entries = await fs.readdir(publicBlogAssetsRoot, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => {
      const slug = path.basename(entry.name, path.extname(entry.name)).toLowerCase();
      return {
        slug,
        src: `/assets/blogs/${entry.name}`,
      };
    })
    .sort((first, second) => first.slug.localeCompare(second.slug));
};

const serializeManifest = (images) => {
  const body = images
    .map((image) => `  ${JSON.stringify(image.slug)}: ${JSON.stringify(image.src)},`)
    .join("\n");

  return [
    "export const blogImageManifest = {",
    body,
    "} as const;",
    "",
    "export type BlogImageSlug = keyof typeof blogImageManifest;",
    "",
  ].join("\n");
};

const images = await collectBlogImages();
const nextContent = serializeManifest(images);

let currentContent = "";

try {
  currentContent = await fs.readFile(outputPath, "utf8");
} catch {
  // The manifest may not exist on the first sync.
}

if (currentContent !== nextContent) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, nextContent, "utf8");
}

console.log(`[blogs] synced ${images.length} public blog image${images.length === 1 ? "" : "s"}.`);
