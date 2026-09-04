import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Download, GitFork, Menu, X } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { SITE_NAME, DOWNLOAD_PATHS } from "@/constants/site";
import { getPrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import "@/styles/v2.css";
import { CONTACT_EMAIL, REPO, V2_PATHS, VISMAY_MARK, docPath } from "./content";
import { formatBytes, formatDate } from "./format";
import { IconGradientDefs } from "./primitives";
import { FooterLeadContext } from "./shellContext";
import { PLATFORMS, usePlatform } from "./usePlatform";
import { useReleaseInfo } from "./useReleaseInfo";

const NAV_ITEMS = [
  { label: "Features", to: V2_PATHS.features },
  { label: "NAM Rack", to: V2_PATHS.namRack },
  { label: "AI Tools", to: V2_PATHS.ai },
  { label: "Docs", to: V2_PATHS.docs },
  { label: "Blog", to: V2_PATHS.blog },
  { label: "Community", to: V2_PATHS.community },
];

const V2Nav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const platform = usePlatform();
  const release = useReleaseInfo();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const platformInfo = platform ? PLATFORMS[platform] : null;
  const size = platform ? formatBytes(release?.platforms[platform].size) : null;
  const meta = [release ? `v${release.version}` : null, size].filter(Boolean).join(" · ");

  return (
    <header className="sp-nav">
      <div className="sp-container sp-nav__inner">
        <div style={{ display: "flex", alignItems: "center", gap: 34, minWidth: 0 }}>
          <Link style={{ display: "flex", alignItems: "center", gap: 9 }} to={V2_PATHS.home}>
            <img alt={SITE_NAME} src={VISMAY_MARK} style={{ width: 26, height: 26, display: "block" }} />
            <span style={{ font: "700 16px/1 'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
              {SITE_NAME}
            </span>
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
          <Link className="sp-btn sp-btn--sm sp-nav__download" to={V2_PATHS.download}>
            <Download aria-hidden="true" size={16} strokeWidth={1.8} />
            <span className="sp-btn__label sp-nav__label--long">
              {platformInfo ? `Download for ${platformInfo.label}` : "Download"}
            </span>
            <span className="sp-btn__label sp-nav__label--short">Download</span>
          </Link>
          <button
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
        <nav aria-label="Primary mobile" className="sp-nav__mobile">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => `sp-nav__link${isActive ? " sp-nav__link--active" : ""}`}
              style={{ fontSize: 15 }}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink className="sp-nav__link" style={{ fontSize: 15 }} to={V2_PATHS.releases}>
            Releases
          </NavLink>
        </nav>
      ) : null}
    </header>
  );
};

interface FooterLink {
  label: string;
  to?: string;
  href?: string;
  icon?: "github";
}

// Every entry resolves to the page (or the anchor on it) that its label
// promises. Nothing here points at a generic landing page or the old shell.
const FOOTER_COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Download", to: V2_PATHS.download },
      { label: "Features", to: V2_PATHS.features },
      { label: "NAM Rack", to: V2_PATHS.namRack },
      { label: "AI Tools", to: V2_PATHS.ai },
      { label: "Compare", to: V2_PATHS.compare },
      { label: "Releases", to: V2_PATHS.releases },
      { label: "System requirements", to: `${V2_PATHS.download}#requirements` },
    ],
  },
  {
    heading: "Features",
    links: [
      { label: "Recording", to: `${V2_PATHS.features}#recording` },
      { label: "MIDI & instruments", to: `${V2_PATHS.features}#midi` },
      { label: "Mixing & routing", to: `${V2_PATHS.features}#mixing` },
      { label: "Plugins & FX", to: `${V2_PATHS.features}#plugins` },
      { label: "Pitch editing", to: `${V2_PATHS.features}#pitch` },
      { label: "Scripting", to: `${V2_PATHS.features}#scripting` },
      { label: "Export & formats", to: `${V2_PATHS.features}#export` },
    ],
  },
  {
    heading: "Learn",
    links: [
      { label: "Getting started", to: docPath("getting-started") },
      { label: "Your first session", to: docPath("first-session") },
      { label: "Audio setup", to: docPath("audio-setup") },
      { label: "NAM Rack setup", to: docPath("nam-rack-setup") },
      { label: "AI Tools setup", to: docPath("ai-runtime-setup") },
      { label: "Keyboard shortcuts", to: docPath("keyboard-shortcuts") },
      { label: "Troubleshooting", to: docPath("troubleshooting") },
      { label: "FAQ", to: docPath("faq") },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "GitHub", href: REPO.url, icon: "github" },
      { label: "Contribute", to: V2_PATHS.community },
      { label: "Roadmap", to: V2_PATHS.roadmap },
      { label: "Report a bug", href: REPO.issues },
      { label: "Blog", to: V2_PATHS.blog },
      { label: "Contact", href: `mailto:${CONTACT_EMAIL}` },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "License (AGPLv3)", href: REPO.license },
      { label: "Privacy", to: V2_PATHS.privacy },
      { label: "Terms", to: V2_PATHS.terms },
      { label: "Security", to: V2_PATHS.security },
    ],
  },
];

