import type { Config } from "@netlify/edge-functions";
import { downloadCatalog } from "../../shared/generatedDownloadCatalog.ts";
import { resolveDownload } from "../../shared/download-routing.ts";

export default (request: Request) => resolveDownload(request, downloadCatalog);

// netlify.toml owns both sets of routes; they share this native rate limit.
export const config: Config = {
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
