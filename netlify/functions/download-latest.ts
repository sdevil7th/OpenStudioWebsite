import { GITHUB_RELEASES_URL, type GithubPlatform, fetchLatestGithubRelease, resolveLatestReleaseAssetUrl } from "../../shared/github-api";

const APP_RELEASE_MANIFEST_PATH = "/releases/stable/latest.json";
const siteReleasePath = "/releases";

interface ReleasePlatformEntry {
  url?: unknown;
}

interface ReleaseManifest {
  platforms?: Partial<Record<GithubPlatform, ReleasePlatformEntry>>;
}

const getPlatform = (request: Request): GithubPlatform | null => {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();
  const pathSegments = pathname.split("/").filter(Boolean);
  const trailingSegment = pathSegments[pathSegments.length - 1];

  if (trailingSegment === "windows" || trailingSegment === "macos" || trailingSegment === "linux") {
    return trailingSegment as GithubPlatform;
  }

  const platform = url.searchParams.get("platform")?.toLowerCase();

  if (platform === "windows" || platform === "macos" || platform === "linux") {
    return platform as GithubPlatform;
  }

  return null;
};

const ensureAbsoluteHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const fetchPublishedReleaseManifest = async (request: Request) => {
  const manifestUrl = new URL(APP_RELEASE_MANIFEST_PATH, request.url);
  const response = await fetch(manifestUrl, {
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Release manifest request failed with status ${response.status}`);
  }

  return (await response.json()) as ReleaseManifest;
};

const resolveManifestPlatformUrl = (manifest: ReleaseManifest, platform: GithubPlatform) => {
  const url = manifest.platforms?.[platform]?.url;
  return typeof url === "string" && ensureAbsoluteHttpUrl(url) ? url : null;
};

export const redirectToLatestPlatformRelease = async (request: Request, platform: GithubPlatform) => {
  try {
    const manifest = await fetchPublishedReleaseManifest(request);
    const manifestUrl = resolveManifestPlatformUrl(manifest, platform);

    if (manifestUrl) {
      return Response.redirect(manifestUrl, 302);
    }
  } catch {
    // Fall through to the GitHub API fallback below.
  }

  try {
    const latestRelease = await fetchLatestGithubRelease(process.env.GITHUB_TOKEN);
    const assetUrl = resolveLatestReleaseAssetUrl(latestRelease, platform);

    if (assetUrl) {
      return Response.redirect(assetUrl, 302);
    }

    if (latestRelease?.htmlUrl) {
      return Response.redirect(latestRelease.htmlUrl, 302);
    }

    return Response.redirect(siteReleasePath, 302);
  } catch {
    return Response.redirect(GITHUB_RELEASES_URL, 302);
  }
};

export default async (request: Request) => {
  const platform = getPlatform(request);

  if (!platform) {
    return new Response("Missing or invalid platform in request path.", { status: 400 });
  }

  return redirectToLatestPlatformRelease(request, platform);
};
