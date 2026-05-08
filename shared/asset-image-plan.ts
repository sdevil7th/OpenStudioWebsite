export type AssetPriorityTier =
  | "hero/eager"
  | "near-fold"
  | "story-active"
  | "story-next"
  | "below-fold"
  | "heavy-on-viewport"
  | "nearby/idle-prefetch"
  | "below-fold/lazy"
  | "heavy-story/on-viewport";

export type AssetPlanGroupName =
  | "initialViewport"
  | "cinematicFirstFrame"
  | "nearby"
  | "transitionUpcoming"
  | "belowFold"
  | "runtime";

export type AssetSlotKind =
  | "hero"
  | "full-bleed"
  | "cinematic"
  | "panel"
  | "card"
  | "transition-mask"
  | "webgl-base"
  | "webgl-fragment"
  | "thumbnail";

export interface ImageManifestVariant {
  bytes: number;
  format: string;
  src: string;
  width: number;
}

export interface ImageManifestEntry {
  aspectRatio?: number;
  bytes?: number;
  format?: string;
  hash?: string;
  hasAlpha?: boolean;
  height: number;
  source?: string;
  variants?: ImageManifestVariant[];
  width: number;
}

export type ImageManifest = Record<string, ImageManifestEntry>;

export interface AssetPlanRequestItem {
  fit?: "contain" | "cover";
  group?: AssetPlanGroupName;
  height?: number;
  id?: string;
  maxWidth?: number;
  quality?: number;
  slot?: AssetSlotKind;
  src: string;
  tier?: AssetPriorityTier;
  width?: number;
}

export interface AssetPlanRequestGroup {
  assets: AssetPlanRequestItem[];
  name: AssetPlanGroupName;
}

export interface AssetPlanRequest {
  delivery?: "auto" | "cdn" | "generated";
  dpr?: number;
  groups?: AssetPlanRequestGroup[];
  route?: string;
  viewportHeight?: number;
  viewportWidth?: number;
}

export interface AssetPlanItem {
  aspectRatio?: number;
  cdnUrl: string;
  fallbackUrl: string;
  fit: "contain" | "cover";
  group: AssetPlanGroupName;
  hash?: string;
  height?: number;
  id: string;
  intrinsicHeight?: number;
  intrinsicWidth?: number;
  quality: number;
  src: string;
  tier: AssetPriorityTier;
  url: string;
  width: number;
}

export interface AssetPlanGroup {
  assets: AssetPlanItem[];
  name: AssetPlanGroupName;
}

export interface AssetPlanResponse {
  delivery: "cdn" | "generated";
  generatedAt: string;
  groups: AssetPlanGroup[];
  route: string;
}

const OPENSTUDIO_ASSET_PREFIX = "/assets/openstudio/";
const GENERATED_PREFIX = "/assets/openstudio/generated/";
const OPTIMIZABLE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const WIDTHS = [320, 480, 640, 768, 960, 1280, 1600] as const;

