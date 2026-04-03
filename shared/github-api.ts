export type GithubPlatform = "windows" | "macos";

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

interface GithubRepoResponse {
  full_name: string;
  html_url: string;
  description: string | null;
  owner: {
    login: string;
    html_url: string;
    avatar_url: string;
  };
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count?: number;
  watchers_count: number;
  language: string | null;
  license?: {
    spdx_id: string | null;
    name: string | null;
  } | null;
}

interface GithubContributorResponse {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

interface GithubReleaseResponse {
  id: number;
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string | null;
  draft: boolean;
  prerelease: boolean;
  assets: Array<{
    name: string;
    size: number;
    browser_download_url: string;
  }>;
}

export const GITHUB_REPO_OWNER = "sdevil7th";
export const GITHUB_REPO_NAME = "OpenStudio";
export const GITHUB_REPOSITORY_URL = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`;
export const GITHUB_DOCS_URL = `${GITHUB_REPOSITORY_URL}/tree/main/docs`;
export const GITHUB_RELEASES_URL = `${GITHUB_REPOSITORY_URL}/releases`;
export const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`;

const USER_AGENT = "OpenStudioWebsite";

const createGithubHeaders = (token?: string) => {
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
  });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};

const fetchGithubJson = async <T>(url: string, token?: string) => {
  const response = await fetch(url, {
    headers: createGithubHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed for ${url} with status ${response.status}`);
  }

  return {
    data: (await response.json()) as T,
    headers: response.headers,
  };
};

const parseCommitCount = async (token?: string) => {
  const response = await fetch(`${GITHUB_API_BASE}/commits?per_page=1`, {
    headers: createGithubHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`GitHub commit request failed with status ${response.status}`);
  }

  const linkHeader = response.headers.get("link");

  if (linkHeader) {
    const lastPageMatch = linkHeader.match(/[?&]page=(\d+)>; rel="last"/);

    if (lastPageMatch) {
      return Number(lastPageMatch[1]);
    }
  }

  const commits = (await response.json()) as unknown[];
  return commits.length;
};

const normalizeLanguages = (languages: Record<string, number>) => {
  const total = Object.values(languages).reduce((sum, value) => sum + value, 0);

  return Object.entries(languages)
    .sort((left, right) => right[1] - left[1])
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: total > 0 ? Number(((bytes / total) * 100).toFixed(1)) : 0,
    }));
};

const normalizeLatestRelease = (releases: GithubReleaseResponse[]): GithubReleaseSummary | null => {
  const release = releases.find((entry) => !entry.draft && Boolean(entry.published_at));

  if (!release || !release.published_at) {
    return null;
  }

  return {
    id: release.id,
    tagName: release.tag_name,
    name: release.name ?? release.tag_name,
    htmlUrl: release.html_url,
    publishedAt: release.published_at,
    isPrerelease: release.prerelease,
    assetCount: release.assets.length,
    assets: release.assets.map((asset) => ({
      name: asset.name,
      size: asset.size,
      downloadUrl: asset.browser_download_url,
    })),
  };
};

const normalizeRelease = (release: GithubReleaseResponse): GithubReleaseSummary | null => {
  if (!release.published_at || release.draft) {
    return null;
  }

  return {
    id: release.id,
    tagName: release.tag_name,
    name: release.name ?? release.tag_name,
    htmlUrl: release.html_url,
    publishedAt: release.published_at,
    isPrerelease: release.prerelease,
    assetCount: release.assets.length,
    assets: release.assets.map((asset) => ({
      name: asset.name,
      size: asset.size,
      downloadUrl: asset.browser_download_url,
    })),
  };
};

const scoreReleaseAsset = (assetName: string, platform: GithubPlatform) => {
  const name = assetName.toLowerCase();
  let score = 0;

  if (platform === "windows") {
    if (name.endsWith(".exe")) score += 8;
    if (name.endsWith(".msi")) score += 6;
    if (name.includes("setup")) score += 4;
    if (name.includes("windows") || name.includes("win")) score += 4;
    if (name.includes("x64") || name.includes("amd64")) score += 2;
  }

  if (platform === "macos") {
    if (name.endsWith(".dmg")) score += 8;
    if (name.endsWith(".pkg")) score += 6;
    if (name.includes("macos") || name.includes("mac") || name.includes("osx")) score += 4;
    if (name.includes("universal") || name.includes("arm64") || name.includes("apple")) score += 2;
  }

  return score;
};

export const resolveLatestReleaseAssetUrl = (release: GithubReleaseSummary | null, platform: GithubPlatform) => {
  if (!release) {
    return null;
  }

  const candidates = release.assets
    .map((asset) => ({
      asset,
      score: scoreReleaseAsset(asset.name, platform),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  return candidates[0]?.asset.downloadUrl ?? null;
};

export const fetchLatestGithubRelease = async (token?: string): Promise<GithubReleaseSummary | null> => {
  const response = await fetch(`${GITHUB_API_BASE}/releases/latest`, {
    headers: createGithubHeaders(token),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub latest release request failed with status ${response.status}`);
  }

  return normalizeRelease((await response.json()) as GithubReleaseResponse);
};

export const fetchGithubRepoSnapshot = async (token?: string): Promise<GithubRepoSnapshot> => {
  const [repoResult, contributorsResult, languagesResult, releasesResult, commitCount] = await Promise.all([
    fetchGithubJson<GithubRepoResponse>(GITHUB_API_BASE, token),
    fetchGithubJson<GithubContributorResponse[]>(`${GITHUB_API_BASE}/contributors?per_page=8`, token),
    fetchGithubJson<Record<string, number>>(`${GITHUB_API_BASE}/languages`, token),
    fetchGithubJson<GithubReleaseResponse[]>(`${GITHUB_API_BASE}/releases?per_page=8`, token),
    parseCommitCount(token),
  ]);

  const latestRelease = normalizeLatestRelease(releasesResult.data);
  const contributors = contributorsResult.data.map((contributor) => ({
    login: contributor.login,
    avatarUrl: contributor.avatar_url,
    profileUrl: contributor.html_url,
    contributions: contributor.contributions,
  }));

  return {
    fetchedAt: new Date().toISOString(),
    fullName: repoResult.data.full_name,
    repositoryUrl: repoResult.data.html_url,
    ownerLogin: repoResult.data.owner.login,
    ownerProfileUrl: repoResult.data.owner.html_url,
    ownerAvatarUrl: repoResult.data.owner.avatar_url,
    description: repoResult.data.description ?? "",
    docsUrl: GITHUB_DOCS_URL,
    defaultBranch: repoResult.data.default_branch,
    license: repoResult.data.license?.spdx_id ?? repoResult.data.license?.name ?? "No license",
    createdAt: repoResult.data.created_at,
    updatedAt: repoResult.data.updated_at,
    pushedAt: repoResult.data.pushed_at,
    primaryLanguage: repoResult.data.language ?? "Unknown",
    languages: normalizeLanguages(languagesResult.data),
    contributors,
    latestRelease,
    hasPublishedReleases: latestRelease !== null,
    stats: {
      stars: repoResult.data.stargazers_count,
      forks: repoResult.data.forks_count,
      openIssues: repoResult.data.open_issues_count,
      watchers: repoResult.data.subscribers_count ?? repoResult.data.watchers_count,
      commitCount,
      contributorCount: contributors.length,
    },
  };
};
