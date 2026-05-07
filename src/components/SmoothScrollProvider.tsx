import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type Lenis from "lenis";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { loadGsap } from "@/lib/gsap";
import { scheduleAfterInitialLoad } from "@/lib/initialLoad";

interface SmoothScrollContextValue {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({ lenis: null });

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      document.documentElement.classList.remove("lenis");
      setLenis(null);
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const startSmoothScroll = async () => {
      const [{ default: LenisConstructor }, { gsap, ScrollTrigger }] = await Promise.all([
        import("lenis"),
        loadGsap(),
      ]);

      if (cancelled) {
        return;
      }

      const lenisInstance = new LenisConstructor({
        duration: 1.1,
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1.2,
        easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      });

      setLenis(lenisInstance);
      const updateScroll = () => ScrollTrigger.update();
      const tick = (time: number) => {
        lenisInstance.raf(time * 1000);
      };

      lenisInstance.on("scroll", updateScroll);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        lenisInstance.off("scroll", updateScroll);
        gsap.ticker.remove(tick);
        lenisInstance.destroy();
        setLenis(null);
      };
    };

    const cancelSchedule = scheduleAfterInitialLoad(
      () => {
        void startSmoothScroll();
      },
      { delay: 2800, runOnInput: false, timeout: 3600 },
    );

    return () => {
      cancelled = true;
      cancelSchedule();
      cleanup?.();
    };
  }, [prefersReducedMotion]);

  const value = useMemo(() => ({ lenis }), [lenis]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
};

export default SmoothScrollProvider;
