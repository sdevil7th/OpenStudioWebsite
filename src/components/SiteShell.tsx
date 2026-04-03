import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ScrollProgress from "@/components/ScrollProgress";
import SiteFooter from "@/components/SiteFooter";
import SiteNavbar from "@/components/SiteNavbar";
import SmoothScrollProvider, { useSmoothScroll } from "@/components/SmoothScrollProvider";

const ShellContent = () => {
  const location = useLocation();
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      return;
    }

    window.scrollTo(0, 0);
  }, [lenis, location.pathname]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
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
        className="pointer-events-none fixed bottom-[-12rem] left-1/2 -z-10 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(247,190,29,0.12),transparent_66%)] blur-[120px]"
      />
      <SiteNavbar />
      <Outlet />
      <SiteFooter />
    </div>
  );
};

const SiteShell = () => (
  <SmoothScrollProvider>
    <ShellContent />
  </SmoothScrollProvider>
);

export default SiteShell;
