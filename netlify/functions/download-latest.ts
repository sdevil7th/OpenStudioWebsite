import { GITHUB_RELEASES_URL, type GithubPlatform, fetchLatestGithubRelease, resolveLatestReleaseAssetUrl } from "../../shared/github-api";

const siteReleasePath = "/releases";

const getPlatform = (request: Request): GithubPlatform | null => {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();
  const pathSegments = pathname.split("/").filter(Boolean);
  const trailingSegment = pathSegments[pathSegments.length - 1];

  if (trailingSegment === "windows" || trailingSegment === "macos") {
    return trailingSegment;
  }

  const platform = url.searchParams.get("platform")?.toLowerCase();

  if (platform === "windows" || platform === "macos") {
    return platform;
  }

  return null;
};

export const redirectToLatestPlatformRelease = async (platform: GithubPlatform) => {
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

  return redirectToLatestPlatformRelease(platform);
};
