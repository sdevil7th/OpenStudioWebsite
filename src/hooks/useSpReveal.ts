import { useEffect } from "react";
import { getPrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** The choreography vocabulary understood by the reveal layer in site.css. */
export type SpReveal =
  | "rise"
  | "hero"
  | "media-left"
  | "media-right"
  | "stagger"
  | "flow"
  | "band"
  | "panel";

const SELECTOR = "[data-sp-reveal]";

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: "0px 0px -10% 0px",
  // Long release notes/articles can exceed several viewport heights. Reveal
  // on entry rather than requiring a fraction of the entire card to fit.
  threshold: 0,
};

/**
 * One IntersectionObserver per page for every `[data-sp-reveal]` inside
 * `#sp-main`, including asynchronously inserted content. Reveals once and
 * unobserves — nothing ever re-hides.
 *
 * This lives on the page so its DOM is committed before classification.
 * App.tsx gives each lazy page a Suspense boundary; the shell's navigation
 * effects can run while `#sp-main` still holds the route fallback.
 */
export const useSpReveal = () => {
  useEffect(() => {
    const main = document.getElementById("sp-main");
    if (!main) {
      return;
    }

    const reveal = (node: Element) => node.setAttribute("data-sp-in", "true");
    const registered = new WeakSet<Element>();
    const pending = new Set<Element>();
    // Keep initial and asynchronously inserted content visible when animation
    // or observation is unavailable.
    const observer = !getPrefersReducedMotion() && "IntersectionObserver" in window
      ? new IntersectionObserver((entries, self) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            reveal(entry.target);
            pending.delete(entry.target);
            self.unobserve(entry.target);
          });
        }, OBSERVER_OPTIONS)
      : undefined;
    let classified = false;

    const register = (node: Element) => {
      if (registered.has(node)) {
        return;
      }
      registered.add(node);

      if (!observer) {
        reveal(node);
      } else if (node.getBoundingClientRect().top < window.innerHeight) {
        // On screen when mounted: animate now, never wait on the observer.
        node.setAttribute("data-sp-first", "true");
        reveal(node);
      } else {
        pending.add(node);
        observer.observe(node);
      }
    };

    const mutations = new MutationObserver((records) => {
      if (!classified) {
        return;
      }

      records.forEach((record) => {
        record.removedNodes.forEach((removed) => {
          if (!(removed instanceof Element)) {
            return;
          }
          pending.forEach((node) => {
            if (removed.contains(node)) {
              observer?.unobserve(node);
              pending.delete(node);
              registered.delete(node);
            }
          });
        });
        record.addedNodes.forEach((added) => {
          if (!(added instanceof Element) || !main.contains(added)) {
            return;
          }
          if (added.matches(SELECTOR)) {
            register(added);
          }
          added.querySelectorAll(SELECTOR).forEach(register);
        });
      });
    });
    mutations.observe(main, { childList: true, subtree: true });

    // Deferred by a frame so SiteShell's scrollTo(0, 0) — a parent passive effect,
    // and therefore later than this one — has already run and the
    // above-the-fold test measures the real top of the page.
    const classify = () => {
      if (classified) {
        return;
      }

      classified = true;
      main.querySelectorAll(SELECTOR).forEach(register);
    };

    const frame = window.requestAnimationFrame(classify);
    // rAF is starved in a background tab, which would leave the page at
    // opacity 0 until it is focused. Timers still fire there, so this is the
    // safety net; whichever lands first wins and the other is a no-op.
    const timer = window.setTimeout(classify, 200);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      mutations.disconnect();
      observer?.disconnect();
      pending.clear();
    };
  }, []);
};
