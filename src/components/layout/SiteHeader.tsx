import { useEffect, useState } from "react";
import { Download, Menu, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { SITE_NAME } from "@/constants/site";
import { SITE_PATHS } from "@/constants/routes";
import { OPENSTUDIO_MARK } from "@/data/siteContent";
import { formatBytes } from "@/lib/format";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { PLATFORMS, usePlatform } from "@/hooks/usePlatform";
import { useReleaseInfo } from "@/hooks/useReleaseInfo";

const NAV_ITEMS = [
  { label: "Features", to: SITE_PATHS.features },
  { label: "NAM Rack", to: SITE_PATHS.namRack },
  { label: "AI Tools", to: SITE_PATHS.ai },
  { label: "Docs", to: SITE_PATHS.docs },
  { label: "Blog", to: SITE_PATHS.blog },
  { label: "Community", to: SITE_PATHS.community },
];

const SiteHeader = () => {
  const desktop = useMediaQuery("(min-width: 901px)");
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const platform = usePlatform();
  const release = useReleaseInfo();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, desktop]);

  const platformInfo = platform ? PLATFORMS[platform] : null;
  const size = platform ? formatBytes(release?.platforms[platform].size) : null;
  const meta = [release ? `v${release.version}` : null, size].filter(Boolean).join(" · ");

  return (
    <header
      className="sp-nav"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          event.currentTarget.querySelector<HTMLButtonElement>(".sp-nav__menu-toggle")?.focus();
        }
      }}
    >
      <div className="sp-container sp-nav__inner">
        <div className="flex items-center gap-[34px] min-w-0">
          <Link className="flex items-center gap-[9px]" to={SITE_PATHS.home}>
            <img className="w-[26px] h-[26px] block" alt={SITE_NAME} src={OPENSTUDIO_MARK} />
            <span className="[font:700_16px/1_'Space_Grotesk',_sans-serif] tracking-[-0.02em]">{SITE_NAME}</span>
          </Link>
          <nav aria-label="Primary" className="sp-nav__links">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) => `sp-nav__link${isActive ? " sp-nav__link--active" : ""}`}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="sp-nav__actions">
          {meta ? <span className="sp-mono sp-nav__meta">{meta}</span> : null}
          <Link className="sp-btn sp-btn--sm sp-nav__download" to={SITE_PATHS.download}>
            <Download aria-hidden="true" size={16} strokeWidth={1.8} />
            <span className="sp-btn__label sp-nav__label--long">
              {platformInfo ? `Download for ${platformInfo.label}` : "Download"}
            </span>
            <span className="sp-btn__label sp-nav__label--short">Download</span>
          </Link>
          <button
            aria-controls="sp-mobile-navigation"
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="sp-btn sp-btn--outline sp-btn--sm sp-nav__menu-toggle"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? <X aria-hidden="true" size={16} /> : <Menu aria-hidden="true" size={16} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="sp-mobile-navigation" aria-label="Primary mobile" className="sp-nav__mobile">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => `sp-nav__link text-[15px]${isActive ? " sp-nav__link--active" : ""}`}
              onClick={() => setOpen(false)}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink className="sp-nav__link text-[15px]" onClick={() => setOpen(false)} to={SITE_PATHS.releases}>
            Releases
          </NavLink>
        </nav>
      ) : null}
    </header>
  );
};

export default SiteHeader;
