import {
  type AiRuntimeLinuxArchitecture,
  type AiRuntimeMacosArchitecture,
  type AiRuntimePlatform,
  parseAiRuntimeManifest,
  resolveAiRuntimeDownloadUrl,
} from "../../shared/ai-runtime-manifest";
import { GITHUB_RELEASES_URL } from "../../shared/github-api";

const AI_RUNTIME_MANIFEST_PATH = "/releases/ai-runtime/stable/latest.json";

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

type AiRuntimeArchitecture = AiRuntimeMacosArchitecture | AiRuntimeLinuxArchitecture;

const parseRuntimeArchitecture = (value: string | null): AiRuntimeArchitecture | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace(/^"|"$/g, "");

  if (normalized === "arm64" || normalized === "aarch64") {
    return "arm64";
  }

  if (normalized === "x64" || normalized === "x86_64" || normalized === "amd64" || normalized === "x86") {
    return "x64";
  }

  return null;
};

const inferRuntimeArchitectureFromRequest = (request: Request): AiRuntimeArchitecture | null => {
  const url = new URL(request.url);
  const explicitArchitecture = parseRuntimeArchitecture(url.searchParams.get("arch"));

  if (explicitArchitecture) {
    return explicitArchitecture;
  }

  const headerArchitecture = parseRuntimeArchitecture(request.headers.get("sec-ch-ua-arch"));

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
  platform: AiRuntimePlatform,
  architecture?: AiRuntimeArchitecture,
) => {
  try {
    const manifest = await fetchPublishedAiRuntimeManifest(request);
    const resolvedArchitecture =
      platform === "macos" || platform === "linux"
        ? architecture ?? inferRuntimeArchitectureFromRequest(request) ?? undefined
        : undefined;
    const redirectTarget = resolveAiRuntimeDownloadUrl(manifest, platform, resolvedArchitecture);

    if (!redirectTarget) {
      throw new Error("No matching AI runtime asset found for request.");
    }

    return Response.redirect(redirectTarget, 302);
  } catch {
    return Response.redirect(GITHUB_RELEASES_URL, 302);
  }
};
