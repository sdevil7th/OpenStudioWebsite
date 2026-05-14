import { Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { BRANDING_ASSETS, SITE_NAME } from "@/constants/site";
import { mainNavigation } from "@/data/navigation";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface MobileNavSheetProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pathname: string;
}

const isNavigationItemActive = (pathname: string, to: string) =>
  pathname === to || (to !== "/" && pathname.startsWith(`${to}/`));

const MobileNavSheet = ({ onOpenChange, open, pathname }: MobileNavSheetProps) => (
  <Sheet onOpenChange={onOpenChange} open={open}>
    <SheetTrigger asChild>
      <Button
        aria-label="Open navigation"
        onClick={() =>
          trackEvent("mobile_nav_opened", {
            source: "site_nav",
          })
        }
        size="icon"
        variant="outline"
      >
        <Menu className="h-4 w-4" />
      </Button>
    </SheetTrigger>
    <SheetContent className="panel-surface border-white/10" side="right">
      <SheetHeader className="mb-8">
        <SheetTitle>Navigate OpenStudio</SheetTitle>
        <SheetDescription>
          Product overview, feature breakdown, release surface, GitHub story, and project contact live here.
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-3">
        <Link className="font-headline text-xl font-semibold tracking-tight text-white" to="/">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[1rem] border border-white/10 bg-white/[0.04]">
              <img alt={`${SITE_NAME} icon`} className="h-7 w-7 object-contain" decoding="async" src={BRANDING_ASSETS.mark} />
            </span>
            <span>{SITE_NAME}</span>
          </span>
        </Link>
        {mainNavigation.map((item) => (
          <NavLink
            key={item.to}
            className={cn(
              "site-mobile-nav-link",
              isNavigationItemActive(pathname, item.to)
                ? "site-mobile-nav-link--active"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onOpenChange(false)}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
        <Button asChild className="mt-4" onClick={() => onOpenChange(false)}>
          <Link
            onClick={() =>
              trackEvent("primary_cta_clicked", {
                cta_name: "get_started",
                destination_path: "/download",
                source: "mobile_nav",
              })
            }
            to="/download"
          >
            Get Started
          </Link>
        </Button>
      </div>
    </SheetContent>
  </Sheet>
);

export default MobileNavSheet;
