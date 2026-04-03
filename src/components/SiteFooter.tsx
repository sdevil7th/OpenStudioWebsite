import { Link } from "react-router-dom";
import { SITE_NAME, SITE_URL } from "@/constants/site";
import { footerNavigation } from "@/data/navigation";
import { contactProfile, externalLinks, footerUtilityLinks } from "@/data/siteLinks";

const SiteFooter = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0E0E0E] px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-white/36">
          {`Copyright 2026 ${SITE_NAME}. ${SITE_URL.replace("https://", "")}.`}
        </div>
        <div className="flex flex-wrap gap-6 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/38">
          {footerNavigation.map((item) => (
            <Link className="transition hover:text-primary" key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
          {externalLinks.repository ? (
            <a className="transition hover:text-primary" href={externalLinks.repository} rel="noreferrer" target="_blank">
              Repository
            </a>
          ) : null}
          {footerUtilityLinks.map((item) =>
            item.href && item.href.startsWith("/") ? (
              <Link className="transition hover:text-primary" key={item.label} to={item.href}>
                {item.label}
              </Link>
            ) : item.href ? (
              <a
                className="transition hover:text-primary"
                href={item.href}
                key={item.label}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                target={item.href.startsWith("http") ? "_blank" : undefined}
              >
                {item.label}
              </a>
            ) : (
              <span className="text-white/22" key={item.label}>
                {item.label}
              </span>
            ),
          )}
        </div>
        <a className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary transition hover:text-primary" href={`mailto:${contactProfile.email}`}>
          {contactProfile.email}
        </a>
      </div>
    </footer>
  );
};

export default SiteFooter;
