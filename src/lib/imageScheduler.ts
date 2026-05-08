import {
  getGeneratedImageFallbackSrc,
  type AssetPriorityTier,
  type AssetSlotKind,
} from "@/lib/assetLoading";
import { resolveImageAssetUrl } from "@/lib/assetGraphQL";

type ScheduledImagePriority = "high" | "active" | "next" | "idle";

interface LoadScheduledImageOptions {
  fallbackSrc?: string;
  fit?: "contain" | "cover";
  group?: "initialViewport" | "cinematicFirstFrame" | "nearby" | "transitionUpcoming" | "belowFold" | "runtime";
  height?: number;
  maxWidth?: number;
  priority?: ScheduledImagePriority;
  quality?: number;
  route?: string;
  slot?: AssetSlotKind;
  tier?: AssetPriorityTier;
  width?: number;
}

interface QueueTask {
  fallbackSrc?: string;
  fit?: "contain" | "cover";
  group?: LoadScheduledImageOptions["group"];
  height?: number;
  maxWidth: number;
  priority: ScheduledImagePriority;
  quality?: number;
  reject: (error: Error) => void;
  resolve: (image: HTMLImageElement) => void;
  route?: string;
  slot: AssetSlotKind;
  src: string;
  tier: AssetPriorityTier;
  width?: number;
}

const PRIORITY_SCORE: Record<ScheduledImagePriority, number> = {
  high: 0,
  active: 1,
  next: 2,
  idle: 3,
};

const MAX_IDLE_IMAGE_DECODE = 2;
const MAX_SCROLL_IMAGE_DECODE = 1;
const FAILED_SOURCE_BACKOFF_MS = 15000;
const imageCache = new Map<string, Promise<HTMLImageElement>>();
const failedSourceUntil = new Map<string, number>();
const queue: QueueTask[] = [];
let activeLoads = 0;
let scrollWatchInstalled = false;
let scrolling = false;
let scrollSettledTimer = 0;

export const shouldLoadHeavyMedia = () => {
  if (typeof navigator === "undefined") {
    return true;
  }

  const connection = (navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean };
  }).connection;

  return !connection?.saveData && connection?.effectiveType !== "slow-2g" && connection?.effectiveType !== "2g";
};

const scheduleDrain = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.requestAnimationFrame(drainQueue);
};

const installScrollWatch = () => {
  if (scrollWatchInstalled || typeof window === "undefined") {
    return;
  }

  scrollWatchInstalled = true;
  const markScrolling = () => {
    scrolling = true;
    window.clearTimeout(scrollSettledTimer);
    scrollSettledTimer = window.setTimeout(() => {
      scrolling = false;
      drainQueue();
    }, 160);
  };

  window.addEventListener("scroll", markScrolling, { passive: true });
  window.addEventListener("wheel", markScrolling, { passive: true });
  window.addEventListener("touchmove", markScrolling, { passive: true });
};

const retryDelay = (attempt: number, candidateIndex: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, 140 + attempt * 180 + candidateIndex * 90);
  });

const uniqueSources = (sources: Array<string | undefined>) => {
  const seen = new Set<string>();
  return sources.filter((source): source is string => {
    if (!source || seen.has(source)) {
      return false;
    }

    seen.add(source);
    return true;
  });
};

const warnImageFailure = (src: string, error: unknown) => {
  if (!import.meta.env.DEV) {
    return;
  }

  console.warn("[OpenStudio] Image candidate failed", {
    error,
    src,
  });
};

const loadImageElement = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.decoding = "async";
    image.onload = () => {
      const decode = image.decode?.() ?? Promise.resolve();
      decode.then(() => resolve(image)).catch(() => resolve(image));
    };
    image.onerror = () => reject(new Error(`Unable to load image asset: ${src}`));
    image.src = src;
  });

const rememberSourceFailure = (src: string) => {
  failedSourceUntil.set(src, Date.now() + FAILED_SOURCE_BACKOFF_MS);
};

const forgetSourceFailure = (src: string) => {
  failedSourceUntil.delete(src);
};

const isSourceInBackoff = (src: string) => {
  const until = failedSourceUntil.get(src);

  if (!until) {
    return false;
  }

  if (until <= Date.now()) {
    failedSourceUntil.delete(src);
    return false;
  }

  return true;
};

const loadImageWithFallbacks = async (sources: string[]) => {
  let lastError: unknown;
  const candidates = sources.filter((source, index) => index === sources.length - 1 || !isSourceInBackoff(source));

  for (const [candidateIndex, source] of candidates.entries()) {
    const attempts = 1;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const image = await loadImageElement(source);
        forgetSourceFailure(source);
        return image;
      } catch (error) {
        lastError = error;
        rememberSourceFailure(source);
        warnImageFailure(source, error);
        if (attempt < attempts - 1) {
          await retryDelay(attempt, candidateIndex);
        }
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to load image asset.");
};

function drainQueue() {
  installScrollWatch();
  const maxConcurrent = scrolling ? MAX_SCROLL_IMAGE_DECODE : MAX_IDLE_IMAGE_DECODE;

  if (activeLoads >= maxConcurrent || queue.length === 0) {
    return;
  }

  queue.sort((a, b) => PRIORITY_SCORE[a.priority] - PRIORITY_SCORE[b.priority]);

  while (activeLoads < maxConcurrent && queue.length > 0) {
    const task = queue.shift()!;
    activeLoads += 1;

    resolveImageAssetUrl(task.src, {
      fit: task.fit,
      group: task.group,
      height: task.height,
      maxWidth: task.maxWidth,
      priority: task.priority,
      quality: task.quality,
      route: task.route,
      slot: task.slot,
      tier: task.tier,
      width: task.width,
    })
      .then((optimizedSrc) =>
        loadImageWithFallbacks(
          uniqueSources([
            optimizedSrc,
            getGeneratedImageFallbackSrc(
              task.src,
              task.tier,
              task.maxWidth,
              task.slot,
              task.width ?? task.maxWidth,
            ),
            task.fallbackSrc,
            task.src,
          ]),
        ),
      )
      .then(task.resolve)
      .catch(task.reject)
      .finally(() => {
        activeLoads -= 1;
        drainQueue();
      });
  }
}

export const loadScheduledImage = (
  src: string,
  {
    fallbackSrc = src,
    fit,
    group = "runtime",
    height,
    maxWidth = 1440,
    priority = "idle",
    quality,
    route,
    slot = "full-bleed",
    tier = "below-fold",
    width,
  }: LoadScheduledImageOptions = {},
) => {
  const cacheKey = `${src}|${tier}|${slot}|${maxWidth}|${width ?? ""}|${height ?? ""}|${fit ?? ""}|${quality ?? ""}`;
  const cached = imageCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    queue.push({
      fallbackSrc,
      fit,
      group,
      height,
      maxWidth,
      priority,
      quality,
      reject,
      resolve,
      route,
      slot,
      src,
      tier,
      width,
    });
    scheduleDrain();
  });

  void promise.catch(() => {
    imageCache.delete(cacheKey);
  });
  imageCache.set(cacheKey, promise);
  return promise;
};

export const warmScheduledImages = (
  sources: string[],
  options: LoadScheduledImageOptions = {},
) => {
  sources.forEach((src) => {
    void loadScheduledImage(src, options);
  });
};

export const evictScheduledImages = (keepSource: (src: string) => boolean) => {
  [...imageCache.keys()].forEach((key) => {
    const source = key.split("|")[0] ?? "";

    if (!keepSource(source)) {
      imageCache.delete(key);
    }
  });
};
