import type { Config } from "@netlify/functions";
import { downloadCatalog } from "../../shared/generatedDownloadCatalog";
import { resolveDownload } from "../../shared/download-routing";

export default (request: Request) => resolveDownload(request, downloadCatalog);

// Keep literals here: Netlify extracts this configuration during bundling.
// A custom path disables the default /.netlify/functions/download-resolver URL.
export const config: Config = {
  path: [
    "/download/ai-runtime/macos/latest",
    "/download/ai-runtime/linux/latest",
    "/.netlify/functions/download-latest-ai-runtime-macos",
    "/.netlify/functions/download-latest-ai-runtime-linux",
    "/.netlify/functions/download-latest",
    "/.netlify/functions/download-latest/windows",
    "/.netlify/functions/download-latest/macos",
    "/.netlify/functions/download-latest/linux",
    "/.netlify/functions/download-latest-windows",
    "/.netlify/functions/download-latest-macos",
    "/.netlify/functions/download-latest-linux",
    "/.netlify/functions/download-latest-ai-runtime-windows",
    "/.netlify/functions/download-latest-ai-runtime-macos-arm64",
    "/.netlify/functions/download-latest-ai-runtime-macos-x64",
    "/.netlify/functions/download-latest-ai-runtime-linux-arm64",
    "/.netlify/functions/download-latest-ai-runtime-linux-x64",
    "/.netlify/functions/github-repo",
    "/.netlify/functions/github-release",
  ],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
