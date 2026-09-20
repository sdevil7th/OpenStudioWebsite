export const AURA_ORIGIN = "https://aura.promad.design";

const SETTLE_MS = 1000;
const RESPONSE_TIMEOUT_MS = 4000;
const LOAD_TIMEOUT_MS = 30_000;

// Aura's capture API returns black when its lazy canvas has not painted yet.
// This particular light-theme scene has an opaque, near-white upper centre.
// Check actual pixels, not merely a successful iframe load or a PNG response.
const hasLightFrame = async (dataUrl: string): Promise<boolean> => {
  const image = new Image();
  image.src = dataUrl;
  try {
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) return false;
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 8;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return false;
    // Avoid the original scene's dark edge vignette; do not alter the scene itself.
    context.drawImage(image, image.naturalWidth / 4, image.naturalHeight / 8,
      image.naturalWidth / 2, image.naturalHeight / 4, 0, 0, 8, 8);
    const pixels = context.getImageData(0, 0, 8, 8).data;
    let lightPixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] > 210 && pixels[i + 1] > 210 && pixels[i + 2] > 210 && pixels[i + 3] > 245) lightPixels++;
    }
    return lightPixels >= 58;
  } catch {
    return false;
  }
};

/** Probe only during startup. No capture requests are sent after readiness. */
export const observeAuraReadiness = (
  frame: HTMLIFrameElement,
  onReady: () => void,
  onFailure: () => void,
): (() => void) => {
  let cancelled = false;
  let requestId: string | null = null;
  let retryTimer = 0;
  let responseTimer = 0;
  let settled = false;

  const cleanup = () => {
    cancelled = true;
    window.clearTimeout(retryTimer);
    window.clearTimeout(responseTimer);
    window.clearTimeout(deadline);
    window.removeEventListener("message", receive);
  };
  const fail = () => { cleanup(); onFailure(); };
  const request = () => {
    if (cancelled || !frame.contentWindow) return;
    requestId = `aura-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    // The smaller capture is only a readiness probe. The visible iframe retains
    // its original resolution, effects, colours and frame rate.
    frame.contentWindow.postMessage({ type: "promad-aura:capture", requestId, pixelRatio: 0.25 }, AURA_ORIGIN);
    responseTimer = window.setTimeout(() => {
      requestId = null;
      retryTimer = window.setTimeout(request, 750);
    }, RESPONSE_TIMEOUT_MS);
  };
  const receive = async (event: MessageEvent<unknown>) => {
    if (cancelled || !requestId || event.origin !== AURA_ORIGIN || event.source !== frame.contentWindow) return;
    const data = event.data;
    if (!data || typeof data !== "object" || !("type" in data) || data.type !== "promad-aura:capture-result" ||
      !("requestId" in data) || data.requestId !== requestId) return;
    requestId = null;
    window.clearTimeout(responseTimer);
    const valid = "dataUrl" in data && typeof data.dataUrl === "string" &&
      data.dataUrl.startsWith("data:image/png;base64,") && data.dataUrl.length <= 2_000_000 &&
      await hasLightFrame(data.dataUrl);
    if (cancelled) return;
    if (!valid) {
      settled = false;
      retryTimer = window.setTimeout(request, 750);
    } else if (!settled) {
      // Start settling after a real frame, then verify again before revealing.
      settled = true;
      retryTimer = window.setTimeout(request, SETTLE_MS);
    } else {
      cleanup();
      onReady();
    }
  };
  const deadline = window.setTimeout(fail, LOAD_TIMEOUT_MS);
  window.addEventListener("message", receive);
  retryTimer = window.setTimeout(request, 500);
  return cleanup;
};
