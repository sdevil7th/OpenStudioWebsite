import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SiteShell from "@/components/SiteShell";
import ContactPage from "@/pages/ContactPage";
import DownloadPage from "@/pages/DownloadPage";
import FeaturesPage from "@/pages/FeaturesPage";
import GithubPage from "@/pages/GithubPage";
import HomePage from "@/pages/HomePage";
import NotFound from "@/pages/NotFound";
import PrivacyPage from "@/pages/PrivacyPage";
import ReleasesPage from "@/pages/ReleasesPage";
import SecurityPage from "@/pages/SecurityPage";
import StemSeparationPage from "@/pages/StemSeparationPage";
import TermsPage from "@/pages/TermsPage";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<SiteShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/stem-separation" element={<StemSeparationPage />} />
        <Route path="/github" element={<GithubPage />} />
        <Route path="/releases" element={<ReleasesPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
