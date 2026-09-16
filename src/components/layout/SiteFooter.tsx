import type { ReactNode } from "react";
import { GitFork } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE_NAME, DOWNLOAD_PATHS } from "@/constants/site";
import { SITE_PATHS, docPath } from "@/constants/routes";
import { CONTACT_EMAIL, REPO, OPENSTUDIO_MARK } from "@/data/siteContent";
import { SponsorButton } from "@/components/SponsorButton";
import { openPrivacyChoices } from "@/lib/analyticsConsent";
import { formatDate } from "@/lib/format";
import { useReleaseInfo } from "@/hooks/useReleaseInfo";

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
      { label: "Download", to: SITE_PATHS.download },
      { label: "Features", to: SITE_PATHS.features },
      { label: "NAM Rack", to: SITE_PATHS.namRack },
      { label: "AI Tools", to: SITE_PATHS.ai },
      { label: "Compare", to: SITE_PATHS.compare },
      { label: "Releases", to: SITE_PATHS.releases },
      { label: "System requirements", to: `${SITE_PATHS.download}#requirements` },
    ],
  },
  {
    heading: "Features",
    links: [
      { label: "Recording", to: `${SITE_PATHS.features}#recording` },
      { label: "MIDI & instruments", to: `${SITE_PATHS.features}#midi` },
      { label: "Mixing & routing", to: `${SITE_PATHS.features}#mixing` },
      { label: "Plugins & FX", to: `${SITE_PATHS.features}#plugins` },
      { label: "Pitch editing", to: `${SITE_PATHS.features}#pitch` },
      { label: "Scripting", to: `${SITE_PATHS.features}#scripting` },
      { label: "Export & formats", to: `${SITE_PATHS.features}#export` },
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
      { label: "Contribute", to: SITE_PATHS.community },
      { label: "Roadmap", to: SITE_PATHS.roadmap },
      { label: "Report a bug", href: REPO.issues },
      { label: "Blog", to: SITE_PATHS.blog },
      { label: "Contact", href: `mailto:${CONTACT_EMAIL}` },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "License (AGPLv3)", href: REPO.license },
      { label: "Privacy", to: SITE_PATHS.privacy },
      { label: "Terms", to: SITE_PATHS.terms },
      { label: "Security", to: SITE_PATHS.security },
    ],
  },
];

const SiteFooter = ({ lead }: { lead: ReactNode | null }) => {
  const release = useReleaseInfo();
  const released = formatDate(release?.publishedAt);

  return (
    <footer className="sp-footer">
      {lead ? <div className="sp-footer__lead">{lead}</div> : null}
      <div className="sp-container pt-[48px] pb-[30px]">
        <div className="sp-footer__grid">
          <div>
            <div className="flex items-center gap-[8px] mb-[12px]">
              <img className="w-[22px] h-[22px]" alt="" src={OPENSTUDIO_MARK} />
              <span className="[font:700_14px/1_'Space_Grotesk',_sans-serif] text-[#f7f8fa]">{SITE_NAME}</span>
            </div>
            <p className="[font:400_12.5px/1.6_'Space_Grotesk',_sans-serif] text-[var(--sp-dark-muted)] m-[0px]">
              A free, open-source DAW for recording, editing, mixing, and generating, with local AI and a guitar rig
              built in.
            </p>
            <SponsorButton className="mt-[16px]" />
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <div className="sp-footer__heading">{column.heading}</div>
              <ul className="sp-footer__list">
                {column.links.map((link) => (
                  <li className="flex items-center gap-[6px]" key={link.label}>
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
            <button className="underline underline-offset-4" onClick={openPrivacyChoices} type="button">
              Privacy choices
            </button>{" "}
            &middot; <a href={DOWNLOAD_PATHS.releaseMetadataLatest}>/releases/latest.json</a> ·{" "}
            <Link to={`${SITE_PATHS.releases}#endpoints`}>appcasts</Link> · <a href="/sitemap.xml">sitemap</a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
