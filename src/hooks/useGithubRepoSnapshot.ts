import { useEffect, useState } from "react";
import type { GithubRepoSnapshot } from "@/data/marketing";
import { getGithubRepoSnapshot, githubFallbackSnapshot } from "@/lib/github";

interface GithubRepoSnapshotState {
  snapshot: GithubRepoSnapshot;
  status: "loading" | "ready" | "error";
}

export const useGithubRepoSnapshot = (): GithubRepoSnapshotState => {
  const [snapshot, setSnapshot] = useState<GithubRepoSnapshot>(githubFallbackSnapshot);
  const [status, setStatus] = useState<GithubRepoSnapshotState["status"]>("loading");

  useEffect(() => {
    let active = true;

    void getGithubRepoSnapshot()
      .then((nextSnapshot) => {
        if (!active) {
          return;
        }

        setSnapshot(nextSnapshot);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  return { snapshot, status };
};
