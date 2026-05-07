import { lazy, Suspense, useEffect, useState, type ReactElement, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SiteShell from "@/components/SiteShell";

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
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [location.pathname]);

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
