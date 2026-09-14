import { useEffect, useMemo, useState } from "react";
import { DOWNLOAD_PATHS } from "@/constants/site";
import type { GithubReleaseSummary } from "@/data/marketing";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { stripVersionPrefix } from "./format";
import { PLATFORMS, PLATFORM_ORDER, type PlatformId } from "./usePlatform";

export interface PlatformArtifact {
  /** Stable redirect endpoint — the public contract shipped app builds also use. */
  href: string;
  fileName: string | null;
  size: number | null;
  sha256: string | null;
  /** Direct GitHub asset URL when known; the stable redirect is still preferred for buttons. */
  directUrl: string | null;
}

export interface ReleaseInfo {
  /** "0.1.01" — no leading v. */
  version: string;
  tagName: string;
  publishedAt: string | null;
  notesUrl: string | null;
  platforms: Record<PlatformId, PlatformArtifact>;
  /** Where the numbers came from, so pages can hedge when only the fallback is available. */
  source: "manifest" | "github" | "fallback";
}

/** Shape of `/releases/latest.json` as validated by scripts/release-publish-inputs.mjs. */
interface ReleaseManifest {
  version?: unknown;
  publishedAt?: unknown;
  fullReleaseNotesUrl?: unknown;
  platforms?: Partial<
    Record<PlatformId, { url?: unknown; sha256?: unknown; size?: unknown; fileName?: unknown }>
  >;
}

const emptyArtifact = (id: PlatformId): PlatformArtifact => ({
  href: PLATFORMS[id].href,
  fileName: null,
  size: null,
  sha256: null,
  directUrl: null,
});

const scoreAsset = (name: string, platform: PlatformId) => {
  const lower = name.toLowerCase();
  if (lower.endsWith(".json") || lower.endsWith(".xml") || lower.endsWith(".txt") || lower.includes("source")) {
    return 0;
  }

  if (platform === "windows") {
    return (lower.endsWith(".exe") ? 8 : lower.endsWith(".msi") ? 6 : 0) + (lower.includes("setup") ? 2 : 0);
  }

  if (platform === "macos") {
    return (lower.endsWith(".dmg") ? 8 : lower.endsWith(".pkg") ? 6 : 0) + (lower.includes("mac") ? 2 : 0);
  }

  return (lower.endsWith(".appimage") ? 8 : lower.endsWith(".deb") ? 6 : lower.endsWith(".rpm") ? 5 : 0) + (lower.includes("linux") ? 2 : 0);
};

const fromGithubRelease = (release: GithubReleaseSummary, source: ReleaseInfo["source"]): ReleaseInfo => {
  const platforms = Object.fromEntries(
    PLATFORM_ORDER.map((id) => {
      const best = release.assets
        .map((asset) => ({ asset, score: scoreAsset(asset.name, id) }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score)[0]?.asset;

      return [
        id,
        {
          ...emptyArtifact(id),
          fileName: best?.name ?? null,
          size: best?.size ?? null,
          directUrl: best?.downloadUrl ?? null,
        },
      ];
    }),
  ) as Record<PlatformId, PlatformArtifact>;

  return {
    version: stripVersionPrefix(release.tagName),
    tagName: release.tagName,
    publishedAt: release.publishedAt,
    notesUrl: release.htmlUrl,
    platforms,
    source,
  };
};

const fromManifest = (manifest: ReleaseManifest): ReleaseInfo | null => {
  if (typeof manifest.version !== "string" || !manifest.platforms) {
    return null;
  }

  const platforms = Object.fromEntries(
    PLATFORM_ORDER.map((id) => {
      const entry = manifest.platforms?.[id];
      const size = Number(entry?.size);

      return [
        id,
        {
          ...emptyArtifact(id),
          fileName: typeof entry?.fileName === "string" ? entry.fileName : null,
          size: Number.isFinite(size) && size > 0 ? size : null,
          sha256: typeof entry?.sha256 === "string" ? entry.sha256 : null,
          directUrl: typeof entry?.url === "string" ? entry.url : null,
        },
      ];
    }),
  ) as Record<PlatformId, PlatformArtifact>;

  return {
    version: stripVersionPrefix(manifest.version),
    tagName: `v${stripVersionPrefix(manifest.version)}`,
    publishedAt: typeof manifest.publishedAt === "string" ? manifest.publishedAt : null,
    notesUrl: typeof manifest.fullReleaseNotesUrl === "string" ? manifest.fullReleaseNotesUrl : null,
    platforms,
    source: "manifest",
  };
};

let manifestRequest: Promise<ReleaseInfo | null> | null = null;

const loadManifest = () => {
  if (!manifestRequest) {
    manifestRequest = fetch(DOWNLOAD_PATHS.releaseMetadataLatest, { headers: { Accept: "application/json" } })
      .then(async (response) => {
        // The SPA fallback answers unknown paths with index.html and a 200, so
        // the content type is the only reliable signal that a manifest exists.
        if (!response.ok || !(response.headers.get("content-type") ?? "").includes("json")) {
          return null;
        }

        return fromManifest((await response.json()) as ReleaseManifest);
      })
      .catch(() => null);
  }

  return manifestRequest;
};

/**
 * Current desktop release: the published manifest when the site has one,
 * otherwise the newest GitHub release (live snapshot on the deployed site, the
 * refreshed fallback snapshot on localhost).
 */
export const useReleaseInfo = () => {
  const { snapshot, status } = useGithubRepoSnapshot();
  const [manifest, setManifest] = useState<ReleaseInfo | null>(null);

  useEffect(() => {
    let active = true;
    void loadManifest().then((info) => {
      if (active && info) {
        setManifest(info);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => {
    const github = snapshot.latestRelease
      ? fromGithubRelease(snapshot.latestRelease, status === "ready" ? "github" : "fallback")
      : null;

    if (!manifest) {
      return github;
    }

    if (!github || github.version !== manifest.version) {
      return manifest;
    }

    // GitHub knows the asset URLs and sizes even when the manifest omits them.
    return {
      ...manifest,
      notesUrl: manifest.notesUrl ?? github.notesUrl,
      platforms: Object.fromEntries(
        PLATFORM_ORDER.map((id) => [
          id,
          {
            ...manifest.platforms[id],
            directUrl: manifest.platforms[id].directUrl ?? github.platforms[id].directUrl,
            fileName: manifest.platforms[id].fileName ?? github.platforms[id].fileName,
            size: manifest.platforms[id].size ?? github.platforms[id].size,
          },
        ]),
      ) as Record<PlatformId, PlatformArtifact>,
    };
  }, [manifest, snapshot.latestRelease, status]);
};
