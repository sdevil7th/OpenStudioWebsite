import { lazy, Suspense, useEffect, useLayoutEffect, useState, type ReactElement, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import BrandLoader from "@/components/BrandLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { trackPageView } from "@/lib/analytics";
import { preloadModuleOnce } from "@/lib/runtimePreloadRegistry";
const HomePage = lazy(() => preloadModuleOnce("route:home", () => import("@/pages/HomePage")));
const FeaturesPage = lazy(() => preloadModuleOnce("route:features", () => import("@/pages/FeaturesPage")));
const NamRackPage = lazy(() => preloadModuleOnce("route:namrack", () => import("@/pages/NamRackPage")));
const AiPage = lazy(() => preloadModuleOnce("route:ai", () => import("@/pages/AiPage")));
const DownloadPage = lazy(() => preloadModuleOnce("route:download", () => import("@/pages/DownloadPage")));
const DocsPage = lazy(() => preloadModuleOnce("route:docs", () => import("@/pages/DocsPage")));
const DocPage = lazy(() => preloadModuleOnce("route:doc", () => import("@/pages/DocPage")));
const ComparePage = lazy(() => preloadModuleOnce("route:compare", () => import("@/pages/ComparePage")));
const CommunityPage = lazy(() => preloadModuleOnce("route:community", () => import("@/pages/CommunityPage")));
const BlogPage = lazy(() => preloadModuleOnce("route:blog", () => import("@/pages/BlogPage")));
const BlogPostPage = lazy(() => preloadModuleOnce("route:blogpost", () => import("@/pages/BlogPostPage")));
const ReleasesPage = lazy(() => preloadModuleOnce("route:releases", () => import("@/pages/ReleasesPage")));
const RoadmapPage = lazy(() => preloadModuleOnce("route:roadmap", () => import("@/pages/RoadmapPage")));
const LegalPage = lazy(() => preloadModuleOnce("route:legal", () => import("@/pages/LegalPage")));
const NotFound = lazy(() => import("@/pages/NotFound"));
// Artwork generation is a local development tool, not a public search landing page.
const OgCardPage = import.meta.env.DEV ? lazy(() => import("@/pages/OgCardPage")) : null;

const markPerformance = (name: string) => {
  try {
    window.performance?.mark?.(`openstudio:${name}`);
  } catch {
    // Performance marks are diagnostic only.
  }
};

const RouteFallback = () => {
  const [introHidden, setIntroHidden] = useState(() =>
    typeof window !== "undefined" ? Boolean(window.__openstudioIntroHidden) : false,
  );

  useLayoutEffect(() => {
    const token = `route-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.dispatchEvent(
      new CustomEvent("openstudio:route-fallback", {
        detail: { active: true, token },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("openstudio:route-fallback", {
          detail: { active: false, token },
        }),
      );
    };
  }, []);

  useEffect(() => {
    if (introHidden) {
      return;
    }

    const handleIntroHidden = () => setIntroHidden(true);
    window.addEventListener("openstudio:intro-hidden", handleIntroHidden, { once: true });
    return () => window.removeEventListener("openstudio:intro-hidden", handleIntroHidden);
  }, [introHidden]);

  if (!introHidden) {
    return (
      <span className="sr-only" role="status" aria-live="polite">
        Preparing OpenStudio
      </span>
    );
  }

  return <BrandLoader />;
};

const RouteReadySignal = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        window.__openstudioAppReady = true;
        markPerformance("app-ready");
        if (!window.__openstudioFirstRouteReveal) {
          window.__openstudioFirstRouteReveal = true;
          markPerformance("first-route-reveal");
        }
        window.dispatchEvent(
          new CustomEvent("openstudio:app-ready", {
            detail: { pathname: location.pathname },
          }),
        );
        trackPageView(`${location.pathname}${location.search}`);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [location.pathname, location.search]);

  return children;
};

const withRouteFallback = (page: ReactElement) => (
  <Suspense fallback={<RouteFallback />}>
    <RouteReadySignal>{page}</RouteReadySignal>
  </Suspense>
);

/** Client-side equivalents of the permanent hosting redirects preserve query and hash. */
const LegacyRedirect = ({ to }: { to?: string }) => {
  const location = useLocation();
  const pathname = to ?? (location.pathname.replace(/^\/v2(?=\/|$)/, "") || "/");
  return <Navigate replace to={pathname + location.search + location.hash} />;
};
const LegacyBlogRedirect = () => {
  const location = useLocation();
  return <LegacyRedirect to={location.pathname.replace(/^\/blogs(?=\/|$)/, "/blog")} />;
};
const ContactRedirect = () => {
  const location = useLocation();
  return <Navigate replace to={"/community" + location.search + "#contact"} />;
};

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <Routes>
        {OgCardPage && <Route path="/og-card" element={withRouteFallback(<OgCardPage />)} />}
        <Route path="/v2/*" element={<LegacyRedirect />} />
        <Route path="/home" element={<LegacyRedirect to="/" />} />
        <Route path="/stem-separation" element={<LegacyRedirect to="/ai" />} />
        <Route path="/github" element={<LegacyRedirect to="/community" />} />
        <Route path="/contact" element={<ContactRedirect />} />
        <Route path="/blogs/*" element={<LegacyBlogRedirect />} />
        <Route element={<SiteShell />}>
          <Route index element={withRouteFallback(<HomePage />)} />
          <Route path="/features" element={withRouteFallback(<FeaturesPage />)} />
          <Route path="/nam-rack" element={withRouteFallback(<NamRackPage />)} />
          <Route path="/ai" element={withRouteFallback(<AiPage />)} />
          <Route path="/download" element={withRouteFallback(<DownloadPage />)} />
          <Route path="/docs" element={withRouteFallback(<DocsPage />)} />
          <Route path="/docs/:slug" element={withRouteFallback(<DocPage />)} />
          <Route path="/compare" element={withRouteFallback(<ComparePage />)} />
          <Route path="/community" element={withRouteFallback(<CommunityPage />)} />
          <Route path="/blog" element={withRouteFallback(<BlogPage />)} />
          <Route path="/blog/:slug" element={withRouteFallback(<BlogPostPage />)} />
          <Route path="/releases" element={withRouteFallback(<ReleasesPage />)} />
          <Route path="/roadmap" element={withRouteFallback(<RoadmapPage />)} />
          <Route path="/privacy" element={withRouteFallback(<LegalPage kind="privacy" />)} />
          <Route path="/security" element={withRouteFallback(<LegalPage kind="security" />)} />
          <Route path="/terms" element={withRouteFallback(<LegalPage kind="terms" />)} />
          <Route path="*" element={withRouteFallback(<NotFound />)} />
        </Route>
      </Routes>
    </ErrorBoundary>
  </BrowserRouter>
);
export default App;
