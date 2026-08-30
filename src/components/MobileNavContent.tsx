import { Link, NavLink } from "react-router-dom";
import { BRANDING_ASSETS, SITE_NAME } from "@/constants/site";
import { mainNavigation } from "@/data/navigation";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileNavContentProps {
  onNavigate: () => void;
  pathname: string;
}

const isNavigationItemActive = (pathname: string, to: string) =>
  pathname === to || (to !== "/" && pathname.startsWith(`${to}/`));

const MobileNavContent = ({ onNavigate, pathname }: MobileNavContentProps) => (
  <div className="flex flex-col gap-3">
    <Link className="font-headline text-xl font-semibold tracking-tight text-white" onClick={onNavigate} to="/">
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
        onClick={onNavigate}
        to={item.to}
      >
        {item.label}
      </NavLink>
    ))}
    <Button asChild className="mt-4" onClick={onNavigate}>
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
);

export default MobileNavContent;
