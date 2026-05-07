import { lazy, Suspense, useEffect, useState } from "react";
import { Download, Menu } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BRANDING_ASSETS, SITE_NAME } from "@/constants/site";
import { mainNavigation } from "@/data/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MobileNavSheet = lazy(() => import("@/components/MobileNavSheet"));

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "site-nav-link",
    isActive && "site-nav-link--active",
  );

const SiteNavbar = () => {
  const [open, setOpen] = useState(false);
  const [mobileNavRequested, setMobileNavRequested] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
    const mediaQuery = window.matchMedia("(max-width: 1279px)");

    if (mediaQuery.matches) {
      setMobileNavRequested(true);
    }
  }, []);

  const requestMobileNav = () => setMobileNavRequested(true);

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
            <Link to="/download">
              <Download className="h-4 w-4" />
              Get Started
            </Link>
          </Button>
        </nav>
        <div className="xl:hidden" onFocus={requestMobileNav} onPointerEnter={requestMobileNav}>
          {mobileNavRequested ? (
            <Suspense
              fallback={
                <Button aria-label="Open navigation" onClick={requestMobileNav} size="icon" variant="outline">
                  <Menu className="h-4 w-4" />
                </Button>
              }
            >
              <MobileNavSheet onOpenChange={setOpen} open={open} pathname={location.pathname} />
            </Suspense>
          ) : (
            <Button
              aria-label="Open navigation"
              onClick={() => {
                setMobileNavRequested(true);
                setOpen(true);
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
