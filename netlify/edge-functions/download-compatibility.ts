import type { Config } from "@netlify/edge-functions";
import { downloadCatalog } from "../../shared/generatedDownloadCatalog.ts";
import { resolveDownload } from "../../shared/download-routing.ts";

export default (request: Request) => resolveDownload(request, downloadCatalog);

// Edge routing runs before dispatch in Netlify's reserved functions namespace.
// Restrict this compatibility resolver to the retained public aliases.
export const config: Config = {
  path: [
    "/.netlify/functions/github-repo",
    "/.netlify/functions/github-release",
    "/.netlify/functions/download-latest",
    "/.netlify/functions/download-latest/windows",
    "/.netlify/functions/download-latest/macos",
    "/.netlify/functions/download-latest/linux",
    "/.netlify/functions/download-latest-windows",
    "/.netlify/functions/download-latest-macos",
    "/.netlify/functions/download-latest-linux",
    "/.netlify/functions/download-latest-ai-runtime-windows",
    "/.netlify/functions/download-latest-ai-runtime-macos",
    "/.netlify/functions/download-latest-ai-runtime-linux",
    "/.netlify/functions/download-latest-ai-runtime-macos-arm64",
    "/.netlify/functions/download-latest-ai-runtime-macos-x64",
    "/.netlify/functions/download-latest-ai-runtime-linux-arm64",
    "/.netlify/functions/download-latest-ai-runtime-linux-x64",
  ],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
