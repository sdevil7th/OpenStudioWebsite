import { type RefObject, useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type GsapRuntime = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
};

let gsapRuntimePromise: Promise<GsapRuntime> | undefined;

export type ScrollTriggerInstance = import("gsap/ScrollTrigger").ScrollTrigger;

export const loadGsap = () => {
  gsapRuntimePromise ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
    ([gsapModule, scrollTriggerModule]) => {
      const { gsap } = gsapModule;
      const { ScrollTrigger } = scrollTriggerModule;

      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    },
  );

  return gsapRuntimePromise;
};

interface ScrollSceneOptions {
  isDesktop: boolean;
  prefersReducedMotion: boolean;
  gsap: GsapRuntime["gsap"];
  ScrollTrigger: GsapRuntime["ScrollTrigger"];
}

type ScrollSceneSetup = (options: ScrollSceneOptions) => void | (() => void);

export const useScrollScene = <T extends HTMLElement>(
  scope: RefObject<T>,
  setup: ScrollSceneSetup,
) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const setupRef = useRef(setup);

  setupRef.current = setup;

  useEffect(() => {
    const element = scope.current;

    if (!element) {
      return;
    }

    let active = true;
    let cleanup: void | (() => void);
    let context: { revert: () => void } | undefined;

    void loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (!active) {
        return;
      }

      context = gsap.context(() => {
        cleanup = setupRef.current({
          gsap,
          ScrollTrigger,
          isDesktop: window.matchMedia("(min-width: 1024px)").matches,
          prefersReducedMotion,
        });
      }, element);
    });

    return () => {
      active = false;
      cleanup?.();
      context?.revert();
    };
  }, [prefersReducedMotion, scope]);
};
