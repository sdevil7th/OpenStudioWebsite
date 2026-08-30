import { type RefObject, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { scheduleAfterInitialLoad } from "@/lib/initialLoad";

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
  {
    delay,
    runOnInput = false,
    timeout,
    watchDesktopBreakpoint = false,
  }: {
    delay?: number;
    runOnInput?: boolean;
    timeout?: number;
    watchDesktopBreakpoint?: boolean;
  } = {},
) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
  );
  const setupRef = useRef(setup);

  setupRef.current = setup;

  useEffect(() => {
    if (!watchDesktopBreakpoint) {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncDesktop = () => setIsDesktop(mediaQuery.matches);

    syncDesktop();
    mediaQuery.addEventListener("change", syncDesktop);
    return () => mediaQuery.removeEventListener("change", syncDesktop);
  }, [watchDesktopBreakpoint]);

  useEffect(() => {
    const element = scope.current;

    if (!element) {
      return;
    }

    let active = true;
    let cleanup: void | (() => void);
    let context: { revert: () => void } | undefined;

    const cancelSchedule = scheduleAfterInitialLoad(
      () => {
        void loadGsap().then(({ gsap, ScrollTrigger }) => {
          if (!active) {
            return;
          }

          context = gsap.context(() => {
            cleanup = setupRef.current({
              gsap,
              ScrollTrigger,
              isDesktop,
              prefersReducedMotion,
            });
          }, element);
        });
      },
      { delay, runOnInput, timeout },
    );

    return () => {
      active = false;
      cancelSchedule();
      cleanup?.();
      context?.revert();
    };
  }, [delay, isDesktop, prefersReducedMotion, runOnInput, scope, timeout]);
};
