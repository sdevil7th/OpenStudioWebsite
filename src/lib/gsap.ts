import { type RefObject, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let pluginsRegistered = false;

export const registerGsap = () => {
  if (!pluginsRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    pluginsRegistered = true;
  }
};

interface ScrollSceneOptions {
  isDesktop: boolean;
  prefersReducedMotion: boolean;
}

type ScrollSceneSetup = (options: ScrollSceneOptions) => void | (() => void);

export const useScrollScene = <T extends HTMLElement>(
  scope: RefObject<T>,
  setup: ScrollSceneSetup,
) => {
  const prefersReducedMotion = useReducedMotion();
  const setupRef = useRef(setup);

  setupRef.current = setup;

  useLayoutEffect(() => {
    const element = scope.current;

    if (!element) {
      return;
    }

    registerGsap();

    let cleanup: void | (() => void);

    const context = gsap.context(() => {
      cleanup = setupRef.current({
        isDesktop: window.matchMedia("(min-width: 1024px)").matches,
        prefersReducedMotion,
      });
    }, element);

    return () => {
      cleanup?.();
      context.revert();
    };
  }, [prefersReducedMotion, scope]);
};

export { gsap, ScrollTrigger };
