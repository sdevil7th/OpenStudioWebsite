import {
  generatedImagePath,
  maxWidthForTier,
  nearestGeneratedWidth,
  netlifyImageCdnUrl,
  selectImageWidth,
  shouldUseCdnForHost,
  supportsImageOptimization,
  type AssetPriorityTier,
  type AssetSlotKind,
} from "../../shared/asset-image-plan";
import { generatedImageIndex } from "@/lib/generatedImageIndex";

export type { AssetPriorityTier, AssetSlotKind };

const GENERATED_WIDTHS = [320, 480, 640, 768, 960, 1280, 1600] as const;

type GeneratedImageVariant = {
  src: string;
  width: number;
};

type GeneratedImageEntry = {
  aspectRatio?: number;
  hash?: string;
  variants: GeneratedImageVariant[];
  width: number;
};

export const assetPriorityManifest = {
  home: {
    hero: ["home logo construction scene", "first viewport aurora field"],
    belowFold: ["DAW cockpit screenshots", "story server image", "pillar imagery"],
  },
  features: {
    hero: ["first feature chapter hero image"],
    nearby: ["feature scene static/compositor surface"],
    heavyStory: ["feature transition reference-match masks", "FeatureSceneWebGLStage", "webgl-vendor"],
  },
  ai: {
    hero: ["AI genesis fallback surface"],
    nearby: ["first AI WebGL stage after intro idle"],
    heavyStory: ["AI Three stages", "pretext kinetic text"],
  },
  shared: {
    initial: ["inline HTML/CSS loader", "React route shell", "non-blocking app CSS"],
    postIntro: ["GSAP", "ScrollTrigger", "Lenis", "mobile Radix dialog"],
  },
} as const;

export const getImageLoadingAttributes = (tier: AssetPriorityTier) => {
  switch (tier) {
    case "hero/eager":
      return {
        decoding: "async" as const,
        fetchpriority: "high" as const,
        loading: "eager" as const,
      };
    case "near-fold":
    case "story-active":
    case "story-next":
      return {
        decoding: "async" as const,
        fetchpriority: "low" as const,
        loading: "lazy" as const,
      };
    case "below-fold":
    case "heavy-on-viewport":
    case "nearby/idle-prefetch":
    case "below-fold/lazy":
    case "heavy-story/on-viewport":
    default:
      return {
        decoding: "async" as const,
        fetchpriority: "low" as const,
        loading: "lazy" as const,
      };
  }
};

export const supportsGeneratedImage = supportsImageOptimization;

const runtimeHost = () => (typeof window === "undefined" ? "" : window.location.host);

export const shouldUseNetlifyImageCdn = () => shouldUseCdnForHost(runtimeHost());

const cleanImageSrc = (src: string) => src.split(/[?#]/)[0] ?? src;

const manifestEntryFor = (src: string): GeneratedImageEntry | undefined => {
  const entry = generatedImageIndex[cleanImageSrc(src) as keyof typeof generatedImageIndex];

  if (!entry) {
    return undefined;
  }

  return {
    aspectRatio: entry[1] || undefined,
    hash: entry[2] || undefined,
    variants: entry[3].map((variant) => ({
      src: variant[1],
      width: variant[0],
    })),
    width: entry[0],
  };
};

const sortedVariantsFor = (src: string): GeneratedImageVariant[] =>
  [...(manifestEntryFor(src)?.variants ?? [])].sort((a, b) => a.width - b.width);

const selectManifestVariant = (src: string, targetWidth: number) => {
  const variants = sortedVariantsFor(src);

  return variants.find((variant) => variant.width >= targetWidth) ?? variants[variants.length - 1];
};

const withManifestVersion = (src: string, entry: GeneratedImageEntry | undefined) =>
  entry?.hash ? `${src}?v=${entry.hash}` : src;

const getGeneratedVariantSrc = (src: string, targetWidth: number) => {
  const entry = manifestEntryFor(src);
  const variant = selectManifestVariant(src, targetWidth);

  return variant ? withManifestVersion(variant.src, entry) : generatedImagePath(src, targetWidth);
};

export const widthForTier = (tier: AssetPriorityTier, maxWidth = 1440) => {
  const desiredWidth = maxWidthForTier(tier, maxWidth);
  return nearestGeneratedWidth(desiredWidth);
};

export const getGeneratedImageFallbackSrc = (
  src: string,
  tier: AssetPriorityTier = "below-fold",
  maxWidth = 1440,
  slot: AssetSlotKind = tier === "hero/eager" ? "hero" : "full-bleed",
  requestedWidth = maxWidth,
) => {
  const width = selectImageWidth({
    maxWidth,
    requestedWidth,
    slot,
    sourceWidth: manifestEntryFor(src)?.width,
    tier,
    viewportWidth: maxWidth,
  });

  return getGeneratedVariantSrc(src, width);
};

export const getOptimizedImageSrc = (
  src: string,
  tier: AssetPriorityTier = "below-fold",
  maxWidth = 1440,
  slot: AssetSlotKind = tier === "hero/eager" ? "hero" : "full-bleed",
) => {
  const width = selectImageWidth({
    maxWidth,
    requestedWidth: maxWidth,
    slot,
    sourceWidth: manifestEntryFor(src)?.width,
    tier,
    viewportWidth: maxWidth,
  });

  if (shouldUseNetlifyImageCdn()) {
    const entry = manifestEntryFor(src);

    return netlifyImageCdnUrl({
      aspectRatio: entry?.aspectRatio,
      fit: "contain",
      hash: entry?.hash,
      quality: tier === "hero/eager" || tier === "story-active" ? 74 : 68,
      src,
      width,
    });
  }

  return getGeneratedVariantSrc(src, width);
};

export const getOptimizedSourceSet = (src: string, maxWidth = 1600) => {
  if (!supportsImageOptimization(src)) {
    return undefined;
  }

  const entry = manifestEntryFor(src);
  const variants = sortedVariantsFor(src).filter((variant) => variant.width <= maxWidth);
  const sourceSetItems = variants.length
    ? variants
    : GENERATED_WIDTHS.filter((width) => width <= maxWidth).map((width) => ({
        src: generatedImagePath(src, width),
        width,
      }));

  return sourceSetItems
    .map((variant) => {
      const url = shouldUseNetlifyImageCdn()
        ? netlifyImageCdnUrl({
            aspectRatio: entry?.aspectRatio,
            fit: "contain",
            hash: entry?.hash,
            quality: 72,
            src,
            width: variant.width,
          })
        : withManifestVersion(variant.src, entry);
      return `${url} ${variant.width}w`;
    })
    .join(", ");
};

export const getResponsiveImageAttributes = (
  src: string,
  tier: AssetPriorityTier,
  {
    maxWidth = tier === "hero/eager" ? 1600 : 1280,
    sizes = "100vw",
  }: { maxWidth?: number; sizes?: string } = {},
) => ({
  ...getImageLoadingAttributes(tier),
  sizes,
  src: getOptimizedImageSrc(src, tier, maxWidth),
  srcSet: getOptimizedSourceSet(src, maxWidth),
});
