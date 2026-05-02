import { lazy, Suspense, type ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SiteShell from "@/components/SiteShell";
import { BRANDING_ASSETS } from "@/constants/site";

const ContactPage = lazy(() => import("@/pages/ContactPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const BlogsPage = lazy(() => import("@/pages/BlogsPage"));
const DownloadPage = lazy(() => import("@/pages/DownloadPage"));
const FeaturesPage = lazy(() => import("@/pages/FeaturesPage"));
const GithubPage = lazy(() => import("@/pages/GithubPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const OgCardPage = lazy(() => import("@/pages/OgCardPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const ReleasesPage = lazy(() => import("@/pages/ReleasesPage"));
const SecurityPage = lazy(() => import("@/pages/SecurityPage"));
const StemSeparationPage = lazy(() => import("@/pages/StemSeparationPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));

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

const withPageLoader = (page: ReactElement) => <Suspense fallback={<PageLoader />}>{page}</Suspense>;

const App = () => (
  <BrowserRouter>
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
