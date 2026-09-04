import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SiteShell from "@/components/SiteShell";
import { trackPageView } from "@/lib/analytics";
import { preloadModuleOnce } from "@/lib/runtimePreloadRegistry";

const loadContactPage = () => preloadModuleOnce("route:contact", () => import("@/pages/ContactPage"));
const loadBlogPostPage = () => preloadModuleOnce("route:blog-post", () => import("@/pages/BlogPostPage"));
const loadBlogsPage = () => preloadModuleOnce("route:blogs", () => import("@/pages/BlogsPage"));
const loadDownloadPage = () => preloadModuleOnce("route:download", () => import("@/pages/DownloadPage"));
const loadFeaturesPage = () => preloadModuleOnce("route:features", () => import("@/pages/FeaturesPage"));
const loadGithubPage = () => preloadModuleOnce("route:github", () => import("@/pages/GithubPage"));
const loadHomePage = () => preloadModuleOnce("route:home", () => import("@/pages/HomePage"));
const loadNotFound = () => preloadModuleOnce("route:not-found", () => import("@/pages/NotFound"));
const loadOgCardPage = () => preloadModuleOnce("route:og-card", () => import("@/pages/OgCardPage"));
const loadPrivacyPage = () => preloadModuleOnce("route:privacy", () => import("@/pages/PrivacyPage"));
const loadReleasesPage = () => preloadModuleOnce("route:releases", () => import("@/pages/ReleasesPage"));
const loadSecurityPage = () => preloadModuleOnce("route:security", () => import("@/pages/SecurityPage"));
const loadStemSeparationPage = () => preloadModuleOnce("route:ai", () => import("@/pages/StemSeparationPage"));
const loadTermsPage = () => preloadModuleOnce("route:terms", () => import("@/pages/TermsPage"));

// Studio Paper (v2) redesign preview subtree — its own light shell, native scroll.
const loadV2Shell = () => preloadModuleOnce("route:v2-shell", () => import("@/v2/V2Shell"));
const loadV2HomePage = () => preloadModuleOnce("route:v2-home", () => import("@/v2/pages/V2HomePage"));
const loadV2FeaturesPage = () => preloadModuleOnce("route:v2-features", () => import("@/v2/pages/V2FeaturesPage"));
const loadV2NamRackPage = () => preloadModuleOnce("route:v2-nam-rack", () => import("@/v2/pages/V2NamRackPage"));
const loadV2AiPage = () => preloadModuleOnce("route:v2-ai", () => import("@/v2/pages/V2AiPage"));
const loadV2DownloadPage = () => preloadModuleOnce("route:v2-download", () => import("@/v2/pages/V2DownloadPage"));
const loadV2DocsPage = () => preloadModuleOnce("route:v2-docs", () => import("@/v2/pages/V2DocsPage"));
const loadV2DocPage = () => preloadModuleOnce("route:v2-doc", () => import("@/v2/pages/V2DocPage"));
const loadV2ComparePage = () => preloadModuleOnce("route:v2-compare", () => import("@/v2/pages/V2ComparePage"));
const loadV2CommunityPage = () => preloadModuleOnce("route:v2-community", () => import("@/v2/pages/V2CommunityPage"));
const loadV2BlogPage = () => preloadModuleOnce("route:v2-blog", () => import("@/v2/pages/V2BlogPage"));
const loadV2ReleasesPage = () => preloadModuleOnce("route:v2-releases", () => import("@/v2/pages/V2ReleasesPage"));
const loadV2BlogPostPage = () => preloadModuleOnce("route:v2-blog-post", () => import("@/v2/pages/V2BlogPostPage"));
const loadV2RoadmapPage = () => preloadModuleOnce("route:v2-roadmap", () => import("@/v2/pages/V2RoadmapPage"));
const loadV2LegalPage = () => preloadModuleOnce("route:v2-legal", () => import("@/v2/pages/V2LegalPage"));

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

