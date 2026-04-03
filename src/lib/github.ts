import type { GithubRepoSnapshot } from "@/data/marketing";

export const GITHUB_SNAPSHOT_ENDPOINT = "/.netlify/functions/github-repo";

export const githubFallbackSnapshot: GithubRepoSnapshot = {
  fetchedAt: "2026-04-03T16:23:49Z",
  fullName: "sdevil7th/OpenStudio",
  repositoryUrl: "https://github.com/sdevil7th/OpenStudio",
  ownerLogin: "sdevil7th",
  ownerProfileUrl: "https://github.com/sdevil7th",
  ownerAvatarUrl: "https://avatars.githubusercontent.com/u/44551979?v=4",
  description: "DAW and Jam Station for the new era",
  docsUrl: "https://github.com/sdevil7th/OpenStudio/tree/main/docs",
  defaultBranch: "main",
  license: "AGPL-3.0",
  createdAt: "2026-01-23T23:46:39Z",
  updatedAt: "2026-04-03T16:23:49Z",
  pushedAt: "2026-04-03T16:23:45Z",
  primaryLanguage: "C++",
  languages: [
    { name: "C++", bytes: 2054762, percent: 48.1 },
    { name: "TypeScript", bytes: 2029511, percent: 47.5 },
    { name: "PowerShell", bytes: 65090, percent: 1.5 },
    { name: "Python", bytes: 50558, percent: 1.2 },
  ],
  contributors: [
    {
      login: "sdevil7th",
      avatarUrl: "https://avatars.githubusercontent.com/u/44551979?v=4",
      profileUrl: "https://github.com/sdevil7th",
      contributions: 16,
    },
  ],
  latestRelease: null,
  hasPublishedReleases: false,
  stats: {
    stars: 0,
    forks: 0,
    openIssues: 0,
    watchers: 0,
    commitCount: 16,
    contributorCount: 1,
  },
};

let snapshotRequest: Promise<GithubRepoSnapshot> | null = null;

const normalizeGithubSnapshot = (snapshot: GithubRepoSnapshot): GithubRepoSnapshot => ({
  ...snapshot,
  languages: snapshot.languages ?? githubFallbackSnapshot.languages,
  contributors: snapshot.contributors ?? githubFallbackSnapshot.contributors,
});

export const getGithubRepoSnapshot = async () => {
  if (!snapshotRequest) {
    snapshotRequest = fetch(GITHUB_SNAPSHOT_ENDPOINT, {
      headers: {
        Accept: "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`GitHub snapshot request failed with status ${response.status}`);
        }

        return (await response.json()) as GithubRepoSnapshot;
      })
      .then(normalizeGithubSnapshot)
      .catch((error) => {
        snapshotRequest = null;
        throw error;
      });
  }

  return snapshotRequest;
};

export const formatGithubDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export const formatGithubNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

export const formatLanguageMix = (snapshot: GithubRepoSnapshot, count = 3) =>
  snapshot.languages
    .slice(0, count)
    .map((language) => `${language.name} ${language.percent}%`)
    .join("  |  ");
