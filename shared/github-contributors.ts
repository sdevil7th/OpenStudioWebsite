import type { GithubContributorSummary } from "./github-snapshot";

interface ContributorSummary {
  count: number;
  contributors: GithubContributorSummary[];
}

const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid GitHub contributor data");
  return value as Record<string, unknown>;
};

/** GitHub's public repository summary includes co-authors, unlike REST /contributors. */
export const parseContributorSummary = (value: unknown): ContributorSummary => {
  const summary = record(record(value).contributors);
  if (!Number.isSafeInteger(summary.contributorCount) || Number(summary.contributorCount) < 0 || !Array.isArray(summary.contributors)) {
    throw new Error("Invalid GitHub contributor summary");
  }
  const contributors = summary.contributors.map((value): GithubContributorSummary => {
    const entry = record(value);
    if (typeof entry.login !== "string" || !/^[\w-]+(?:\[bot\])?$/.test(entry.login) ||
        entry.profilePath !== `/${entry.login}` || typeof entry.avatarUrl !== "string") {
      throw new Error("Invalid GitHub contributor identity");
    }
    const avatar = new URL(entry.avatarUrl);
    if (avatar.protocol !== "https:" || avatar.hostname !== "avatars.githubusercontent.com" || avatar.username || avatar.password || avatar.port) {
      throw new Error("Invalid GitHub contributor avatar");
    }
    return {
      login: entry.login,
      profileUrl: `https://github.com${entry.profilePath}`,
      avatarUrl: entry.avatarUrl,
    };
  });
  const count = Number(summary.contributorCount);
  if (contributors.length > count || new Set(contributors.map(entry => entry.login.toLowerCase())).size !== contributors.length) {
    throw new Error("Inconsistent GitHub contributor summary");
  }
  return { count, contributors };
};

export const fetchGithubContributors = async (repositoryUrl: string): Promise<ContributorSummary> => {
  // This is the same public summary used by GitHub's repository page. Never send
  // an API token to this web endpoint. Validate it before replacing cached data.
  const response = await fetch(`${repositoryUrl}/_sidebar`, {
    headers: { Accept: "application/json", "User-Agent": "OpenStudioWebsite" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`GitHub contributor summary failed with status ${response.status}`);
  return parseContributorSummary(await response.json());
};
