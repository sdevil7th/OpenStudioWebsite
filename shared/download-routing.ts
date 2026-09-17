import type { AiRuntimeManifest, AiRuntimePlatform } from "./ai-runtime-manifest";
import { resolveAiRuntimeDownloadUrl } from "./ai-runtime-manifest";

export interface DownloadCatalog {
  app: Record<AiRuntimePlatform, string>;
  runtime: AiRuntimeManifest;
  fallback: string;
}

export const githubAliases: Record<string, string> = {
  "/.netlify/functions/github-repo": "/github/repository.json",
  "/.netlify/functions/github-release": "/github/latest-release.json",
};

export function normalizeDownloadPath(path: string): string {
  return path.replace(/\/$/, "").toLowerCase();
}

/** Only routes whose answer depends on request headers or query parameters use compute. */
export function isDynamicDownload(path: string): boolean {
  return /^\/download\/ai-runtime\/(macos|linux)\/latest$/.test(path) ||
    /^\/\.netlify\/functions\/download-latest-ai-runtime-(macos|linux)$/.test(path) ||
    /^\/\.netlify\/functions\/download-latest(?:\/(windows|macos|linux))?$/.test(path);
}

export function fixedDownloadRoutes(catalog: DownloadCatalog): Map<string, string> {
  const routes = new Map<string, string>();
  for (const platform of ["windows", "macos", "linux"] as const) {
    routes.set(`/download/${platform}/latest`, catalog.app[platform]);
    routes.set(`/.netlify/functions/download-latest-${platform}`, catalog.app[platform]);
  }
  const windows = resolveAiRuntimeDownloadUrl(catalog.runtime, "windows") ?? catalog.fallback;
  routes.set("/download/ai-runtime/windows/latest", windows);
  routes.set("/.netlify/functions/download-latest-ai-runtime-windows", windows);
  for (const platform of ["macos", "linux"] as const) {
    for (const arch of ["arm64", "x64"] as const) {
      const target = resolveAiRuntimeDownloadUrl(catalog.runtime, platform, arch) ?? catalog.fallback;
      routes.set(`/download/ai-runtime/${platform}/${arch}/latest`, target);
      routes.set(`/.netlify/functions/download-latest-ai-runtime-${platform}-${arch}`, target);
    }
  }
  return routes;
}

function architecture(value: string | null): "arm64" | "x64" | undefined {
  const normalized = value?.trim().toLowerCase().replace(/^"|"$/g, "");
  if (normalized === "arm64" || normalized === "aarch64") return "arm64";
  if (["x64", "x86_64", "amd64", "x86"].includes(normalized ?? "")) return "x64";
}

/** Pure resolver: all destinations come from validated, bundled build inputs. No fetches. */
export function resolveDownload(request: Request, catalog: DownloadCatalog): Response {
  const url = new URL(request.url);
  const path = normalizeDownloadPath(url.pathname);
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const githubDocument = githubAliases[path];
  if (githubDocument) {
    return new Response(null, { status: 302, headers: {
      Location: githubDocument,
      "Cache-Control": "public, max-age=3600",
      "Netlify-CDN-Cache-Control": "public, s-maxage=86400, durable",
    } });
  }
  const fixed = fixedDownloadRoutes(catalog).get(path);
  if (fixed) return new Response(null, { status: 302, headers: { Location: fixed } });
  if (!isDynamicDownload(path)) return new Response(null, { status: 404 });
  let target: string;
  if (path.includes("ai-runtime")) {
    const platform = path.includes("macos") ? "macos" : "linux";
    const agent = request.headers.get("user-agent")?.toLowerCase() ?? "";
    const inferred = /(arm64|aarch64|apple silicon)/.test(agent) ? "arm64" :
      /(x86_64|intel|amd64|x64)/.test(agent) ? "x64" : undefined;
    const arch = architecture(url.searchParams.get("arch")) ??
      architecture(request.headers.get("sec-ch-ua-arch")) ?? inferred;
    target = resolveAiRuntimeDownloadUrl(catalog.runtime, platform, arch) ?? catalog.fallback;
  } else {
    const trailing = path.split("/").at(-1);
    const platform = trailing === "download-latest" ? url.searchParams.get("platform")?.toLowerCase() : trailing;
    if (platform !== "windows" && platform !== "macos" && platform !== "linux") {
      return new Response("Missing or invalid platform.", { status: 400 });
    }
    target = catalog.app[platform];
  }
  // Architecture responses must never be shared between incompatible machines.
  return new Response(null, { status: 302, headers: { Location: target, "Cache-Control": "no-store" } });
}

export function downloadRedirectRules(catalog: DownloadCatalog): string[] {
  // Netlify reserves /.netlify/* and rejects it as a redirect source. Those
  // compatibility paths must be explicit routes of the protected function.
  return [...fixedDownloadRoutes(catalog)]
    .filter(([from]) => !from.startsWith("/.netlify/"))
    .map(([from, to]) => `${from} ${to} 302!`);
}
