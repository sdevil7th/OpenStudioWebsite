import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import BrandLogoConstructScene from "@/components/brand/BrandLogoConstructScene";

export const BRAND_INTRO_DURATION_MS = 1500;
const OUTRO_DURATION_MS = 260;
const INTRO_TARGET_PROGRESS = 0.66;

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
  const reducedMotion = useReducedMotion();
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
    let routeReadyFrame = 0;
    let hideTimer = 0;
    let leaveTimer = 0;

    const beginIntroWhenReady = () => {
      if (!document.getElementById("main-content")) {
        routeReadyFrame = window.requestAnimationFrame(beginIntroWhenReady);
        return;
      }

      const startedAt = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startedAt;
        const nextProgress = Math.min(INTRO_TARGET_PROGRESS, (elapsed / BRAND_INTRO_DURATION_MS) * INTRO_TARGET_PROGRESS);
        setProgress(nextProgress);
        if (elapsed < BRAND_INTRO_DURATION_MS) {
          frameId = window.requestAnimationFrame(tick);
        }
      };

      frameId = window.requestAnimationFrame(tick);
      leaveTimer = window.setTimeout(() => {
        setLeaving(true);
        hideTimer = window.setTimeout(() => {
          onVisibilityChange?.(false);
          setVisible(false);
        }, OUTRO_DURATION_MS);
      }, BRAND_INTRO_DURATION_MS);
    };

    routeReadyFrame = window.requestAnimationFrame(beginIntroWhenReady);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(routeReadyFrame);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
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
    </div>
  );
};

export default BrandIntroOverlay;
