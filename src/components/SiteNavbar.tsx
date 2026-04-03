import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Menu } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BRANDING_ASSETS, SITE_NAME } from "@/constants/site";
import { mainNavigation } from "@/data/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "border-b-2 border-transparent px-1 py-1 font-headline text-[0.92rem] font-medium tracking-tight text-white/62 transition hover:text-white",
    isActive && "border-primary text-primary",
  );

const SiteNavbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-4 transition-[background-color,border-color,box-shadow,padding] duration-500 ease-out md:px-8",
        scrolled
          ? "border-b border-white/10 bg-background/86 shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
          : "border-b border-transparent bg-background/42 backdrop-blur-xl",
      )}
      initial={{ opacity: 0, y: -22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={cn(
          "mx-auto flex max-w-[1920px] items-center justify-between gap-8 transition-[height] duration-500 ease-out",
          scrolled ? "h-[4.35rem]" : "h-20",
        )}
      >
        <Link className="min-w-0 font-headline text-2xl font-bold tracking-tight text-white" to="/">
          <span className="flex items-center gap-3">
            {!isHome ? (
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[1.05rem] border border-white/10 bg-white/[0.04] shadow-[0_0_28px_rgba(208,188,255,0.12)]">
                <img alt={`${SITE_NAME} icon`} className="h-8 w-8 object-contain" src={BRANDING_ASSETS.mark} />
              </span>
            ) : null}
            <span>{SITE_NAME}</span>
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 xl:flex">
          {mainNavigation.map((item) => (
            <NavLink key={item.to} className={navItemClass} to={item.to}>
              {item.label}
            </NavLink>
          ))}
          <Button asChild className="ml-2 rounded-full px-6">
            <Link to="/download">
              <Download className="h-4 w-4" />
              Get Started
            </Link>
          </Button>
        </nav>
        <div className="xl:hidden">
          <Sheet onOpenChange={setOpen} open={open}>
            <SheetTrigger asChild>
              <Button aria-label="Open navigation" size="icon" variant="outline">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="panel-surface border-white/10" side="right">
              <SheetHeader className="mb-8">
                <SheetTitle>Navigate OpenStudio</SheetTitle>
                <SheetDescription>
                  Product overview, feature breakdown, release surface, GitHub story, and creator contact live here.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3">
                <Link className="font-headline text-xl font-semibold tracking-tight text-white" to="/">
                  <span className="flex items-center gap-3">
                    {!isHome ? (
                      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[1rem] border border-white/10 bg-white/[0.04]">
                        <img alt={`${SITE_NAME} icon`} className="h-7 w-7 object-contain" src={BRANDING_ASSETS.mark} />
                      </span>
                    ) : null}
                    <span>{SITE_NAME}</span>
                  </span>
                </Link>
                {mainNavigation.map((item) => (
                  <NavLink
                    key={item.to}
                    className={cn(
                      "rounded-[1.35rem] border px-4 py-3 font-headline text-sm font-medium tracking-tight transition",
                      location.pathname === item.to
                        ? "border-primary/35 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setOpen(false)}
                    to={item.to}
                  >
                    {item.label}
                  </NavLink>
                ))}
                <Button asChild className="mt-4" onClick={() => setOpen(false)}>
                  <Link to="/download">Get Started</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};

export default SiteNavbar;
