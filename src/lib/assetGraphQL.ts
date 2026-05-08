import {
  type AssetPlanGroupName,
  type AssetPlanRequestItem,
  type AssetPlanResponse,
} from "../../shared/asset-image-plan";
import { getOptimizedImageSrc, type AssetPriorityTier, type AssetSlotKind } from "@/lib/assetLoading";

interface ResolveImageAssetOptions {
  fit?: "contain" | "cover";
  group?: AssetPlanGroupName;
  height?: number;
  maxWidth?: number;
  priority?: "high" | "active" | "next" | "idle";
  quality?: number;
  route?: string;
  slot?: AssetSlotKind;
  tier?: AssetPriorityTier;
  width?: number;
}

interface PendingRequest {
  fallbackUrl: string;
  item: AssetPlanRequestItem;
  reject: (error: Error) => void;
  resolve: (url: string) => void;
}

const GRAPHQL_ENDPOINT = "/.netlify/functions/assets-graphql";
const ASSET_PLAN_QUERY = `
  query OpenStudioImagePlan($input: ImagePlanInput!) {
    imagePlan(input: $input) {
      route
      delivery
      groups {
        name
        assets {
          id
          src
          url
          fallbackUrl
          cdnUrl
          width
          quality
          hash
        }
      }
    }
  }
`;

const pending: PendingRequest[] = [];
const urlCache = new Map<string, Promise<string>>();
let flushScheduled = false;

const currentRoute = () => (typeof window === "undefined" ? "/" : window.location.pathname);

const viewportSnapshot = () => ({
  dpr: typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
  viewportHeight: typeof window === "undefined" ? 720 : window.innerHeight,
  viewportWidth: typeof window === "undefined" ? 1280 : window.innerWidth,
});

const shouldUseAssetGraphQL = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const { hostname, port } = window.location;
  const localHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  if (!localHost) {
    return true;
  }

  return port === "8080" || port === "8888";
};

const cacheKeyFor = (src: string, options: ResolveImageAssetOptions) =>
  [
    src,
    options.tier ?? "below-fold",
    options.slot ?? "full-bleed",
    options.width ?? "",
    options.height ?? "",
    options.maxWidth ?? "",
    options.fit ?? "",
    options.quality ?? "",
    options.route ?? currentRoute(),
  ].join("|");

const localFallbackUrl = (src: string, options: ResolveImageAssetOptions) =>
  getOptimizedImageSrc(
    src,
    options.tier ?? "below-fold",
    options.maxWidth ?? options.width ?? 960,
    options.slot ?? "full-bleed",
  );

const scheduleFlush = () => {
  if (flushScheduled || typeof window === "undefined") {
    return;
  }

  flushScheduled = true;
  window.requestAnimationFrame(flushImagePlanRequests);
};

const settleWithFallback = (requests: PendingRequest[], error?: Error) => {
  requests.forEach((request) => {
    if (error) {
      request.resolve(request.fallbackUrl);
      return;
    }

    request.resolve(request.fallbackUrl);
  });
};

async function flushImagePlanRequests() {
  flushScheduled = false;
  const requests = pending.splice(0);

  if (requests.length === 0) {
    return;
  }

  const snapshot = viewportSnapshot();
  const assets = requests.map((request, index) => ({
    ...request.item,
    id: request.item.id ?? `runtime-${index}`,
  }));

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({
        query: ASSET_PLAN_QUERY,
        variables: {
          input: {
            ...snapshot,
            groups: [{ assets, name: "runtime" }],
            route: currentRoute(),
          },
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Asset GraphQL request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: { imagePlan?: AssetPlanResponse };
      errors?: Array<{ message?: string }>;
    };

    if (!payload.data?.imagePlan || payload.errors?.length) {
      throw new Error(payload.errors?.[0]?.message ?? "Asset GraphQL response did not include an image plan.");
    }

    const plannedAssets = new Map<string, string>();
    payload.data.imagePlan.groups.forEach((group) => {
      group.assets.forEach((asset) => {
        plannedAssets.set(asset.id, asset.url);
      });
    });

    requests.forEach((request, index) => {
      const id = request.item.id ?? `runtime-${index}`;
      request.resolve(plannedAssets.get(id) ?? request.fallbackUrl);
    });
  } catch (error) {
    settleWithFallback(requests, error instanceof Error ? error : new Error("Unknown asset GraphQL failure."));
  }
}

export const resolveImageAssetUrl = (src: string, options: ResolveImageAssetOptions = {}) => {
  const key = cacheKeyFor(src, options);
  const cached = urlCache.get(key);

  if (cached) {
    return cached;
  }

  const fallbackUrl = localFallbackUrl(src, options);
  if (!shouldUseAssetGraphQL()) {
    const fallbackPromise = Promise.resolve(fallbackUrl);
    urlCache.set(key, fallbackPromise);
    return fallbackPromise;
  }

  const promise = new Promise<string>((resolve, reject) => {
    pending.push({
      fallbackUrl,
      item: {
        fit: options.fit,
        group: options.group ?? "runtime",
        height: options.height,
        maxWidth: options.maxWidth,
        quality: options.quality,
        slot: options.slot,
        src,
        tier: options.tier,
        width: options.width,
      },
      reject,
      resolve,
    });
    scheduleFlush();
  });

  urlCache.set(key, promise);
  return promise;
};
