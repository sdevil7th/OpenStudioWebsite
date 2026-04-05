import { redirectToLatestAiRuntimeRelease } from "./download-latest-ai-runtime";

export default async (request: Request) => redirectToLatestAiRuntimeRelease(request, "macos");
