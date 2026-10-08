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
  ],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
