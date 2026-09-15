import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function decodeHash(hash: string): string {
  try {
    return decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return hash.replace(/^#/, "");
  }
}

/** Wait for asynchronous article content as well as the route component. */
export function useHashScroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = decodeHash(hash);
    let observer: MutationObserver | undefined;
    let frame = 0;
    let timeout = 0;
    const cleanup = () => {
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
    const scroll = () => {
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ behavior: getPrefersReducedMotion() ? "auto" : "smooth", block: "start" });
      cleanup();
      return true;
    };
    frame = window.requestAnimationFrame(() => {
      if (scroll()) return;
      observer = new MutationObserver(scroll);
      observer.observe(document.getElementById("sp-main") ?? document.body, { childList: true, subtree: true });
      timeout = window.setTimeout(cleanup, 15_000);
    });
    return cleanup;
  }, [pathname, hash]);
}
