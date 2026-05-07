import fs from "node:fs/promises";
import path from "node:path";
import {
  buildAssetPlan,
  type AssetPlanRequest,
  type ImageManifest,
} from "../../shared/asset-image-plan";

const manifestPath = path.resolve(process.cwd(), "public", "assets", "openstudio", "generated", "image-manifest.json");

let manifestPromise: Promise<ImageManifest> | undefined;

const loadManifest = () => {
  manifestPromise ??= fs
    .readFile(manifestPath, "utf8")
    .then((source) => JSON.parse(source) as ImageManifest)
    .catch(() => ({}));

  return manifestPromise;
};

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
      "Content-Type": "application/json; charset=utf-8",
      ...init.headers,
    },
  });

const parseGraphQLInput = async (request: Request): Promise<AssetPlanRequest> => {
  if (request.method === "GET") {
    const url = new URL(request.url);
    const variables = url.searchParams.get("variables");

    if (variables) {
      const parsed = JSON.parse(variables) as { input?: AssetPlanRequest };
      return parsed.input ?? (parsed as AssetPlanRequest);
    }

    return {
      delivery: url.searchParams.get("delivery") === "generated" ? "generated" : "auto",
      dpr: Number(url.searchParams.get("dpr") ?? "1"),
      groups: [],
      route: url.searchParams.get("route") ?? "/",
      viewportHeight: Number(url.searchParams.get("viewportHeight") ?? "720"),
      viewportWidth: Number(url.searchParams.get("viewportWidth") ?? "1280"),
    };
  }

  const payload = (await request.json()) as {
    variables?: {
      input?: AssetPlanRequest;
      request?: AssetPlanRequest;
    } & AssetPlanRequest;
  };

  return payload.variables?.input ?? payload.variables?.request ?? payload.variables ?? {};
};

export default async (request: Request) => {
  if (request.method !== "GET" && request.method !== "POST") {
    return jsonResponse(
      {
        errors: [{ message: "assets-graphql only accepts GET and POST requests." }],
      },
      { status: 405 },
    );
  }

  try {
    const url = new URL(request.url);
    const input = await parseGraphQLInput(request);
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
    const plan = buildAssetPlan(input, await loadManifest(), { host });

    return jsonResponse({
      data: {
        imagePlan: plan,
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        errors: [
          {
            message: error instanceof Error ? error.message : "Unable to create OpenStudio image plan.",
          },
        ],
      },
      { status: 400 },
    );
  }
};
