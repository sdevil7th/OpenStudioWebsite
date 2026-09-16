import { useEffect, useState } from "react";
import { DOWNLOAD_PATHS } from "@/constants/site";
import type { GithubReleaseSummary } from "@/data/marketing";
import { generatedLatestRelease } from "@/data/generatedLatestRelease";
import { selectReleaseAsset } from "../../shared/release-assets";
import { stripVersionPrefix } from "@/lib/format";
import { PLATFORMS, PLATFORM_ORDER, type PlatformId } from "./usePlatform";

export interface PlatformArtifact {
  /** Stable redirect endpoint — the public contract shipped app builds also use. */
  href: string;
  fileName: string | null;
  size: number | null;
  sha256: string | null;
  /** Direct GitHub asset URL for the exact release shown beside the button. */
  directUrl: string | null;
}

export interface ReleaseInfo {
  /** GitHub tag with its leading v removed. */
  version: string;
  tagName: string;
  publishedAt: string | null;
  notesUrl: string | null;
  platforms: Record<PlatformId, PlatformArtifact>;
  /** Where the numbers came from, so pages can hedge when only the fallback is available. */
  source: "manifest" | "github" | "build";
}

/** Shape of `/releases/latest.json` as validated by scripts/release-publish-inputs.mjs. */
interface ReleaseManifest {
  version?: unknown;
  publishedAt?: unknown;
  fullReleaseNotesUrl?: unknown;
  platforms?: Partial<Record<PlatformId, { url?: unknown; sha256?: unknown; size?: unknown; fileName?: unknown }>>;
}

const emptyArtifact = (id: PlatformId): PlatformArtifact => ({
  href: PLATFORMS[id].href,
  fileName: null,
  size: null,
  sha256: null,
  directUrl: null,
});

export const fromGithubRelease = (release: GithubReleaseSummary, source: ReleaseInfo["source"]): ReleaseInfo => {
  const platforms = Object.fromEntries(
    PLATFORM_ORDER.map((id) => {
      const best = selectReleaseAsset(release.assets, id);

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

export const fromManifest = (value: unknown): ReleaseInfo | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const manifest = value as ReleaseManifest;
  if (
    typeof manifest.version !== "string" ||
    !/^v?\d+(?:\.\d+){1,3}(?:[-+][\w.-]+)?$/.test(manifest.version) ||
    !manifest.platforms ||
    typeof manifest.platforms !== "object" ||
    Array.isArray(manifest.platforms)
  ) {
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
          sha256: typeof entry?.sha256 === "string" && /^[a-f0-9]{64}$/i.test(entry.sha256) ? entry.sha256 : null,
          directUrl: typeof entry?.url === "string" && /^https:\/\//.test(entry.url) ? entry.url : null,
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

const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** Validate the JSON boundary before using network values in links and labels. */
export function parseGithubRelease(value: unknown): GithubReleaseSummary | null {
  if (
    !record(value) ||
    typeof value.id !== "number" ||
    typeof value.tagName !== "string" ||
    !/^v\d/.test(value.tagName) ||
    typeof value.name !== "string" ||
    typeof value.htmlUrl !== "string" ||
    !value.htmlUrl.startsWith("https://github.com/") ||
    typeof value.publishedAt !== "string" ||
    !Number.isFinite(Date.parse(value.publishedAt)) ||
    value.isPrerelease !== false ||
    typeof value.assetCount !== "number" ||
    !Array.isArray(value.assets)
  )
    return null;
  const assets: GithubReleaseSummary["assets"] = [];
  for (const asset of value.assets) {
    if (
      !record(asset) ||
      typeof asset.name !== "string" ||
      typeof asset.size !== "number" ||
      asset.size <= 0 ||
      !Number.isFinite(asset.size) ||
      typeof asset.downloadUrl !== "string" ||
      !asset.downloadUrl.startsWith("https://github.com/") ||
      typeof asset.downloadCount !== "number"
    )
      return null;
    assets.push({
      name: asset.name,
      size: asset.size,
      downloadUrl: asset.downloadUrl,
      downloadCount: asset.downloadCount,
    });
  }
  return {
    id: value.id,
    tagName: value.tagName,
    name: value.name,
    htmlUrl: value.htmlUrl,
    publishedAt: value.publishedAt,
    isPrerelease: false,
    assetCount: value.assetCount,
    assets,
  };
}

/** Manifest checksums are usable only for the same GitHub version and the same artifact. */
export function withManifestChecksums(github: ReleaseInfo, manifest: ReleaseInfo | null): ReleaseInfo {
  if (!manifest || manifest.version !== github.version) return github;
  return {
    ...github,
    platforms: Object.fromEntries(
      PLATFORM_ORDER.map((id) => {
        const asset = github.platforms[id];
        const published = manifest.platforms[id];
        const sameAsset =
          asset.directUrl === published.directUrl &&
          asset.fileName === published.fileName &&
          asset.size === published.size;
        return [id, { ...asset, sha256: sameAsset ? published.sha256 : null }];
      }),
    ) as Record<PlatformId, PlatformArtifact>,
  };
}

const buildRelease = fromGithubRelease(generatedLatestRelease, "build");
let releaseRequest: Promise<ReleaseInfo> | null = null;
const readJson = async (url: string) => {
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
  if (!response.ok || !(response.headers.get("content-type") ?? "").includes("json"))
    throw new Error("Release data unavailable");
  return response.json() as Promise<unknown>;
};

export const loadReleaseInfo = () => {
  if (!releaseRequest) {
    releaseRequest = Promise.all([
      readJson("/.netlify/functions/github-release")
        .then(parseGithubRelease)
        .catch(() => null),
      readJson(DOWNLOAD_PATHS.releaseMetadataLatest)
        .then(fromManifest)
        .catch(() => null),
    ]).then(([live, manifest]) => {
      // The offline value was fetched from GitHub during this build, never maintained by hand.
      if (!live) releaseRequest = null;
      return withManifestChecksums(live ? fromGithubRelease(live, "github") : buildRelease, manifest);
    });
  }
  return releaseRequest;
};

export const useReleaseInfo = () => {
  const [release, setRelease] = useState<ReleaseInfo>(buildRelease);
  useEffect(() => {
    let active = true;
    void loadReleaseInfo().then((info) => {
      if (active) setRelease(info);
    });
    return () => {
      active = false;
    };
  }, []);
  return release;
};