const V2Footer = ({ lead }: { lead: ReactNode | null }) => {
  const release = useReleaseInfo();
  const released = formatDate(release?.publishedAt);

  return (
    <footer className="sp-footer">
      {lead ? <div className="sp-footer__lead">{lead}</div> : null}
      <div className="sp-container" style={{ paddingTop: 48, paddingBottom: 30 }}>
        <div className="sp-footer__grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <img alt="" src={VISMAY_MARK} style={{ width: 22, height: 22 }} />
              <span style={{ font: "700 14px/1 'Space Grotesk', sans-serif", color: "#f7f8fa" }}>{SITE_NAME}</span>
            </div>
            <p style={{ font: "400 12.5px/1.6 'Space Grotesk', sans-serif", color: "var(--sp-dark-muted)", margin: 0 }}>
              The free, open-source DAW. Record, edit, mix, and generate — with local AI and a guitar rig built in.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <div className="sp-footer__heading">{column.heading}</div>
              <ul className="sp-footer__list">
                {column.links.map((link) => (
                  <li key={link.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {link.icon === "github" ? <GitFork aria-hidden="true" size={12} strokeWidth={1.8} /> : null}
                    {link.to ? (
                      <Link to={link.to}>{link.label}</Link>
                    ) : (
                      <a href={link.href} rel="noreferrer">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="sp-footer__bar">
          <span>
            AGPLv3{release ? ` · v${release.version}` : ""}
            {released ? ` · released ${released}` : ""}
          </span>
          <span>
            <a href={DOWNLOAD_PATHS.releaseMetadataLatest}>/releases/latest.json</a> ·{" "}
            <Link to={`${V2_PATHS.releases}#endpoints`}>appcasts</Link> · <a href="/sitemap.xml">sitemap</a>
          </span>
        </div>
      </div>
    </footer>
  );
};

/** Scrolls to `location.hash` once the lazily loaded page has committed the target. */
const useHashScroll = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = decodeURIComponent(location.hash.slice(1));
    let attempts = 0;
    let frame = 0;

    const tryScroll = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: getPrefersReducedMotion() ? "auto" : "smooth", block: "start" });
        return;
      }

      if (attempts++ < 60) {
        frame = window.requestAnimationFrame(tryScroll);
      }
    };

    frame = window.requestAnimationFrame(tryScroll);
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);
};

const V2Shell = () => {
  const [footerLead, setFooterLeadState] = useState<ReactNode | null>(null);
  const setFooterLead = useCallback((node: ReactNode | null) => setFooterLeadState(node), []);

  useHashScroll();

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
        <V2Nav />
        <main id="sp-main">
          <Outlet />
        </main>
        <V2Footer lead={footerLead} />
      </div>
    </FooterLeadContext.Provider>
  );
};

export default V2Shell;
