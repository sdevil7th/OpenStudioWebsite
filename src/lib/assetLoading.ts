export type AssetPriorityTier =
  | "hero/eager"
  | "nearby/idle-prefetch"
  | "below-fold/lazy"
  | "heavy-story/on-viewport";

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
