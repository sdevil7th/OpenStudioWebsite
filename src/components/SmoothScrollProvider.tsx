import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import { registerGsap, ScrollTrigger, gsap } from "@/lib/gsap";

interface SmoothScrollContextValue {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({ lenis: null });

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      document.documentElement.classList.remove("lenis");
      setLenis(null);
      return;
    }

    registerGsap();

    const lenisInstance = new Lenis({
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

    return () => {
      lenisInstance.off("scroll", updateScroll);
      gsap.ticker.remove(tick);
      lenisInstance.destroy();
      setLenis(null);
    };
  }, [prefersReducedMotion]);

  const value = useMemo(() => ({ lenis }), [lenis]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
};

export default SmoothScrollProvider;
