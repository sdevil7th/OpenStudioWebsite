import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { AURA_ORIGIN, observeAuraReadiness } from "@/features/hero-aura/readiness";

const AURA_SCENE = "pastel-abstract-background-soft-glowing-hd-web-designs";
const AURA_SRC = `${AURA_ORIGIN}/embed/${AURA_SCENE}?theme=light`;
// Cap on waiting for the page's own load and first paint before arming the trigger.
const PAINT_WAIT_CAP_MS = 4000;
// Defer decorative work until interaction or the quiet fallback. Performance
// measurements must also cover the active scene, not just this initial delay.
const QUIET_FALLBACK_MS = 10_000;
const INTERACTION_EVENTS = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

/**
 * Runs `callback` once the page has loaded and painted (a first-contentful-paint entry),
 * then two frames and an idle slot, so nothing here competes with the page's own
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
 * Full-bleed original Aura scene behind the home hero.
 *
 * The host repeats the intro loader's surface, so the reveal is continuous, and is what
 * prerendering, no-JavaScript and reduced-motion visitors see. The live embed is requested only after the page has
 * rendered and the visitor has interacted (or a long quiet period has passed), and only
 * while the hero is on screen in a visible tab. It fades in once its scene has settled,
 * and fades out to `visibility: hidden` whenever the hero leaves the viewport or the tab
 * is hidden, so the embed stops compositing when nobody can see it.
 */
const HeroAuraBackdrop = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [triggered, setTriggered] = useState(false);
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hero on screen and the document visible.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !("IntersectionObserver" in window)) return;
    let intersecting = false;
    const update = () => setActive(intersecting && document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      update();
    });
    observer.observe(host);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Page painted, then first interaction or the quiet fallback.
  useEffect(() => {
    if (reducedMotion || triggered) return;
    let fallbackTimer = 0;
    const fire = () => {
      window.clearTimeout(fallbackTimer);
      INTERACTION_EVENTS.forEach((name) => window.removeEventListener(name, fire));
      setTriggered(true);
    };
    const cancelPaint = afterPaint(() => {
      INTERACTION_EVENTS.forEach((name) => window.addEventListener(name, fire, { passive: true }));
      fallbackTimer = window.setTimeout(fire, QUIET_FALLBACK_MS);
    });
    return () => {
      cancelPaint();
      window.clearTimeout(fallbackTimer);
      INTERACTION_EVENTS.forEach((name) => window.removeEventListener(name, fire));
    };
  }, [reducedMotion, triggered]);

  useEffect(() => {
    if (triggered && active && !reducedMotion) setMounted(true);
  }, [triggered, active, reducedMotion]);

  const showFrame = mounted && !reducedMotion;

  return (
    <div
      aria-hidden="true"
      className="sp-hero-aura__bg"
      data-aura-scene={AURA_SCENE}
      data-playing={showFrame && active ? "true" : "false"}
      ref={hostRef}
    >
      {showFrame ? <AuraFrame active={active} /> : null}
    </div>
  );
};

// Own readiness alongside the iframe: removing it for reduced motion also
// discards readiness. Scrolling offscreen keeps this same instance mounted.
const AuraFrame = ({ active }: { active: boolean }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !active || ready || failed) return;
    return observeAuraReadiness(frame, () => setReady(true), () => setFailed(true));
  }, [active, ready, failed]);

  if (failed) return null;
  return (
    <iframe
      ref={frameRef}
      className="sp-hero-aura__frame"
      data-ready={ready ? "true" : "false"}
      src={AURA_SRC}
      tabIndex={-1}
      title="Pastel Abstract Background – Soft Glowing HD Web Designs"
    />
  );
};

export default HeroAuraBackdrop;
