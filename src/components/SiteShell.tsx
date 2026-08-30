import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ScrollProgress from "@/components/ScrollProgress";
import SiteFooter from "@/components/SiteFooter";
import SiteNavbar from "@/components/SiteNavbar";
import SmoothScrollProvider, { useSmoothScroll } from "@/components/SmoothScrollProvider";

const HASH_SCROLL_OFFSET = -96;
const HASH_TARGET_WAIT_MS = 15_000;

const decodeHashId = (hash: string) => {
  const encodedId = hash.startsWith("#") ? hash.slice(1) : hash;

  try {
    return decodeURIComponent(encodedId);
  } catch {
    return encodedId;
  }
};

// getBoundingClientRect includes route entrance transforms, which can make a
// freshly mounted deep-link target look several pixels lower than its settled
// layout position. Offset-parent geometry is transform-free and keeps the
// final navbar clearance exact after the entrance animation completes.
const getDocumentLayoutTop = (element: HTMLElement) => {
  let node: HTMLElement | null = element;
  let top = 0;

  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }

  return top;
};

const ShellContent = () => {
  const location = useLocation();
  const { lenis } = useSmoothScroll();
  const lenisRef = useRef(lenis);
  const [initialRoutePending, setInitialRoutePending] = useState(
    () => typeof window === "undefined" || !window.__openstudioAppReady,
  );
  const [routeFallbackTokens, setRouteFallbackTokens] = useState<Set<string>>(() => new Set());
  const routePending = initialRoutePending || routeFallbackTokens.size > 0;

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    const handleInitialRouteReady = () => setInitialRoutePending(false);

    // RouteFallback announces itself from an effect, which is too late to keep
    // the footer out of the shell's first committed frame. Treat the first
    // route as pending synchronously, then release the footer once that route
    // has rendered and emitted the existing ready signal.
    if (window.__openstudioAppReady) {
      handleInitialRouteReady();
      return;
    }

    window.addEventListener("openstudio:app-ready", handleInitialRouteReady, { once: true });
    return () => window.removeEventListener("openstudio:app-ready", handleInitialRouteReady);
  }, []);

  useEffect(() => {
    let hashTargetObserver: MutationObserver | undefined;
    let hashTargetTimeout: number | undefined;
    let frame = 0;
    const hashId = decodeHashId(location.hash);

    const stopWaitingForHashTarget = () => {
      hashTargetObserver?.disconnect();
      hashTargetObserver = undefined;

      if (hashTargetTimeout !== undefined) {
        window.clearTimeout(hashTargetTimeout);
        hashTargetTimeout = undefined;
      }

      window.removeEventListener("openstudio:app-ready", handleRouteReady);
    };

    const scrollToTop = () => {
      const currentLenis = lenisRef.current;

      if (currentLenis) {
        currentLenis.scrollTo(0, { immediate: true });
        return;
      }

      window.scrollTo(0, 0);
    };

    const scrollToHashTarget = () => {
      const hashTarget = hashId ? document.getElementById(hashId) : null;

      if (!hashTarget) {
        return false;
      }

      const currentLenis = lenisRef.current;
      const targetTop = Math.max(
        0,
        getDocumentLayoutTop(hashTarget) + HASH_SCROLL_OFFSET,
      );

      if (currentLenis) {
        currentLenis.scrollTo(targetTop, {
          immediate: true,
        });
      } else {
        window.scrollTo(0, targetTop);
      }

      stopWaitingForHashTarget();
      return true;
    };

    function handleRouteReady() {
      scrollToHashTarget();
    }

    frame = window.requestAnimationFrame(() => {
      if (!hashId) {
        scrollToTop();
        return;
      }

      if (scrollToHashTarget()) {
        return;
      }

      scrollToTop();

      const routeFrame = document.querySelector(".site-shell-route-frame");
      hashTargetObserver = new MutationObserver(() => {
        scrollToHashTarget();
      });
      hashTargetObserver.observe(routeFrame ?? document.body, {
        childList: true,
        subtree: true,
      });
      window.addEventListener("openstudio:app-ready", handleRouteReady);
      hashTargetTimeout = window.setTimeout(
        stopWaitingForHashTarget,
        HASH_TARGET_WAIT_MS,
      );

      // Cover a target mounting between the first lookup and observer setup.
      scrollToHashTarget();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      stopWaitingForHashTarget();
    };
  }, [location.hash, location.pathname]);

  useEffect(() => {
    const handleRouteFallback = (event: Event) => {
      const detail = (event as CustomEvent<{ active?: boolean; token?: string }>).detail;
      const token = detail?.token;

      if (!token) {
        return;
      }

      setRouteFallbackTokens((previous) => {
        const next = new Set(previous);

        if (detail.active) {
          next.add(token);
        } else {
          next.delete(token);
        }

        return next;
      });
    };

    window.addEventListener("openstudio:route-fallback", handleRouteFallback);
    return () => window.removeEventListener("openstudio:route-fallback", handleRouteFallback);
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:ring-2 focus:ring-ring"
        href="#main-content"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <div className="pointer-events-none fixed inset-0 -z-30 stage-backdrop" />
      <div className="pointer-events-none fixed inset-0 -z-20 noise-overlay opacity-70" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_15%_0%,rgba(208,188,255,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(74,225,118,0.1),transparent_24%)]"
      />
      <div
        aria-hidden="true"
        className="site-shell-ambient-bottom pointer-events-none fixed bottom-[-12rem] left-1/2 -z-10 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(247,190,29,0.12),transparent_66%)] blur-[120px]"
      />
      <div className="site-shell-content" data-route-pending={routePending ? "true" : "false"}>
        <SiteNavbar />
        <div className="site-shell-route-frame">
          <Outlet />
        </div>
        {!routePending ? <SiteFooter /> : null}
      </div>
    </div>
  );
};

const SiteShell = () => (
  <SmoothScrollProvider>
    <ShellContent />
  </SmoothScrollProvider>
);

export default SiteShell;
