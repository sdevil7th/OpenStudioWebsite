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
  /** Release notes body (GitHub-flavoured markdown). Absent on older cached snapshots. */
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
  /** Every published (non-draft) release, newest first, including runtime tags. */
  releases?: GithubReleaseSummary[];
  /** Count of published desktop app releases (tags starting with `v`). */
  releaseCount?: number;
  stats: GithubRepoStats;
}

const record = (value: unknown, field: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid GitHub snapshot: ${field}`);
  return value as Record<string, unknown>;
};

const text = (value: unknown, field: string): string => {
  if (typeof value !== "string") throw new Error(`Invalid GitHub snapshot: ${field}`);
  return value;
};

const count = (value: unknown, field: string): number => {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Invalid GitHub snapshot: ${field}`);
  }
  return value;
};

const flag = (value: unknown, field: string): boolean => {
  if (typeof value !== "boolean") throw new Error(`Invalid GitHub snapshot: ${field}`);
  return value;
};

const date = (value: unknown, field: string): string => {
  const result = text(value, field);
  if (!Number.isFinite(Date.parse(result))) throw new Error(`Invalid GitHub snapshot: ${field}`);
  return result;
};

const url = (value: unknown, field: string, avatar = false): string => {
  const result = text(value, field);
  const parsed = new URL(result);
  const hosts = avatar ? ["github.com", "avatars.githubusercontent.com"] : ["github.com"];
  if (parsed.protocol !== "https:" || !hosts.includes(parsed.hostname) || parsed.username || parsed.password || parsed.port) {
    throw new Error(`Invalid GitHub snapshot: ${field}`);
  }
  return result;
};

const list = <T>(value: unknown, field: string, parse: (entry: unknown) => T): T[] => {
  if (!Array.isArray(value)) throw new Error(`Invalid GitHub snapshot: ${field}`);
  return value.map(parse);
};

const asset = (value: unknown): GithubReleaseAssetSummary => {
  const entry = record(value, "asset");
  return {
    name: text(entry.name, "asset.name"),
    size: count(entry.size, "asset.size"),
    downloadUrl: url(entry.downloadUrl, "asset.downloadUrl"),
    downloadCount: count(entry.downloadCount, "asset.downloadCount"),
  };
};

const release = (value: unknown): GithubReleaseSummary => {
  const entry = record(value, "release");
  return {
    id: count(entry.id, "release.id"),
    tagName: text(entry.tagName, "release.tagName"),
    name: text(entry.name, "release.name"),
    htmlUrl: url(entry.htmlUrl, "release.htmlUrl"),
    publishedAt: date(entry.publishedAt, "release.publishedAt"),
    isPrerelease: flag(entry.isPrerelease, "release.isPrerelease"),
    assetCount: count(entry.assetCount, "release.assetCount"),
    assets: list(entry.assets, "release.assets", asset),
    ...(entry.body === undefined ? {} : { body: text(entry.body, "release.body") }),
  };
};

const language = (value: unknown): GithubLanguageShare => {
  const entry = record(value, "language");
  const percent = entry.percent;
  if (typeof percent !== "number" || !Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new Error("Invalid GitHub snapshot: language.percent");
  }
  return { name: text(entry.name, "language.name"), bytes: count(entry.bytes, "language.bytes"), percent };
};

const contributor = (value: unknown): GithubContributorSummary => {
  const entry = record(value, "contributor");
  return {
    login: text(entry.login, "contributor.login"),
    avatarUrl: url(entry.avatarUrl, "contributor.avatarUrl", true),
    profileUrl: url(entry.profileUrl, "contributor.profileUrl"),
    contributions: count(entry.contributions, "contributor.contributions"),
  };
};

/** Parse untrusted function/cache JSON before it can replace the last valid UI data. */
export const parseGithubRepoSnapshot = (
  value: unknown,
  fallback?: Pick<GithubRepoSnapshot, "languages" | "contributors">,
): GithubRepoSnapshot => {
  const entry = record(value, "root");
  const stats = record(entry.stats, "stats");
  const latestRelease = entry.latestRelease === null ? null : release(entry.latestRelease);
  const hasPublishedReleases = flag(entry.hasPublishedReleases, "hasPublishedReleases");
  if (hasPublishedReleases !== (latestRelease !== null) ||
      (latestRelease && (latestRelease.isPrerelease || !/^v\d/.test(latestRelease.tagName)))) {
    throw new Error("Invalid GitHub snapshot: latest stable desktop release");
  }
  return {
    fetchedAt: date(entry.fetchedAt, "fetchedAt"),
    fullName: text(entry.fullName, "fullName"),
    repositoryUrl: url(entry.repositoryUrl, "repositoryUrl"),
    ownerLogin: text(entry.ownerLogin, "ownerLogin"),
    ownerProfileUrl: url(entry.ownerProfileUrl, "ownerProfileUrl"),
    ownerAvatarUrl: url(entry.ownerAvatarUrl, "ownerAvatarUrl", true),
    description: text(entry.description, "description"),
    docsUrl: url(entry.docsUrl, "docsUrl"),
    defaultBranch: text(entry.defaultBranch, "defaultBranch"),
    license: text(entry.license, "license"),
    createdAt: date(entry.createdAt, "createdAt"),
    updatedAt: date(entry.updatedAt, "updatedAt"),
    pushedAt: date(entry.pushedAt, "pushedAt"),
    primaryLanguage: text(entry.primaryLanguage, "primaryLanguage"),
    // Older cached snapshots omitted these lists; malformed lists still fail.
    languages: list(entry.languages ?? fallback?.languages, "languages", language),
    contributors: list(entry.contributors ?? fallback?.contributors, "contributors", contributor),
    latestRelease,
    hasPublishedReleases,
    ...(entry.releases === undefined ? {} : { releases: list(entry.releases, "releases", release) }),
    ...(entry.releaseCount === undefined ? {} : { releaseCount: count(entry.releaseCount, "releaseCount") }),
    stats: {
      stars: count(stats.stars, "stats.stars"),
      forks: count(stats.forks, "stats.forks"),
      openIssues: count(stats.openIssues, "stats.openIssues"),
      watchers: count(stats.watchers, "stats.watchers"),
      commitCount: count(stats.commitCount, "stats.commitCount"),
      contributorCount: count(stats.contributorCount, "stats.contributorCount"),
    },
  };
};

