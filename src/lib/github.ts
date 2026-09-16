import type { GithubRepoSnapshot } from "@/data/marketing";
import { parseGithubRepoSnapshot } from "../../shared/github-snapshot";

export const GITHUB_SNAPSHOT_ENDPOINT = "/.netlify/functions/github-repo";

import { generatedGithubSnapshot } from "@/data/generatedGithubSnapshot";

// GitHub-derived build snapshot keeps prerendering and offline rendering honest.
export const githubFallbackSnapshot = generatedGithubSnapshot;

let snapshotRequest: Promise<GithubRepoSnapshot> | null = null;

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

        return parseGithubRepoSnapshot(await response.json(), githubFallbackSnapshot);
      })
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
