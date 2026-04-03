import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import Lenis from "lenis";

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

    const lenisInstance = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.2,
      easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
    });

    setLenis(lenisInstance);

    let frame = 0;

    const raf = (time: number) => {
      lenisInstance.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenisInstance.destroy();
      setLenis(null);
    };
  }, [prefersReducedMotion]);

  const value = useMemo(() => ({ lenis }), [lenis]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
};

export default SmoothScrollProvider;
