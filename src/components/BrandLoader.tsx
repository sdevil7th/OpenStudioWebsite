import { useLayoutEffect } from "react";

let activeConsumers = 0;
let surface: HTMLElement | null = null;
let startedAt = 0;
let exitTimer = 0;
let removalTimer = 0;

// Use the HTML-first loader's template so every route shares its artwork and CSS.
// A single body-level surface also survives nested Suspense boundaries and avoids
// clipping by transformed page containers.
const BrandLoader = () => {
  useLayoutEffect(() => {
    const template = document.getElementById("openstudio-loader-template");
    if (!(template instanceof HTMLTemplateElement)) return;

    window.clearTimeout(exitTimer);
    window.clearTimeout(removalTimer);
    activeConsumers += 1;

    if (!surface) {
      surface = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
      document.body.appendChild(surface);
      startedAt = performance.now();
    }
    surface.dataset.openstudioLoaderState = "loading";

    return () => {
      activeConsumers -= 1;
      if (activeConsumers > 0) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const remainingEntrance = reducedMotion ? 0 : Math.max(0, 800 - (performance.now() - startedAt));
      exitTimer = window.setTimeout(() => {
        if (activeConsumers > 0 || !surface) return;
        surface.dataset.openstudioLoaderState = "leaving";
        removalTimer = window.setTimeout(() => {
          surface?.remove();
          surface = null;
        }, reducedMotion ? 160 : 360);
      }, remainingEntrance);
    };
  }, []);

  return null;
};

export default BrandLoader;
