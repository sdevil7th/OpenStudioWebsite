import { GITHUB_RELEASES_URL, fetchGithubRepoSnapshot, resolveLatestReleaseAssetUrl } from "../../shared/github-api";

const siteReleasePath = "/releases";

const getPlatform = (request: Request) => {
  const url = new URL(request.url);
  const platform = url.searchParams.get("platform");

  if (platform === "windows" || platform === "macos") {
    return platform;
  }

  return null;
};

export default async (request: Request) => {
  const platform = getPlatform(request);

  if (!platform) {
    return new Response("Missing or invalid platform query parameter.", { status: 400 });
  }

  try {
    const snapshot = await fetchGithubRepoSnapshot(process.env.GITHUB_TOKEN);
    const assetUrl = resolveLatestReleaseAssetUrl(snapshot.latestRelease, platform);

    if (assetUrl) {
      return Response.redirect(assetUrl, 302);
    }

    if (snapshot.latestRelease?.htmlUrl) {
      return Response.redirect(snapshot.latestRelease.htmlUrl, 302);
    }

    return Response.redirect(siteReleasePath, 302);
  } catch {
    return Response.redirect(GITHUB_RELEASES_URL, 302);
  }
};
