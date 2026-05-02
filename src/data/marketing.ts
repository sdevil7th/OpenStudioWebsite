import type { ScreenshotAsset } from "@/data/screenshots";

export interface SeoMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  jsonLd?: object | object[];
  keywords?: string[];
  ogType?: "website" | "article";
}

export interface ActionLink {
  label: string;
  to: string;
}

export interface StoryStep {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  screenshot: ScreenshotAsset;
}

export type AccentTone = "lavender" | "emerald" | "amber" | "frost";

export interface ExternalLinkMap {
  repository?: string;
  documentation?: string;
  privacy?: string;
  security?: string;
  terms?: string;
  changelog?: string;
  contactSite?: string;
  contactEmail?: string;
  maintainerGithub?: string;
}

export interface ContactProfile {
  name: string;
  role: string;
  email: string;
  website: string;
  heroTitle: string;
  summary: string;
  location: string;
}

export interface ReleaseEntry {
  id: string;
  label: string;
  version: string;
  title: string;
  summary: string;
  status: string;
  dateLabel: string;
  bullets: string[];
  accent?: AccentTone;
}

export interface GithubHighlight {
  eyebrow: string;
  title: string;
  description: string;
  metric?: string;
  accent?: AccentTone;
}

export interface GithubRepoStats {
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  commitCount: number;
  contributorCount: number;
}

export interface GithubLanguageShare {
  name: string;
  bytes: number;
  percent: number;
}

export interface GithubContributorSummary {
  login: string;
  avatarUrl: string;
  profileUrl: string;
  contributions: number;
}

export interface GithubReleaseAssetSummary {
  name: string;
  size: number;
  downloadUrl: string;
}

export interface GithubReleaseSummary {
  id: number;
  tagName: string;
  name: string;
  htmlUrl: string;
  publishedAt: string;
  isPrerelease: boolean;
  assetCount: number;
  assets: GithubReleaseAssetSummary[];
}

export interface GithubRepoSnapshot {
  fetchedAt: string;
  fullName: string;
  repositoryUrl: string;
  ownerLogin: string;
  ownerProfileUrl: string;
  ownerAvatarUrl: string;
  description: string;
  docsUrl: string;
  defaultBranch: string;
  license: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  primaryLanguage: string;
  languages: GithubLanguageShare[];
  contributors: GithubContributorSummary[];
  latestRelease: GithubReleaseSummary | null;
  hasPublishedReleases: boolean;
  stats: GithubRepoStats;
}

export interface ContributorCard {
  name: string;
  role: string;
  bio: string;
  badge: string;
  accent?: AccentTone;
  href?: string;
}

export interface FeatureChapterItem {
  title: string;
  description: string;
  note?: string;
}

export interface FeatureStageMedia {
  asset: ScreenshotAsset;
  label?: string;
  caption?: string;
  tone?: AccentTone;
  sceneRole?: "hero" | "motion" | "detail" | "matte";
  mediaType?: "image" | "animated-webp" | "video";
}

export interface FeatureSceneBase extends FeatureStageMedia {
  focalPosition?: string;
}

export type FeatureSceneFragmentLayout =
  | "inset-left"
  | "inset-right"
  | "bottom-strip"
  | "top-strip"
  | "top-crest";

export interface FeatureSceneFragment extends FeatureStageMedia {
  id: string;
  layout: FeatureSceneFragmentLayout;
  blend?: "normal" | "screen";
  softness?: "soft" | "crisp";
}

export interface FeatureStoryCallout {
  eyebrow: string;
  title: string;
  description: string;
  metric?: string;
  tone?: AccentTone;
}

export interface FeatureChapterStory {
  title: string;
  description: string;
  rail: string[];
  standout?: string;
}

export interface FeatureChapterDetails {
  callouts: FeatureStoryCallout[];
  items: FeatureChapterItem[];
}

export interface FeatureStageBurnOrigin {
  x: number;
  y: number;
}

export interface FeatureBurnVector {
  x: number;
  y: number;
}

export interface FeatureTransitionProfile {
  entryDirection?: "left" | "right" | "plunge";
  depthIntensity?: number;
  burnSeed?: number;
  hold?: number;
  burn?: number;
  settle?: number;
  collapseStart?: number;
  voidPeak?: number;
  arrivalStart?: number;
  settleEnd?: number;
  edgeAngle?: number;
  edgeRoughness?: number;
  charWidth?: number;
  emberWidth?: number;
  smokeStrength?: number;
  spreadDepth?: number;
  shellIgnitionDelay?: number;
  degradationDensity?: number;
  tearAmount?: number;
  particleDrift?: number;
  voidShape?: "orb" | "eclipse" | "shard" | "veil";
  voidScale?: number;
  remnantStrength?: number;
  contourExtraction?: number;
  bridgeHold?: number;
  arrivalStyle?: "glide" | "lift" | "bloom";
  pointerDepthProfile?: "soft" | "stage" | "deep";
  collapseMaskSrc?: string;
  remnantMaskSrc?: string;
  voidBridgeSrc?: string;
  arrivalMatteSrc?: string;
  curatedMatteSrc?: string;
  authoredBridge?: {
    collapseFieldSrc: string;
    remnantEtchedSrc: string;
    voidCoreSrc: string;
    voidEdgeSrc: string;
    arrivalMatteSrc: string;
    coreScale?: number;
    edgeScale?: number;
    arrivalDelay?: number;
    arrivalComposition?: "midi-tableau" | "mixer-tableau" | "engine-tableau" | "automation-tableau";
    pointerDepthStrength?: number;
  };
  fragmentLag?: number;
}

export interface FeatureChapter {
  id: string;
  label: string;
  eyebrow: string;
  screenshot: ScreenshotAsset;
  accent?: AccentTone;
  sceneBase: FeatureSceneBase;
  sceneFragments: FeatureSceneFragment[];
  storyPanel: FeatureChapterStory;
  details: FeatureChapterDetails;
  transitionProfile?: FeatureTransitionProfile;
  scrollSpan?: number;
  density?: number;
  numeral?: string;
  introTitle?: string;
  introTagline?: string;
}
