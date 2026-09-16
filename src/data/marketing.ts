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

export type {
  GithubRepoStats,
  GithubLanguageShare,
  GithubContributorSummary,
  GithubReleaseAssetSummary,
  GithubReleaseSummary,
  GithubRepoSnapshot,
} from "../../shared/github-snapshot";
