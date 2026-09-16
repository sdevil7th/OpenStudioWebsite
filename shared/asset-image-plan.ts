const OPENSTUDIO_ASSET_PREFIX = "/assets/openstudio/";
const BLOG_ASSET_PREFIX = "/assets/blogs/";
const GENERATED_PREFIX = "/assets/openstudio/generated/";
const OPTIMIZABLE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const extensionOf = (src: string) => {
  const cleanPath = src.split(/[?#]/)[0] ?? src;
  const match = cleanPath.match(/\.[a-z0-9]+$/i);
  return match?.[0]?.toLowerCase() ?? "";
};

export const supportsImageOptimization = (src: string) =>
  (src.startsWith(OPENSTUDIO_ASSET_PREFIX) || src.startsWith(BLOG_ASSET_PREFIX)) &&
  !src.startsWith(GENERATED_PREFIX) &&
  OPTIMIZABLE_EXTENSIONS.has(extensionOf(src));

export const generatedImagePath = (src: string, width: number) => {
  if (!supportsImageOptimization(src)) {
    return src;
  }

  const cleanPath = src.split(/[?#]/)[0] ?? src;
  const isBlogAsset = cleanPath.startsWith(BLOG_ASSET_PREFIX);
  const relative = cleanPath.slice(
    isBlogAsset ? BLOG_ASSET_PREFIX.length : OPENSTUDIO_ASSET_PREFIX.length,
  );
  const dotIndex = relative.lastIndexOf(".");

  if (dotIndex === -1) {
    return src;
  }

  const extensionToken = relative.slice(dotIndex + 1).toLowerCase();
  const generatedDirectory = isBlogAsset ? "blogs/" : "";
  return `${GENERATED_PREFIX}${generatedDirectory}${relative.slice(0, dotIndex)}-${extensionToken}-${width}.webp`;
};


export const intrinsicImageDimensions = (width: number, aspectRatio?: number) => {
  const validAspectRatio =
    typeof aspectRatio === "number" && Number.isFinite(aspectRatio) && aspectRatio > 0
      ? aspectRatio
      : undefined;

  return {
    height: validAspectRatio
      ? Math.max(1, Math.round(width / validAspectRatio))
      : undefined,
    width,
  };
};

export const withVersionQuery = (src: string, hash?: string) => {
  if (!hash) {
    return src;
  }

  const fragmentIndex = src.indexOf("#");
  const fragment = fragmentIndex >= 0 ? src.slice(fragmentIndex) : "";
  const srcWithoutFragment = fragmentIndex >= 0 ? src.slice(0, fragmentIndex) : src;
  const queryIndex = srcWithoutFragment.indexOf("?");
  const pathname = queryIndex >= 0 ? srcWithoutFragment.slice(0, queryIndex) : srcWithoutFragment;
  const query = queryIndex >= 0 ? srcWithoutFragment.slice(queryIndex + 1) : "";
  const params = new URLSearchParams(query);

  params.set("v", hash);
  return `${pathname}?${params.toString()}${fragment}`;
};
