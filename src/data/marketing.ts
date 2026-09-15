export interface SeoMeta {
  title: string;
  description: string;
  path: string;
  lastModified?: string;
  image?: string;
  imageAlt?: string;
  jsonLd?: object | object[];
  ogType?: "website" | "article";
}

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

export interface ProjectEmailMap {
  contact: string;
  support: string;
  admin: string;
  personal: string;
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
  downloadCount: number;
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
  body?: string;
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
  releases?: GithubReleaseSummary[];
  releaseCount?: number;
  stats: GithubRepoStats;
}
