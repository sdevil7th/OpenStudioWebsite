import { Fragment } from "react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { privacyDocument, securityDocument, termsDocument, type LegalDocument } from "@/data/legal";
import { SITE_PATHS } from "@/constants/routes";
import { Eyebrow, Kicker } from "@/components/ui/primitives";
import { useSpReveal } from "@/hooks/useSpReveal";

export type LegalKind = "privacy" | "terms" | "security";

const DOCUMENTS: Record<LegalKind, { document: LegalDocument; path: string }> = {
  privacy: { document: privacyDocument, path: SITE_PATHS.privacy },
  terms: { document: termsDocument, path: SITE_PATHS.terms },
  security: { document: securityDocument, path: SITE_PATHS.security },
};

// Preserve the shared policy text while resolving its historical contact link.
const rewriteLegalHref = (href: string) => {
  if (href === "/privacy") return SITE_PATHS.privacy;
  if (href === "/terms") return SITE_PATHS.terms;
  if (href === "/security") return SITE_PATHS.security;
  if (href === "/download") return SITE_PATHS.download;
  if (href === "/releases") return SITE_PATHS.releases;
  if (href === "/contact") return `${SITE_PATHS.community}#contact`;
  return href;
};

const LegalBody = ({ kind }: { kind: LegalKind }) => {
  const { document } = DOCUMENTS[kind];

  useSpReveal();

  return (
    <div className="sp-container pt-[64px] pb-[72px]">
      <div className="max-w-[760px]" data-sp-reveal="hero">
        <Eyebrow>{document.eyebrow}</Eyebrow>
        <h1 className="sp-h1">{document.title}</h1>
        <p className="sp-lede">{document.summary}</p>
      </div>

      <div className="sp-article-layout mt-[14px]">
        <div className="flex flex-col gap-[18px]" data-sp-reveal="stagger">
          {document.sections.map((section) => (
            <section key={section.title} className="sp-card p-[26px_28px]">
              <h2 className="[font:700_20px/1.25_'Space_Grotesk',_sans-serif] tracking-[-0.02em] m-[0_0_12px]">
                {section.title}
              </h2>
              <div className="flex flex-col gap-[10px]">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="sp-body">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="sp-doc-list">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        <aside data-sp-reveal="rise">
          <Kicker>At a glance</Kicker>
          <div className="sp-card sp-card--tight overflow-hidden mb-[26px]">
            {document.facts.map((fact, index) => (
              <Fragment key={fact.label}>
                <div
                  className="sp-doc-kv__row [grid-template-columns:1fr] gap-[3px]"
                  style={{ borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined }}
                >
                  <span className="sp-mono">{fact.label}</span>
                  <span className="sp-doc-kv__key text-[13.5px]">{fact.value}</span>
                </div>
              </Fragment>
            ))}
          </div>
          {document.links?.length ? (
            <>
              <Kicker>Related</Kicker>
              <div className="flex flex-col gap-[8px]">
                {document.links.map((link) => {
                  const href = rewriteLegalHref(link.href);
                  return href.startsWith("/") ? (
                    <Link key={link.label} className="sp-text-link [align-self:flex-start] text-[13.5px]" to={href}>
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      className="sp-text-link [align-self:flex-start] text-[13.5px]"
                      href={href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
};

const LegalPage = ({ kind }: { kind: LegalKind }) => {
  const { document, path } = DOCUMENTS[kind];

  return (
    <>
      <PageSeo description={document.seo.description} path={path} title={document.seo.title} />
      <LegalBody key={kind} kind={kind} />
    </>
  );
};

export default LegalPage;
