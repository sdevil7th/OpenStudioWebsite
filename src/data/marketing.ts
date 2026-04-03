import type { ScreenshotAsset } from "@/data/screenshots";

export interface SeoMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  jsonLd?: object | object[];
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
  creatorSite?: string;
  creatorEmail?: string;
  creatorGithub?: string;
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

export interface FeatureChapter {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  screenshot: ScreenshotAsset;
  accent?: AccentTone;
  standout?: string;
  rail: string[];
  items: FeatureChapterItem[];
}
