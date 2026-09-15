import { useCallback, useContext, useState, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { StaticRenderContext } from "@/lib/staticRender";
import PrivacyChoices from "@/components/PrivacyChoices";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { IconGradientDefs } from "@/components/ui/primitives";
import { useHashScroll } from "@/hooks/useHashScroll";
import { FooterLeadContext } from "./footerLeadContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

const SiteShell = () => {
  const staticRender = useContext(StaticRenderContext);
  const [footerLead, setFooterLeadState] = useState<ReactNode | null>(staticRender?.footerLead ?? null);
  const setFooterLead = useCallback((node: ReactNode | null) => setFooterLeadState(node), []);

  useHashScroll();
  const location = useLocation();

  return (
    <FooterLeadContext.Provider value={setFooterLead}>
      <div className="sp-root">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm"
          href="#sp-main"
        >
          Skip to content
        </a>
        <IconGradientDefs />
        <SiteHeader />
        <main id="sp-main" className="min-h-[100svh]">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
        <SiteFooter lead={footerLead} />
        {staticRender ? null : <PrivacyChoices />}
      </div>
    </FooterLeadContext.Provider>
  );
};

export default SiteShell;
