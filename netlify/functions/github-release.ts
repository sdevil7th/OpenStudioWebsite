import { fetchLatestGithubRelease } from "../../shared/github-api";
import { selectReleaseAsset } from "../../shared/release-assets";

/** Small, cacheable live response for version labels and platform download buttons. */
export default async () => {
  try {
    const release = await fetchLatestGithubRelease(process.env.GITHUB_TOKEN);
    if (!release) return new Response("No stable desktop release", { status: 404 });
    const { body: _body, ...summary } = release;
    const assets = (["windows", "macos", "linux"] as const)
      .map((platform) => selectReleaseAsset(release.assets, platform))
      .filter((asset) => asset !== undefined);
    return Response.json(
      { ...summary, assets },
      {
        headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600" },
      },
    );
  } catch {
    return Response.json({ error: "GitHub release data is temporarily unavailable" }, { status: 503 });
  }
};
