import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repoRoot = path.resolve(import.meta.dirname, "..");
const publicAssetsRoot = path.join(repoRoot, "public", "assets");
const openstudioSourceRoot = path.join(publicAssetsRoot, "openstudio");
const blogAssetsRoot = path.join(publicAssetsRoot, "blogs");
const generatedRoot = path.join(openstudioSourceRoot, "generated");
const manifestPath = path.join(generatedRoot, "image-manifest.json");
const generatedIndexPath = path.join(repoRoot, "src", "lib", "generatedImageIndex.ts");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const STANDARD_WIDTHS = [320, 480, 640, 768, 960, 1280, 1600];
const BLOG_WIDTHS = [...STANDARD_WIDTHS, 1920, 2560, 3200, 3360];
const HIGH_RESOLUTION_BLOG_MASTERS = new Set([
  "/assets/blogs/building-openstudio-nam-rack.webp",
]);
const REFERENCE_ROOTS = ["src", "index.html"];
const OPENSTUDIO_SOURCE_DIRS = [
  "screenshots",
  "feature-story",
  path.join("feature-story", "transitions"),
  "download-cinematic",
  "design-reference",
];

const toPosix = (value) => value.split(path.sep).join("/");

const isInside = (candidate, parent) => {
  const relative = path.relative(parent, candidate);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
};

const collectImages = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const images = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (isInside(fullPath, generatedRoot) || fullPath.includes(`${path.sep}generated${path.sep}`)) {
      continue;
    }

    if (entry.isDirectory()) {
      images.push(...(await collectImages(fullPath)));
      continue;
    }

    if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      images.push(fullPath);
    }
  }

  return images;
};

const assetLocationFor = (sourcePath) => {
  if (isInside(sourcePath, blogAssetsRoot)) {
    const relative = path.relative(blogAssetsRoot, sourcePath);
    return {
      generatedRelative: path.join("blogs", relative),
      publicPath: `/assets/blogs/${toPosix(relative)}`,
    };
  }

  if (isInside(sourcePath, openstudioSourceRoot)) {
    const relative = path.relative(openstudioSourceRoot, sourcePath);
    return {
      generatedRelative: relative,
      publicPath: `/assets/openstudio/${toPosix(relative)}`,
    };
  }

  throw new Error(`Image source is outside configured asset roots: ${sourcePath}`);
};

const outputPathFor = (sourcePath, width) => {
  const relative = assetLocationFor(sourcePath).generatedRelative;
  const parsed = path.parse(relative);
  const extensionToken = parsed.ext.slice(1).toLowerCase();
  return path.join(generatedRoot, parsed.dir, `${parsed.name}-${extensionToken}-${width}.webp`);
};

const publicPathFor = (filePath) => `/assets/openstudio/generated/${toPosix(path.relative(generatedRoot, filePath))}`;

const sourcePublicPathFor = (filePath) => assetLocationFor(filePath).publicPath;

export const selectVariantWidths = (candidateWidths, sourceWidth) => {
  const validSourceWidth =
    Number.isFinite(sourceWidth) && sourceWidth > 0 ? Math.round(sourceWidth) : 960;
  const maximumGeneratedWidth =
    candidateWidths[candidateWidths.length - 1] ?? validSourceWidth;
  const terminalWidth = Math.min(validSourceWidth, maximumGeneratedWidth);

  return [
    ...new Set([
      ...candidateWidths.filter((width) => width <= terminalWidth),
      terminalWidth,
    ]),
  ].sort((first, second) => first - second);
};

const hashFile = async (filePath) => {
  const source = await fs.readFile(filePath);
  return createHash("sha256").update(source).digest("hex").slice(0, 14);
};

const collectReferenceFiles = async (targetPath) => {
  const fullPath = path.join(repoRoot, targetPath);
  const stats = await fs.stat(fullPath);

  if (stats.isFile()) {
    return [fullPath];
  }

  const entries = await fs.readdir(fullPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(fullPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectReferenceFiles(path.relative(repoRoot, entryPath))));
      continue;
    }

    if (entry.isFile() && /\.(css|html|ts|tsx)$/i.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
};

