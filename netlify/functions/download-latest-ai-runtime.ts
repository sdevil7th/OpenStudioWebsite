import {
  type AiRuntimeMacosArchitecture,
  parseAiRuntimeManifest,
  resolveAiRuntimeDownloadUrl,
} from "../../shared/ai-runtime-manifest";
import { GITHUB_RELEASES_URL } from "../../shared/github-api";

const AI_RUNTIME_MANIFEST_PATH = "/releases/ai-runtime/latest.json";
type AiRuntimeRedirectPlatform = "windows" | "macos";

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

const parseMacosArchitecture = (value: string | null): AiRuntimeMacosArchitecture | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "arm64" || normalized === "x64" ? normalized : null;
};

const inferMacosArchitectureFromRequest = (request: Request): AiRuntimeMacosArchitecture | null => {
  const url = new URL(request.url);
  const explicitArchitecture = parseMacosArchitecture(url.searchParams.get("arch"));

  if (explicitArchitecture) {
    return explicitArchitecture;
  }

  const headerArchitecture = parseMacosArchitecture(request.headers.get("sec-ch-ua-arch"));

  if (headerArchitecture) {
    return headerArchitecture;
  }

  const userAgent = String(request.headers.get("user-agent") ?? "").toLowerCase();

  if (/(arm64|aarch64|apple silicon)/.test(userAgent)) {
    return "arm64";
  }

  if (/(x86_64|intel|amd64|x64)/.test(userAgent)) {
    return "x64";
  }

  return null;
};

export const redirectToLatestAiRuntimeRelease = async (
  request: Request,
  platform: AiRuntimeRedirectPlatform,
  architecture?: AiRuntimeMacosArchitecture,
) => {
  try {
    const manifest = await fetchPublishedAiRuntimeManifest(request);
    const resolvedArchitecture =
      platform === "macos" ? architecture ?? inferMacosArchitectureFromRequest(request) : undefined;
    const redirectTarget = resolveAiRuntimeDownloadUrl(manifest, platform, resolvedArchitecture);

    if (!redirectTarget) {
      throw new Error("No matching AI runtime asset found for request.");
    }

    return Response.redirect(redirectTarget, 302);
  } catch {
    return Response.redirect(GITHUB_RELEASES_URL, 302);
  }
};
