import type { GithubRepoSnapshot } from "@/data/marketing";
import { parseGithubRepoSnapshot } from "../../shared/github-snapshot";

export const GITHUB_SNAPSHOT_ENDPOINT = "/github/repository.json";

import { generatedGithubSnapshot } from "@/data/generatedGithubSnapshot";

// GitHub-derived build snapshot keeps prerendering and offline rendering honest.
export const githubFallbackSnapshot = generatedGithubSnapshot;

let retryAfter = 0;
let failures = 0;
let snapshotRequest: Promise<GithubRepoSnapshot> | null = null;

export const getGithubRepoSnapshot = async () => {
  if (snapshotRequest && retryAfter && Date.now() >= retryAfter) snapshotRequest = null;
  if (!snapshotRequest) {
    // Clear the expired cooldown before starting, so concurrent callers share this retry.
    retryAfter = 0;
    snapshotRequest = fetch(GITHUB_SNAPSHOT_ENDPOINT, {
      signal: AbortSignal.timeout(8000),
      headers: {
        Accept: "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`GitHub snapshot request failed with status ${response.status}`);
        }

        const snapshot = parseGithubRepoSnapshot(await response.json(), githubFallbackSnapshot);
        failures = 0;
        retryAfter = 0;
        return snapshot;
      })
      .catch((error) => {
        retryAfter = Date.now() + Math.min(300_000, 30_000 * 2 ** Math.min(failures++, 4));
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
