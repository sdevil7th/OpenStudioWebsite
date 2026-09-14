import { Fragment } from "react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { privacyDocument, securityDocument, termsDocument, type LegalDocument } from "@/data/legal";
import { V2_PATHS } from "../content";
import { Eyebrow, Kicker } from "../primitives";
import { useSpReveal } from "../useSpReveal";

export type LegalKind = "privacy" | "terms" | "security";

const DOCUMENTS: Record<LegalKind, { document: LegalDocument; path: string }> = {
  privacy: { document: privacyDocument, path: V2_PATHS.privacy },
  terms: { document: termsDocument, path: V2_PATHS.terms },
  security: { document: securityDocument, path: V2_PATHS.security },
};

// Legal copy links between the three documents using the old site's paths;
// rewrite them so a reader stays in the preview shell.
const rewriteLegalHref = (href: string) => {
  if (href === "/privacy") return V2_PATHS.privacy;
  if (href === "/terms") return V2_PATHS.terms;
  if (href === "/security") return V2_PATHS.security;
  if (href === "/download") return V2_PATHS.download;
  if (href === "/releases") return V2_PATHS.releases;
  return href;
};

const LegalBody = ({ kind }: { kind: LegalKind }) => {
  const { document } = DOCUMENTS[kind];

  useSpReveal();

  return (
    <div className="sp-container" style={{ paddingTop: 64, paddingBottom: 72 }}>
      <div data-sp-reveal="hero" style={{ maxWidth: 760 }}>
        <Eyebrow>{document.eyebrow}</Eyebrow>
        <h1 className="sp-h1">{document.title}</h1>
        <p className="sp-lede">{document.summary}</p>
      </div>

      <div className="sp-article-layout" style={{ marginTop: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }} data-sp-reveal="stagger">
          {document.sections.map((section) => (
            <section key={section.title} className="sp-card" style={{ padding: "26px 28px" }}>
              <h2 style={{ font: "700 20px/1.25 'Space Grotesk', sans-serif", letterSpacing: "-0.02em", margin: "0 0 12px" }}>
                {section.title}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
          <div className="sp-card sp-card--tight" style={{ overflow: "hidden", marginBottom: 26 }}>
            {document.facts.map((fact, index) => (
              <Fragment key={fact.label}>
                <div className="sp-doc-kv__row" style={{ gridTemplateColumns: "1fr", gap: 3, borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined }}>
                  <span className="sp-mono">{fact.label}</span>
                  <span className="sp-doc-kv__key" style={{ fontSize: 13.5 }}>
                    {fact.value}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
          {document.links?.length ? (
            <>
              <Kicker>Related</Kicker>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {document.links.map((link) => {
                  const href = rewriteLegalHref(link.href);
                  return href.startsWith("/") ? (
                    <Link key={link.label} className="sp-text-link" style={{ alignSelf: "flex-start", fontSize: 13.5 }} to={href}>
                      {link.label}
                    </Link>
                  ) : (
                    <a key={link.label} className="sp-text-link" href={href} rel="noreferrer" style={{ alignSelf: "flex-start", fontSize: 13.5 }} target="_blank">
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

const V2LegalPage = ({ kind }: { kind: LegalKind }) => {
  const { document, path } = DOCUMENTS[kind];

  return (
    <>
      <PageSeo description={document.seo.description} path={path} robots="noindex" title={document.seo.title} />
      <LegalBody key={kind} kind={kind} />
    </>
  );
};

export default V2LegalPage;