const collectReferencedAssetPaths = async () => {
  const files = (await Promise.all(REFERENCE_ROOTS.map(collectReferenceFiles))).flat();
  const references = new Set();
  const assetPattern = /\/assets\/(?:openstudio|blogs)\/[^"'()\s?#]+\.(?:png|jpe?g|webp)/gi;

  for (const filePath of files) {
    const source = await fs.readFile(filePath, "utf8");
    for (const match of source.matchAll(assetPattern)) {
      references.add(match[0]);
    }
  }

  return references;
};

const generateVariant = async (sourcePath, width, metadata, sourceStats) => {
  const target = outputPathFor(sourcePath, width);
  await fs.mkdir(path.dirname(target), { recursive: true });

  try {
    const existingStats = await fs.stat(target);
    if (existingStats.size > 0 && existingStats.mtimeMs >= sourceStats.mtimeMs) {
      return {
        bytes: existingStats.size,
        format: "webp",
        src: publicPathFor(target),
        width,
      };
    }
  } catch {
    // Missing variants are generated below.
  }

  const hasAlpha = Boolean(metadata.hasAlpha);
  await sharp(sourcePath, { limitInputPixels: false })
    .rotate()
    .resize({
      kernel: sharp.kernel.lanczos3,
      width,
      withoutEnlargement: true,
    })
    .webp({
      effort: 4,
      quality: hasAlpha ? 82 : 76,
      smartSubsample: true,
    })
    .toFile(target);

  const stats = await fs.stat(target);
  return {
    bytes: stats.size,
    format: "webp",
    src: publicPathFor(target),
    width,
  };
};

const pruneGeneratedFiles = async (directory, keepFiles) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await pruneGeneratedFiles(fullPath, keepFiles);
      const remaining = await fs.readdir(fullPath);
      if (remaining.length === 0) {
        await fs.rmdir(fullPath);
      }
      continue;
    }

    if (!keepFiles.has(fullPath)) {
      await fs.unlink(fullPath);
    }
  }
};

const writeGeneratedImageIndex = async (manifest) => {
  const compactIndex = Object.fromEntries(
    Object.entries(manifest).map(([source, entry]) => [
      source,
      [
        entry.width,
        entry.aspectRatio ?? 0,
        entry.hash ?? "",
        entry.variants.map((variant) => [variant.width, variant.src]),
      ],
    ]),
  );
  const output = [
    "// Generated from public/assets/openstudio/generated/image-manifest.json.",
    "// Keep this compact: it is imported by runtime image helpers.",
    `export const generatedImageIndex = ${JSON.stringify(compactIndex)} as const;`,
    "",
  ].join("\n");

  await fs.writeFile(generatedIndexPath, output);
};

const generate = async () => {
  const resolvedSourceDirs = [
    ...OPENSTUDIO_SOURCE_DIRS.map((directory) => path.join(openstudioSourceRoot, directory)),
    blogAssetsRoot,
  ];
  const existingSourceDirs = [];

  for (const directory of resolvedSourceDirs) {
    try {
      const stats = await fs.stat(directory);
      if (stats.isDirectory()) {
        existingSourceDirs.push(directory);
      }
    } catch {
      // Optional asset folders are allowed to be absent.
    }
  }

  const referencedAssets = await collectReferencedAssetPaths();
  const sources = [...new Set((await Promise.all(existingSourceDirs.map(collectImages))).flat())]
    .filter((sourcePath) => referencedAssets.has(sourcePublicPathFor(sourcePath)))
    .sort();

  await fs.mkdir(generatedRoot, { recursive: true });

  const manifest = {};
  const keepFiles = new Set([manifestPath]);
  let variantCount = 0;

  for (const sourcePath of sources) {
    const metadata = await sharp(sourcePath, { limitInputPixels: false }).metadata();
    const sourceStats = await fs.stat(sourcePath);
    const sourceWidth = metadata.width ?? 0;
    const sourceHeight = metadata.height ?? 0;
    const sourceHash = await hashFile(sourcePath);
    const isBlogAsset = isInside(sourcePath, blogAssetsRoot);
    const isHighResolutionBlogMaster =
      isBlogAsset &&
      HIGH_RESOLUTION_BLOG_MASTERS.has(sourcePublicPathFor(sourcePath));
    const candidateWidths = isHighResolutionBlogMaster
      ? BLOG_WIDTHS
      : STANDARD_WIDTHS;
    const selectedWidths = selectVariantWidths(candidateWidths, sourceWidth);
    const variants = [];

    for (const width of selectedWidths) {
      const variant = await generateVariant(sourcePath, width, metadata, sourceStats);
      keepFiles.add(path.join(repoRoot, "public", variant.src.slice(1).replace(/\//g, path.sep)));
      variants.push(variant);
      variantCount += 1;
    }

    manifest[sourcePublicPathFor(sourcePath)] = {
      aspectRatio: sourceWidth && sourceHeight ? sourceWidth / sourceHeight : undefined,
      bytes: sourceStats.size,
      format: metadata.format,
      hash: sourceHash,
      hasAlpha: Boolean(metadata.hasAlpha),
      height: sourceHeight,
      source: sourcePublicPathFor(sourcePath),
      width: sourceWidth,
      variants,
    };
  }

  await fs.writeFile(`${manifestPath}.tmp`, `${JSON.stringify(manifest, null, 2)}\n`);
  await fs.rename(`${manifestPath}.tmp`, manifestPath);
  await writeGeneratedImageIndex(manifest);
  await pruneGeneratedFiles(generatedRoot, keepFiles);
  console.log(`[images] generated ${variantCount} responsive image variants for ${sources.length} source assets.`);
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await generate();
}
