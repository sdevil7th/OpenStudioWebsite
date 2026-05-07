import { lazy, Suspense, useEffect, type ReactElement, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SiteShell from "@/components/SiteShell";
import { BRANDING_ASSETS } from "@/constants/site";

const loadContactPage = () => import("@/pages/ContactPage");
const loadBlogPostPage = () => import("@/pages/BlogPostPage");
const loadBlogsPage = () => import("@/pages/BlogsPage");
const loadDownloadPage = () => import("@/pages/DownloadPage");
const loadFeaturesPage = () => import("@/pages/FeaturesPage");
const loadGithubPage = () => import("@/pages/GithubPage");
const loadHomePage = () => import("@/pages/HomePage");
const loadNotFound = () => import("@/pages/NotFound");
const loadOgCardPage = () => import("@/pages/OgCardPage");
const loadPrivacyPage = () => import("@/pages/PrivacyPage");
const loadReleasesPage = () => import("@/pages/ReleasesPage");
const loadSecurityPage = () => import("@/pages/SecurityPage");
const loadStemSeparationPage = () => import("@/pages/StemSeparationPage");
const loadTermsPage = () => import("@/pages/TermsPage");

const ContactPage = lazy(loadContactPage);
const BlogPostPage = lazy(loadBlogPostPage);
const BlogsPage = lazy(loadBlogsPage);
const DownloadPage = lazy(loadDownloadPage);
const FeaturesPage = lazy(loadFeaturesPage);
const GithubPage = lazy(loadGithubPage);
const HomePage = lazy(loadHomePage);
const NotFound = lazy(loadNotFound);
const OgCardPage = lazy(loadOgCardPage);
const PrivacyPage = lazy(loadPrivacyPage);
const ReleasesPage = lazy(loadReleasesPage);
const SecurityPage = lazy(loadSecurityPage);
const StemSeparationPage = lazy(loadStemSeparationPage);
const TermsPage = lazy(loadTermsPage);

const prefetchLoaders = {
  ai: loadStemSeparationPage,
  blogs: loadBlogsPage,
  contact: loadContactPage,
  download: loadDownloadPage,
  features: loadFeaturesPage,
  github: loadGithubPage,
  releases: loadReleasesPage,
};

const PageLoader = () => (
  <div
    className="fixed inset-0 z-[90] flex min-h-dvh items-center justify-center bg-background text-foreground"
    role="status"
    aria-live="polite"
  >
    <div className="flex flex-col items-center gap-5">
      <img className="h-14 w-14 animate-pulse" src={BRANDING_ASSETS.mark} alt="" aria-hidden="true" decoding="async" />
      <div className="h-1 w-44 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/2 animate-[loading-bar_1.15s_ease-in-out_infinite] rounded-full bg-primary" />
      </div>
      <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">Loading OpenStudio</span>
    </div>
  </div>
);

const RouteReadySignal = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        window.__openstudioAppReady = true;
        window.dispatchEvent(
          new CustomEvent("openstudio:app-ready", {
            detail: { pathname: location.pathname },
          }),
        );
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [location.pathname]);

  return children;
};

const canPrefetch = () => {
  if (typeof navigator === "undefined") {
    return true;
  }

  const connection = (navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean };
  }).connection;

  return !connection?.saveData && connection?.effectiveType !== "slow-2g" && connection?.effectiveType !== "2g";
};

const scheduleIdle = (callback: () => void, timeout = 1800) => {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(callback, Math.min(timeout, 900));
  return () => window.clearTimeout(id);
};

const IdleRoutePrefetcher = () => {
  const location = useLocation();

  useEffect(() => {
    if (!canPrefetch()) {
      return;
    }

    const timers: number[] = [];
    let cancelIdle = () => undefined;

    const startPrefetch = () => {
      const routeKey = location.pathname.replace(/^\//, "").split("/")[0] || "home";
      const primaryRoutes =
        routeKey === "home"
          ? ["features", "download", "ai"]
          : routeKey === "features"
            ? ["download", "ai"]
            : routeKey === "ai"
              ? ["download", "features"]
              : ["features", "download"];
      const secondaryRoutes = ["github", "releases", "blogs", "contact"];

      cancelIdle = scheduleIdle(() => {
        [...primaryRoutes, ...secondaryRoutes].forEach((key, index) => {
          const loader = prefetchLoaders[key as keyof typeof prefetchLoaders];
          if (!loader) return;

          timers.push(
            window.setTimeout(() => {
              void loader().catch(() => undefined);
            }, index * 180),
          );
        });
      }, 1400);
    };

    if (window.__openstudioAppReady) {
      startPrefetch();
    } else {
      window.addEventListener("openstudio:app-ready", startPrefetch, { once: true });
    }

    return () => {
      window.removeEventListener("openstudio:app-ready", startPrefetch);
      cancelIdle();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [location.pathname]);

  return null;
};

const withPageLoader = (page: ReactElement) => (
  <Suspense fallback={<PageLoader />}>
    <RouteReadySignal>{page}</RouteReadySignal>
  </Suspense>
);

const App = () => (
  <BrowserRouter>
    <IdleRoutePrefetcher />
    <Routes>
      {/* Standalone route - no navbar/footer, used for OG image generation */}
      <Route path="/og-card" element={withPageLoader(<OgCardPage />)} />
      <Route element={<SiteShell />}>
        <Route path="/" element={withPageLoader(<HomePage />)} />
        <Route path="/features" element={withPageLoader(<FeaturesPage />)} />
        <Route path="/ai" element={withPageLoader(<StemSeparationPage />)} />
        <Route path="/stem-separation" element={<Navigate to="/ai" replace />} />
        <Route path="/github" element={withPageLoader(<GithubPage />)} />
        <Route path="/releases" element={withPageLoader(<ReleasesPage />)} />
        <Route path="/blogs" element={withPageLoader(<BlogsPage />)} />
        <Route path="/blogs/:slug" element={withPageLoader(<BlogPostPage />)} />
        <Route path="/download" element={withPageLoader(<DownloadPage />)} />
        <Route path="/contact" element={withPageLoader(<ContactPage />)} />
        <Route path="/privacy" element={withPageLoader(<PrivacyPage />)} />
        <Route path="/security" element={withPageLoader(<SecurityPage />)} />
        <Route path="/terms" element={withPageLoader(<TermsPage />)} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={withPageLoader(<NotFound />)} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
