import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import BrandLogoConstructScene from "@/components/brand/BrandLogoConstructScene";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export const BRAND_INTRO_DURATION_MS = 1100;
const OUTRO_DURATION_MS = 220;
const INTRO_MIN_VISIBLE_MS = 760;
const INTRO_COMPLETE_MS = 240;
const INTRO_FRAME_INTERVAL_MS = 50;
const INTRO_TARGET_PROGRESS = 0.66;
const INTRO_HOLD_PROGRESS = 0.58;

type BrandIntroOverlayProps = {
  force?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
};

export const shouldPlayInitialIntro = (pathname: string, force = false) => {
  if (typeof window === "undefined") {
    return false;
  }

  if (force) {
    return true;
  }

  if (pathname === "/og-card" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  return true;
};

const BrandIntroOverlay = ({ force = false, onVisibilityChange }: BrandIntroOverlayProps) => {
  const location = useLocation();
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(() => shouldPlayInitialIntro(location.pathname, force));
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const startedRef = useRef(false);
  const initialPathRef = useRef(location.pathname);

  useEffect(() => {
    onVisibilityChange?.(visible);
  }, [onVisibilityChange, visible]);

  useEffect(() => {
    if ((reducedMotion && !force) || initialPathRef.current === "/og-card") {
      onVisibilityChange?.(false);
      return;
    }

    if (startedRef.current) {
      return;
    }

    startedRef.current = true;
    onVisibilityChange?.(true);
    setVisible(true);
    setLeaving(false);
    setProgress(0);

    let frameId = 0;
    let readyCheckTimer = 0;
    let hideTimer = 0;
    let ready = Boolean(window.__openstudioAppReady || document.getElementById("main-content"));
    let completeStartedAt = 0;
    let hidden = false;
    let lastRenderedAt = 0;
    let currentProgress = 0;

    const markReady = () => {
      ready = true;
      window.clearTimeout(readyCheckTimer);
    };

    const checkForMountedContent = () => {
      if (document.getElementById("main-content")) {
        markReady();
        return;
      }

      readyCheckTimer = window.setTimeout(checkForMountedContent, 120);
    };

    const finish = () => {
      if (hidden) {
        return;
      }

      hidden = true;
      setProgress(INTRO_TARGET_PROGRESS);
      setLeaving(true);
      hideTimer = window.setTimeout(() => {
        onVisibilityChange?.(false);
        setVisible(false);
        window.dispatchEvent(new CustomEvent("openstudio:intro-hidden"));
      }, OUTRO_DURATION_MS);
    };

    const startedAt = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const minimumMet = elapsed >= INTRO_MIN_VISIBLE_MS;

      if (ready && minimumMet && completeStartedAt === 0) {
        completeStartedAt = now;
      }

      if (completeStartedAt > 0) {
        const completeProgress = Math.min(1, (now - completeStartedAt) / INTRO_COMPLETE_MS);
        currentProgress = currentProgress + (INTRO_TARGET_PROGRESS - currentProgress) * completeProgress;

        if (completeProgress >= 1) {
          finish();
          return;
        }
      } else {
        const loadingProgress = Math.min(
          INTRO_HOLD_PROGRESS,
          (elapsed / BRAND_INTRO_DURATION_MS) * INTRO_HOLD_PROGRESS,
        );
        currentProgress = Math.max(currentProgress, loadingProgress);
      }

      if (now - lastRenderedAt >= INTRO_FRAME_INTERVAL_MS || completeStartedAt > 0) {
        lastRenderedAt = now;
        setProgress(Number(currentProgress.toFixed(3)));
      }

      frameId = window.requestAnimationFrame(tick);
    };

    window.addEventListener("openstudio:app-ready", markReady);
    readyCheckTimer = window.setTimeout(checkForMountedContent, 120);
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(readyCheckTimer);
      window.clearTimeout(hideTimer);
      window.removeEventListener("openstudio:app-ready", markReady);
      startedRef.current = false;
    };
  }, [force, onVisibilityChange, reducedMotion]);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="brand-intro-overlay"
      data-brand-intro-overlay
      data-brand-intro-state={leaving ? "leaving" : "entering"}
    >
      <BrandLogoConstructScene
        className="brand-intro-overlay__logo"
        progress={progress}
        showWordmark
        size="intro"
      />
      <div className="brand-intro-overlay__progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(0.08, Math.min(1, progress / INTRO_TARGET_PROGRESS))})` }} />
      </div>
    </div>
  );
};

export default BrandIntroOverlay;
