import { redirectToLatestPlatformRelease } from "./download-latest";

export default async (request: Request) => redirectToLatestPlatformRelease(request, "windows");
