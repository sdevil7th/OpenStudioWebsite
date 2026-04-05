import { parseAiRuntimeManifest } from "../../shared/ai-runtime-manifest";
import { GITHUB_RELEASES_URL, type GithubPlatform } from "../../shared/github-api";

const AI_RUNTIME_MANIFEST_PATH = "/releases/ai-runtime/latest.json";

const fetchPublishedAiRuntimeManifest = async (request: Request) => {
  const manifestUrl = new URL(AI_RUNTIME_MANIFEST_PATH, request.url);
  const response = await fetch(manifestUrl, {
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`AI runtime manifest request failed with status ${response.status}`);
  }

  return parseAiRuntimeManifest(await response.json(), AI_RUNTIME_MANIFEST_PATH);
};

export const redirectToLatestAiRuntimeRelease = async (request: Request, platform: GithubPlatform) => {
  try {
    const manifest = await fetchPublishedAiRuntimeManifest(request);
    return Response.redirect(manifest.platforms[platform].url, 302);
  } catch {
    return Response.redirect(GITHUB_RELEASES_URL, 302);
  }
};