const extensionOf = (src: string) => {
  const cleanPath = src.split(/[?#]/)[0] ?? src;
  const match = cleanPath.match(/\.[a-z0-9]+$/i);
  return match?.[0]?.toLowerCase() ?? "";
};

export const supportsImageOptimization = (src: string) =>
  src.startsWith(OPENSTUDIO_ASSET_PREFIX) &&
  !src.startsWith(GENERATED_PREFIX) &&
  OPTIMIZABLE_EXTENSIONS.has(extensionOf(src));

export const generatedImagePath = (src: string, width: number) => {
  if (!supportsImageOptimization(src)) {
    return src;
  }

  const cleanPath = src.split(/[?#]/)[0] ?? src;
  const relative = cleanPath.slice(OPENSTUDIO_ASSET_PREFIX.length);
  const dotIndex = relative.lastIndexOf(".");

  if (dotIndex === -1) {
    return src;
  }

  const extensionToken = relative.slice(dotIndex + 1).toLowerCase();
  return `${GENERATED_PREFIX}${relative.slice(0, dotIndex)}-${extensionToken}-${width}.webp`;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const nearestGeneratedWidth = (targetWidth: number, sourceWidth = 1600) => {
  const maxWidth = Math.max(1, sourceWidth);
  const clampedTarget = clamp(Math.ceil(targetWidth), WIDTHS[0], Math.min(WIDTHS[WIDTHS.length - 1], maxWidth));
  const availableWidths = WIDTHS.filter((width) => width <= maxWidth);

  return (
    availableWidths.find((width) => width >= clampedTarget) ??
    availableWidths[availableWidths.length - 1] ??
    WIDTHS[0]
  );
};

export const maxWidthForTier = (tier: AssetPriorityTier, maxWidth = 1600) => {
  const cap =
    tier === "hero/eager"
      ? 1600
      : tier === "story-active"
        ? 1280
        : tier === "story-next" || tier === "near-fold" || tier === "nearby/idle-prefetch"
          ? 960
          : tier === "heavy-on-viewport" || tier === "heavy-story/on-viewport"
            ? 1024
            : 768;

  return Math.min(maxWidth, cap);
};

const slotBaseWidth = (
  slot: AssetSlotKind,
  viewportWidth: number,
  requestedWidth?: number,
) => {
  if (requestedWidth && requestedWidth > 0) {
    return requestedWidth;
  }

  switch (slot) {
    case "full-bleed":
    case "cinematic":
    case "hero":
      return viewportWidth;
    case "webgl-base":
      return viewportWidth * 0.7;
    case "transition-mask":
      return viewportWidth * 0.72;
    case "webgl-fragment":
      return viewportWidth * 0.34;
    case "panel":
      return viewportWidth * 0.5;
    case "card":
      return viewportWidth * 0.42;
    case "thumbnail":
      return 360;
    default:
      return viewportWidth;
  }
};

const dprForSlot = (slot: AssetSlotKind, dpr: number) => {
  const cap = slot === "transition-mask" || slot.startsWith("webgl") ? 1.35 : 1.75;
  return clamp(dpr || 1, 1, cap);
};

const slotCap = (slot: AssetSlotKind) => {
  switch (slot) {
    case "transition-mask":
      return 960;
    case "webgl-base":
      return 1024;
    case "webgl-fragment":
      return 768;
    case "panel":
    case "card":
      return 960;
    case "thumbnail":
      return 480;
    default:
      return 1600;
  }
};

export const selectImageWidth = ({
  dpr = 1,
  maxWidth,
  requestedWidth,
  slot = "full-bleed",
  sourceWidth = 1600,
  tier = "below-fold",
  viewportWidth = 1280,
}: {
  dpr?: number;
  maxWidth?: number;
  requestedWidth?: number;
  slot?: AssetSlotKind;
  sourceWidth?: number;
  tier?: AssetPriorityTier;
  viewportWidth?: number;
}) => {
  const baseWidth = slotBaseWidth(slot, viewportWidth, requestedWidth);
  const target = baseWidth * dprForSlot(slot, dpr);
  const cappedTarget = Math.min(target, slotCap(slot), maxWidthForTier(tier, maxWidth ?? 1600));
  return nearestGeneratedWidth(cappedTarget, sourceWidth);
};

const qualityFor = (slot: AssetSlotKind, tier: AssetPriorityTier, requestedQuality?: number) => {
  if (requestedQuality) {
    return clamp(Math.round(requestedQuality), 40, 92);
  }

  if (slot === "transition-mask") {
    return 62;
  }

  if (slot.startsWith("webgl")) {
    return 70;
  }

  if (tier === "hero/eager" || tier === "story-active") {
    return 74;
  }

  return 68;
};

const selectGeneratedVariant = (entry: ImageManifestEntry | undefined, width: number) => {
  const variants = [...(entry?.variants ?? [])].sort((a, b) => a.width - b.width);

  return variants.find((variant) => variant.width >= width) ?? variants[variants.length - 1];
};

const generatedFallbackUrl = (src: string, entry: ImageManifestEntry | undefined, width: number) => {
  const variant = selectGeneratedVariant(entry, width);
  const fallbackSrc = variant?.src ?? generatedImagePath(src, width);

  return `${fallbackSrc}${entry?.hash ? `?v=${entry.hash}` : ""}`;
};

export const netlifyImageCdnUrl = ({
  aspectRatio,
  fit = "contain",
  hash,
  height,
  quality,
  src,
  width,
}: {
  aspectRatio?: number;
  fit?: "contain" | "cover";
  hash?: string;
  height?: number;
  quality: number;
  src: string;
  width: number;
}) => {
  if (!supportsImageOptimization(src)) {
    return src;
  }

  const resolvedHeight =
    height && height > 0
      ? Math.round(height)
      : aspectRatio && aspectRatio > 0
        ? Math.max(1, Math.round(width / aspectRatio))
        : undefined;
  const resolvedFit = fit === "cover" && resolvedHeight ? "cover" : "contain";
  const sourceUrl = hash ? `${src}?v=${encodeURIComponent(hash)}` : src;
  const params = new URLSearchParams({
    fit: resolvedFit,
    q: String(quality),
    url: sourceUrl,
    w: String(width),
  });
  if (resolvedFit === "cover" && resolvedHeight) {
    params.set("h", String(resolvedHeight));
  }
  return `/.netlify/images?${params.toString()}`;
};

export const shouldUseCdnForHost = (host: string, delivery: AssetPlanRequest["delivery"] = "auto") => {
  if (delivery === "cdn") {
    return true;
  }

  if (delivery === "generated") {
    return false;
  }

  const normalizedHost = host.toLowerCase();
  return (
    normalizedHost.endsWith(".netlify.app") ||
    normalizedHost.includes("netlify") ||
    normalizedHost === "openstudio.org.in" ||
    normalizedHost === "www.openstudio.org.in"
  );
};

export const buildAssetPlan = (
  request: AssetPlanRequest,
  manifest: ImageManifest,
  options: { host?: string; now?: Date } = {},
): AssetPlanResponse => {
  const viewportWidth = Math.max(1, Math.round(request.viewportWidth ?? 1280));
  const dpr = clamp(request.dpr ?? 1, 1, 3);
  const useCdn = shouldUseCdnForHost(options.host ?? "", request.delivery);
  const groups = request.groups?.length
    ? request.groups
    : ([{ name: "runtime", assets: [] }] satisfies AssetPlanRequestGroup[]);

  return {
    delivery: useCdn ? "cdn" : "generated",
    generatedAt: (options.now ?? new Date()).toISOString(),
    groups: groups.map((group) => ({
      name: group.name,
      assets: group.assets.map((asset, index) => {
        const entry = manifest[asset.src];
        const slot = asset.slot ?? "full-bleed";
        const tier = asset.tier ?? "below-fold";
        const width = selectImageWidth({
          dpr,
          maxWidth: asset.maxWidth,
          requestedWidth: asset.width,
          slot,
          sourceWidth: entry?.width,
          tier,
          viewportWidth,
        });
        const quality = qualityFor(slot, tier, asset.quality);
        const fallbackUrl = generatedFallbackUrl(asset.src, entry, width);
        const cdnUrl = netlifyImageCdnUrl({
          aspectRatio: entry?.aspectRatio,
          fit: asset.fit ?? "contain",
          height: asset.height,
          hash: entry?.hash,
          quality,
          src: asset.src,
          width,
        });

        return {
          aspectRatio: entry?.aspectRatio,
          cdnUrl,
          fallbackUrl,
          fit: asset.fit ?? "contain",
          group: group.name,
          hash: entry?.hash,
          height: asset.height,
          id: asset.id ?? `${group.name}-${index}`,
          intrinsicHeight: entry?.height,
          intrinsicWidth: entry?.width,
          quality,
          src: asset.src,
          tier,
          url: useCdn ? cdnUrl : fallbackUrl,
          width,
        };
      }),
    })),
    route: request.route ?? "/",
  };
};