const V2Shell = lazy(loadV2Shell);
const V2HomePage = lazy(loadV2HomePage);
const V2FeaturesPage = lazy(loadV2FeaturesPage);
const V2NamRackPage = lazy(loadV2NamRackPage);
const V2AiPage = lazy(loadV2AiPage);
const V2DownloadPage = lazy(loadV2DownloadPage);
const V2DocsPage = lazy(loadV2DocsPage);
const V2DocPage = lazy(loadV2DocPage);
const V2ComparePage = lazy(loadV2ComparePage);
const V2CommunityPage = lazy(loadV2CommunityPage);
const V2BlogPage = lazy(loadV2BlogPage);
const V2ReleasesPage = lazy(loadV2ReleasesPage);
const V2BlogPostPage = lazy(loadV2BlogPostPage);
const V2RoadmapPage = lazy(loadV2RoadmapPage);
const V2LegalPage = lazy(loadV2LegalPage);

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

  return (
    <div className="route-transition-surface" role="status" aria-live="polite">
      <span className="sr-only">Preparing OpenStudio</span>
      <div className="route-transition-surface__grid" aria-hidden="true">
        <span className="route-transition-surface__beam route-transition-surface__beam--one" />
        <span className="route-transition-surface__beam route-transition-surface__beam--two" />
        <span className="route-transition-surface__beam route-transition-surface__beam--three" />
        <span className="route-transition-surface__line" />
      </div>
    </div>
  );
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

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Standalone route - no navbar/footer, used for OG image generation */}
      <Route path="/og-card" element={withRouteFallback(<OgCardPage />)} />
      {/* Studio Paper (v2) redesign preview — separate light shell, not SiteShell */}
      <Route
        element={
          <Suspense fallback={<RouteFallback />}>
            <V2Shell />
          </Suspense>
        }
        path="/v2"
      >
        <Route index element={withRouteFallback(<V2HomePage />)} />
        <Route path="features" element={withRouteFallback(<V2FeaturesPage />)} />
        <Route path="nam-rack" element={withRouteFallback(<V2NamRackPage />)} />
        <Route path="ai" element={withRouteFallback(<V2AiPage />)} />
        <Route path="download" element={withRouteFallback(<V2DownloadPage />)} />
        <Route path="docs" element={withRouteFallback(<V2DocsPage />)} />
        <Route path="docs/:slug" element={withRouteFallback(<V2DocPage />)} />
        <Route path="compare" element={withRouteFallback(<V2ComparePage />)} />
        <Route path="community" element={withRouteFallback(<V2CommunityPage />)} />
        <Route path="blog" element={withRouteFallback(<V2BlogPage />)} />
        <Route path="blog/:slug" element={withRouteFallback(<V2BlogPostPage />)} />
        <Route path="releases" element={withRouteFallback(<V2ReleasesPage />)} />
        <Route path="roadmap" element={withRouteFallback(<V2RoadmapPage />)} />
        <Route path="privacy" element={withRouteFallback(<V2LegalPage kind="privacy" />)} />
        <Route path="terms" element={withRouteFallback(<V2LegalPage kind="terms" />)} />
        <Route path="security" element={withRouteFallback(<V2LegalPage kind="security" />)} />
        <Route path="*" element={<Navigate to="/v2" replace />} />
      </Route>
      <Route element={<SiteShell />}>
        <Route path="/" element={withRouteFallback(<HomePage />)} />
        <Route path="/features" element={withRouteFallback(<FeaturesPage />)} />
        <Route path="/ai" element={withRouteFallback(<StemSeparationPage />)} />
        <Route path="/stem-separation" element={<Navigate to="/ai" replace />} />
        <Route path="/github" element={withRouteFallback(<GithubPage />)} />
        <Route path="/releases" element={withRouteFallback(<ReleasesPage />)} />
        <Route path="/blogs" element={withRouteFallback(<BlogsPage />)} />
        <Route path="/blogs/:slug" element={withRouteFallback(<BlogPostPage />)} />
        <Route path="/download" element={withRouteFallback(<DownloadPage />)} />
        <Route path="/contact" element={withRouteFallback(<ContactPage />)} />
        <Route path="/privacy" element={withRouteFallback(<PrivacyPage />)} />
        <Route path="/security" element={withRouteFallback(<SecurityPage />)} />
        <Route path="/terms" element={withRouteFallback(<TermsPage />)} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={withRouteFallback(<NotFound />)} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
