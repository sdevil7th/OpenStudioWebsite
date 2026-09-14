import { useEffect } from "react";
import { getPrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** The choreography vocabulary understood by the reveal layer in v2.css. */
export type SpReveal =
  | "rise"
  | "hero"
  | "media-left"
  | "media-right"
  | "stagger"
  | "flow"
  | "band"
  | "panel";

const SELECTOR = "#sp-main [data-sp-reveal]";

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: "0px 0px -10% 0px",
  threshold: 0.15,
};

/**
 * One IntersectionObserver per page for every `[data-sp-reveal]` inside
 * `#sp-main`. Reveals once and unobserves — nothing ever re-hides.
 *
 * This lives on the page rather than the shell on purpose. App.tsx gives
 * V2Shell its own Suspense boundary and each page another, so V2Shell's
 * pathname effect fires while the lazy page chunk is still suspended and
 * `#sp-main` holds only the route fallback. A page-owned effect is guaranteed
 * its own DOM is committed.
 */
export const useSpReveal = () => {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(SELECTOR));
    if (nodes.length === 0) {
      return;
    }

    const reveal = (node: Element) => node.setAttribute("data-sp-in", "true");

    // Fail open, matching the v1 SectionReveal contract.
    if (getPrefersReducedMotion() || !("IntersectionObserver" in window)) {
      nodes.forEach(reveal);
      return;
    }

    let observer: IntersectionObserver | undefined;
    let classified = false;

    // Deferred by a frame so V2Shell's scrollTo(0, 0) — a parent passive effect,
    // and therefore later than this one — has already run and the
    // above-the-fold test measures the real top of the page.
    const classify = () => {
      if (classified) {
        return;
      }

      classified = true;

      const viewport = window.innerHeight;
      const deferred: Element[] = [];

      nodes.forEach((node) => {
        if (node.getBoundingClientRect().top < viewport) {
          // On screen at mount: animate now, never wait on the observer.
          node.setAttribute("data-sp-first", "true");
          reveal(node);
          return;
        }

        deferred.push(node);
      });

      if (deferred.length === 0) {
        return;
      }

      observer = new IntersectionObserver((entries, self) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          reveal(entry.target);
          self.unobserve(entry.target);
        });
      }, OBSERVER_OPTIONS);

      deferred.forEach((node) => observer?.observe(node));
    };

    const frame = window.requestAnimationFrame(classify);
    // rAF is starved in a background tab, which would leave the page at
    // opacity 0 until it is focused. Timers still fire there, so this is the
    // safety net; whichever lands first wins and the other is a no-op.
    const timer = window.setTimeout(classify, 200);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, []);
};
