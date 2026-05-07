export interface DesignMediaAsset {
  id: string;
  src: string;
  alt: string;
  ratio?: number;
  objectPosition?: string;
}

export const designMedia = {
  homeHeroTimeline: {
    id: "homeHeroTimeline",
    src: "/assets/openstudio/design-reference/home-hero-timeline.webp",
    alt: "OpenStudio interface with detailed multitrack timeline and pitch editor.",
    ratio: 16 / 9,
  },
  homeStoryServer: {
    id: "homeStoryServer",
    src: "/assets/openstudio/design-reference/home-story-server.webp",
    alt: "High-end server hardware with glowing status lights in a dark room.",
    ratio: 1,
  },
  homeUspStems: {
    id: "homeUspStems",
    src: "/assets/openstudio/design-reference/home-usp-stems.webp",
    alt: "Abstract sound-wave visualization splitting into vibrant neon colors.",
    ratio: 16 / 10,
  },
  homeUspMixer: {
    id: "homeUspMixer",
    src: "/assets/openstudio/design-reference/home-usp-mixer.webp",
    alt: "Professional studio mixer with illuminated controls.",
    ratio: 16 / 10,
  },
  homeUspCode: {
    id: "homeUspCode",
    src: "/assets/openstudio/design-reference/home-usp-code.webp",
    alt: "Syntax highlighted code in purple and green tones.",
    ratio: 16 / 10,
  },
  featuresArrangement: {
    id: "featuresArrangement",
    src: "/assets/openstudio/design-reference/features-arrangement.webp",
    alt: "OpenStudio arrangement overview screenshot.",
    ratio: 16 / 10,
  },
  featuresPianoRoll: {
    id: "featuresPianoRoll",
    src: "/assets/openstudio/design-reference/features-piano-roll.webp",
    alt: "OpenStudio piano roll editor screenshot.",
    ratio: 16 / 10,
  },
  featuresChannelStrip: {
    id: "featuresChannelStrip",
    src: "/assets/openstudio/design-reference/features-channel-strip.webp",
    alt: "OpenStudio mixer channel strip screenshot.",
    ratio: 16 / 10,
  },
  featuresPluginHosting: {
    id: "featuresPluginHosting",
    src: "/assets/openstudio/design-reference/features-plugin-hosting.webp",
    alt: "OpenStudio plugin hosting screenshot.",
    ratio: 16 / 10,
  },
  stemRenderDialog: {
    id: "stemRenderDialog",
    src: "/assets/openstudio/design-reference/stem-render-dialog.webp",
    alt: "OpenStudio render dialog screenshot.",
    ratio: 16 / 11,
  },
  downloadWorkspace: {
    id: "downloadWorkspace",
    src: "/assets/openstudio/design-reference/download-cta-workspace.webp",
    alt: "Producer workspace with neon studio lighting and a large DAW display.",
    ratio: 16 / 8,
  },
  githubCodeLiquid: {
    id: "githubCodeLiquid",
    src: "/assets/openstudio/design-reference/github-code-liquid.webp",
    alt: "Cinematic visualization of code flowing in neon purple and green.",
    ratio: 1,
  },
  githubContributor1: {
    id: "githubContributor1",
    src: "/assets/openstudio/design-reference/github-contributor-1.webp",
    alt: "Contributor portrait.",
    ratio: 1,
  },
  githubContributor2: {
    id: "githubContributor2",
    src: "/assets/openstudio/design-reference/github-contributor-2.webp",
    alt: "Contributor portrait.",
    ratio: 1,
  },
  githubContributor3: {
    id: "githubContributor3",
    src: "/assets/openstudio/design-reference/github-contributor-3.webp",
    alt: "Contributor portrait.",
    ratio: 1,
  },
  githubContributor4: {
    id: "githubContributor4",
    src: "/assets/openstudio/design-reference/github-contributor-4.webp",
    alt: "Contributor portrait.",
    ratio: 1,
  },
  githubContributor5: {
    id: "githubContributor5",
    src: "/assets/openstudio/design-reference/github-contributor-5.webp",
    alt: "Contributor portrait.",
    ratio: 1,
  },
  releasesRoadmapNetwork: {
    id: "releasesRoadmapNetwork",
    src: "/assets/openstudio/design-reference/releases-roadmap-network.webp",
    alt: "Abstract glowing network nodes in a dark violet space.",
    ratio: 16 / 9,
  },
  releasesStableSpotlight: {
    id: "releasesStableSpotlight",
    src: "/assets/openstudio/design-reference/releases-stable-spotlight.webp",
    alt: "Studio equipment with purple lighting and mixing console details.",
    ratio: 1,
  },
  contactPortrait: {
    id: "contactPortrait",
    src: "/assets/openstudio/design-reference/contact-portrait.webp",
    alt: "Portrait of a creative developer with subtle neon reflections.",
    ratio: 1,
  },
  carbonFibreTexture: {
    id: "carbonFibreTexture",
    src: "/assets/openstudio/design-reference/carbon-fibre.webp",
    alt: "Carbon fibre texture.",
  },
} satisfies Record<string, DesignMediaAsset>;
