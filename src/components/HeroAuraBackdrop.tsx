import { useEffect, useState } from "react";

const AURA_SCENE = "pastel-abstract-background-soft-glowing-hd-web-designs";
const AURA_SRC = `https://aura.promad.design/embed/${AURA_SCENE}?theme=light`;

// Measured against the embed: after its `load` event the scene shows a dark ground, then
// a vivid saturated stage from ~0.8s, and only reaches the soft pastel state ~2.0-2.4s in,
// settling fully by ~3.5s. The palette placeholder stays up until then.
const SCENE_SETTLE_MS = 3000;
// Cap on waiting for the page's own load and first paint before the scene is requested.
const PAINT_WAIT_CAP_MS = 4000;

/**
 * Runs `callback` once the page has loaded and painted (a first-contentful-paint entry),
 * then two frames and an idle slot, so the embed's requests never enter this page's
 * critical path. A timer caps the wait.
 */
const afterPaint = (callback: () => void) => {
  let painted = false;
  let loaded = document.readyState === "complete";
  let done = false;
  let cancelled = false;
  let capTimer = 0;
  let idleId = 0;
  let observer: PerformanceObserver | null = null;

  const check = () => {
    if (done || cancelled || !painted || !loaded) return;
    done = true;
    window.clearTimeout(capTimer);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        if (typeof window.requestIdleCallback === "function") {
          idleId = window.requestIdleCallback(() => !cancelled && callback(), { timeout: 2000 });
        } else {
          capTimer = window.setTimeout(() => !cancelled && callback(), 250);
        }
      });
    });
  };
  const handleLoad = () => {
    loaded = true;
    check();
  };

  if (!loaded) window.addEventListener("load", handleLoad, { once: true });
  try {
    observer = new PerformanceObserver((list, self) => {
      if (!list.getEntries().some((entry) => entry.name === "first-contentful-paint")) return;
      painted = true;
      self.disconnect();
      check();
    });
    observer.observe({ type: "paint", buffered: true });
  } catch {
    painted = true;
  }
  capTimer = window.setTimeout(() => {
    painted = true;
    loaded = true;
    check();
  }, PAINT_WAIT_CAP_MS);
  check();

  return () => {
    cancelled = true;
    window.clearTimeout(capTimer);
    window.removeEventListener("load", handleLoad);
    observer?.disconnect();
    if (idleId) window.cancelIdleCallback?.(idleId);
  };
};

/**
 * Full-bleed aura scene behind the home hero. The host paints the scene's palette
 * instantly; the live embed is requested only after the page has rendered and fades in
 * once its scene has settled. Reduced-motion visitors keep the static palette.
 */
const HeroAuraBackdrop = () => {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return afterPaint(() => setMounted(true));
  }, []);

  return (
    <div aria-hidden="true" className="sp-hero-aura__bg" data-aura-scene={AURA_SCENE} data-ready={ready ? "true" : "false"}>
      {mounted ? (
        <iframe
          className="sp-hero-aura__frame"
          loading="lazy"
          onLoad={(event) => {
            const frame = event.currentTarget;
            window.setTimeout(() => {
              if (frame.isConnected) setReady(true);
            }, SCENE_SETTLE_MS);
          }}
          src={AURA_SRC}
          tabIndex={-1}
          title="Pastel Abstract Background – Soft Glowing HD Web Designs"
        />
      ) : null}
    </div>
  );
};

export default HeroAuraBackdrop;
