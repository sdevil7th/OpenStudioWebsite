import { lazy, Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Download, Menu, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import MobileNavContent from "@/components/MobileNavContent";
import { BRANDING_ASSETS, SITE_NAME } from "@/constants/site";
import { mainNavigation } from "@/data/navigation";
import { trackEvent } from "@/lib/analytics";
import { scheduleAfterInitialLoad } from "@/lib/initialLoad";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

let mobileNavModulePromise: ReturnType<typeof importMobileNavSheet> | null = null;

function importMobileNavSheet() {
  return import("@/components/MobileNavSheet");
}

const loadMobileNavSheet = () => {
  if (!mobileNavModulePromise) {
    mobileNavModulePromise = importMobileNavSheet().catch((error) => {
      mobileNavModulePromise = null;
      throw error;
    });
  }

  return mobileNavModulePromise;
};

const MobileNavSheet = lazy(loadMobileNavSheet);

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "site-nav-link",
    isActive && "site-nav-link--active",
  );

interface MobileNavFallbackProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pathname: string;
  returnFocusRef: RefObject<HTMLButtonElement>;
}

const MobileNavFallback = ({
  onOpenChange,
  open,
  pathname,
  returnFocusRef,
}: MobileNavFallbackProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const returnFocusElement = returnFocusRef.current;
    const appRoot = document.getElementById("root");
    const previousRootInert = appRoot?.inert ?? false;
    const previousRootAriaHidden = appRoot?.getAttribute("aria-hidden") ?? null;
    const focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    panelRef.current?.querySelector<HTMLElement>("[data-mobile-nav-close]")?.focus();

    document.body.style.overflow = "hidden";
    if (appRoot) {
      appRoot.inert = true;
      appRoot.setAttribute("aria-hidden", "true");
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)];
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (appRoot) {
        appRoot.inert = previousRootInert;
        if (previousRootAriaHidden === null) {
          appRoot.removeAttribute("aria-hidden");
        } else {
          appRoot.setAttribute("aria-hidden", previousRootAriaHidden);
        }
      }
      returnFocusElement?.focus();
    };
  }, [onOpenChange, open, returnFocusRef]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[rgba(3,5,12,0.72)] backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={panelRef}
        aria-describedby="mobile-nav-fallback-description"
        aria-labelledby="mobile-nav-fallback-title"
        aria-modal="true"
        className="panel-surface fixed inset-y-0 right-0 h-full w-[85%] border border-white/10 bg-background/95 p-6 shadow-xl backdrop-blur-xl sm:max-w-sm"
        role="dialog"
      >
        <button
          aria-label="Close navigation"
          className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          data-mobile-nav-close
          onClick={() => onOpenChange(false)}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-8 flex flex-col space-y-2 text-left">
          <h2 className="font-display text-xl font-semibold" id="mobile-nav-fallback-title">
            Navigate OpenStudio
          </h2>
          <p className="text-sm text-muted-foreground" id="mobile-nav-fallback-description">
            Product overview, feature breakdown, release surface, GitHub story, and project contact live here.
          </p>
        </div>
        <MobileNavContent onNavigate={() => onOpenChange(false)} pathname={pathname} />
      </div>
    </div>,
    document.body,
  );
};

const SiteNavbar = () => {
  const [open, setOpen] = useState(false);
  const [mobileNavRequested, setMobileNavRequested] = useState(false);
  const [mobileNavLoadFailed, setMobileNavLoadFailed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileNavTriggerRef = useRef<HTMLButtonElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const desktopNavigation = window.matchMedia("(min-width: 1280px)");
    const closeMobileNavigation = () => {
      if (desktopNavigation.matches) {
        setOpen(false);
      }
    };

    closeMobileNavigation();
    desktopNavigation.addEventListener("change", closeMobileNavigation);
    return () => desktopNavigation.removeEventListener("change", closeMobileNavigation);
  }, []);

  useEffect(() => {
    return scheduleAfterInitialLoad(
      () => {
        if (window.matchMedia("(max-width: 1279px)").matches) {
          void loadMobileNavSheet().catch(() => undefined);
        }
      },
      { delay: 800, runOnInput: false, timeout: 1800 },
    );
  }, []);

  const preloadMobileNav = () => {
    void loadMobileNavSheet().catch(() => undefined);
  };

  const requestMobileNav = () => {
    setOpen(true);
    void loadMobileNavSheet()
      .then(() => {
        setMobileNavLoadFailed(false);
        setMobileNavRequested(true);
      })
      .catch(() => setMobileNavLoadFailed(true));
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-4 transition-[background-color,border-color,box-shadow,padding] duration-500 ease-out md:px-8",
        "animate-[site_nav_enter_0.7s_cubic-bezier(0.16,1,0.3,1)_both]",
        scrolled
          ? "border-b border-white/10 bg-background/86 shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
          : "border-b border-transparent bg-background/42 backdrop-blur-xl",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-[1920px] items-center justify-between gap-8 transition-[height] duration-500 ease-out",
          scrolled ? "h-[4.35rem]" : "h-20",
        )}
      >
        <Link className="min-w-0 font-headline text-2xl font-bold tracking-tight text-white" to="/">
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[1.05rem] border border-white/10 bg-white/[0.04] shadow-[0_0_28px_rgba(208,188,255,0.12)]">
              <img alt={`${SITE_NAME} icon`} className="h-8 w-8 object-contain" decoding="async" src={BRANDING_ASSETS.mark} />
            </span>
            <span>{SITE_NAME}</span>
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 xl:flex 2xl:gap-8">
          {mainNavigation.map((item) => (
            <NavLink key={item.to} className={navItemClass} to={item.to}>
              {item.label}
            </NavLink>
          ))}
          <Button asChild className="ml-2 rounded-full px-5 2xl:px-6">
            <Link
              onClick={() =>
                trackEvent("primary_cta_clicked", {
                  cta_name: "get_started",
                  destination_path: "/download",
                  source: "site_nav",
                })
              }
              to="/download"
            >
              <Download className="h-4 w-4" />
              Get Started
            </Link>
          </Button>
        </nav>
        <div
          className="xl:hidden"
          onFocus={preloadMobileNav}
          onPointerDown={preloadMobileNav}
          onPointerEnter={preloadMobileNav}
        >
          {mobileNavLoadFailed ? (
            <>
              <Button
                ref={mobileNavTriggerRef}
                aria-label="Open navigation"
                onClick={() => {
                  requestMobileNav();
                  trackEvent("mobile_nav_opened", {
                    source: "site_nav_fallback",
                  });
                }}
                size="icon"
                variant="outline"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <MobileNavFallback
                onOpenChange={setOpen}
                open={open}
                pathname={location.pathname}
                returnFocusRef={mobileNavTriggerRef}
              />
            </>
          ) : mobileNavRequested ? (
            <Suspense
              fallback={
                <Button
                  ref={mobileNavTriggerRef}
                  aria-label="Open navigation"
                  onClick={() => {
                    requestMobileNav();
                    trackEvent("mobile_nav_opened", {
                      source: "site_nav_fallback",
                    });
                  }}
                  size="icon"
                  variant="outline"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              }
            >
              <MobileNavSheet onOpenChange={setOpen} open={open} pathname={location.pathname} />
            </Suspense>
          ) : (
            <Button
              ref={mobileNavTriggerRef}
              aria-label="Open navigation"
              onClick={() => {
                requestMobileNav();
                trackEvent("mobile_nav_opened", {
                  source: "site_nav",
                });
              }}
              size="icon"
              variant="outline"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteNavbar;
