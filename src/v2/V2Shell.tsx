import { useEffect, useState } from "react";
import { ChevronDown, Download, GitFork, Menu, X } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { SITE_NAME, DOWNLOAD_PATHS } from "@/constants/site";
import { githubFallbackSnapshot } from "@/lib/github";
import "@/styles/v2.css";
import { BUILT_LABEL, V2_PATHS, VERSION_LABEL, VERSION_META, VISMAY_MARK } from "./content";
import { IconGradientDefs } from "./primitives";

const NAV_ITEMS = [
  { label: "Features", to: V2_PATHS.features, chevron: true },
  { label: "NAM Rack", to: V2_PATHS.namRack },
  { label: "AI Tools", to: V2_PATHS.ai },
  { label: "Docs", to: V2_PATHS.docs },
  { label: "Community", to: V2_PATHS.community, chevron: true },
];

const V2Nav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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
                {item.chevron ? (
                  <ChevronDown aria-hidden="true" size={12} strokeWidth={2.2} style={{ color: "var(--sp-mono-muted)" }} />
                ) : null}
              </NavLink>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <span className="sp-mono" style={{ fontSize: 11, whiteSpace: "nowrap" }}>
            {VERSION_META}
          </span>
          <Link className="sp-btn sp-btn--sm" to={V2_PATHS.download}>
            <Download aria-hidden="true" size={16} strokeWidth={1.8} />
            <span className="sp-btn__label">Download for macOS</span>
          </Link>
          <button
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="sp-btn sp-btn--outline sp-btn--sm sp-nav__menu-toggle"
            onClick={() => setOpen((value) => !value)}
            style={{ display: "none", padding: 9 }}
            type="button"
          >
            {open ? <X aria-hidden="true" size={16} /> : <Menu aria-hidden="true" size={16} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav
          aria-label="Primary mobile"
          style={{
            borderTop: "1px solid var(--sp-hairline)",
            padding: "14px 20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
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
        </nav>
      ) : null}
      <style>{`@media (max-width: 900px) { .sp-nav__menu-toggle { display: inline-flex !important; } }`}</style>
    </header>
  );
};

interface FooterLink {
  label: string;
  to?: string;
  href?: string;
  icon?: "github";
}

const FOOTER_COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Download", to: V2_PATHS.download },
      { label: "NAM Rack", to: V2_PATHS.namRack },
      { label: "AI Tools", to: V2_PATHS.ai },
      { label: "Releases", to: V2_PATHS.releases },
      { label: "Compare", to: V2_PATHS.compare },
      { label: "System requirements", to: `${V2_PATHS.download}#requirements` },
    ],
  },
  {
    heading: "Features",
    links: [
      { label: "Recording", to: V2_PATHS.features },
      { label: "MIDI & instruments", to: V2_PATHS.features },
      { label: "Mixing & routing", to: V2_PATHS.features },
      { label: "Plugins & FX", to: V2_PATHS.features },
      { label: "Pitch editing", to: V2_PATHS.features },
      { label: "Scripting", to: V2_PATHS.features },
      { label: "Export & formats", to: V2_PATHS.features },
    ],
  },
  {
    heading: "Learn",
    links: [
      { label: "Getting started", to: V2_PATHS.docsGettingStarted },
      { label: "First session", to: V2_PATHS.docs },
      { label: "Audio setup", to: V2_PATHS.docs },
      { label: "Plugins", to: V2_PATHS.docs },
      { label: "Shortcuts", to: V2_PATHS.docs },
      { label: "Troubleshooting", to: V2_PATHS.docs },
      { label: "FAQ", to: V2_PATHS.docs },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "GitHub", href: githubFallbackSnapshot.repositoryUrl, icon: "github" },
      { label: "Contribute", to: V2_PATHS.community },
      { label: "Roadmap", to: V2_PATHS.community },
      { label: "Support", to: V2_PATHS.community },
      { label: "Blog", to: V2_PATHS.blog },
      { label: "About", to: V2_PATHS.community },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "License (AGPLv3)", href: `${githubFallbackSnapshot.repositoryUrl}/blob/main/LICENSE` },
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Security", to: "/security" },
      { label: "Report an issue", href: `${githubFallbackSnapshot.repositoryUrl}/issues` },
    ],
  },
];

const V2Footer = () => (
  <footer className="sp-footer">
    <div className="sp-container" style={{ paddingTop: 48, paddingBottom: 30 }}>
      <div className="sp-footer__grid">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <img alt="" src={VISMAY_MARK} style={{ width: 22, height: 22 }} />
            <span style={{ font: "700 14px/1 'Space Grotesk', sans-serif", color: "#f7f8fa" }}>{SITE_NAME}</span>
          </div>
          <p style={{ font: "400 12.5px/1.6 'Space Grotesk', sans-serif", color: "var(--sp-dark-muted)", margin: 0 }}>
            The free DAW with the amp rig built in.
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
          AGPLv3 · {VERSION_LABEL} · {BUILT_LABEL}
        </span>
        <span>
          <a href={DOWNLOAD_PATHS.releaseMetadataLatest}>/releases/latest.json</a> · appcasts ·{" "}
          <a href="/sitemap.xml">sitemap</a>
        </span>
      </div>
    </div>
  </footer>
);

const V2Shell = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return (
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
      <V2Footer />
    </div>
  );
};

export default V2Shell;
