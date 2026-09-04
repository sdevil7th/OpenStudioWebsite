import { ArrowLeft, ArrowRight, ChevronDown, GitFork } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { V2_PATHS, docPath } from "../content";
import { DocBlocks } from "../docs/DocBlocks";
import { DOC_GROUPS, adjacentDocs, docsInGroup, getDoc, hasDocContent, loadDocContent } from "../docs";
import type { DocContent, DocMeta } from "../docs/types";
import { formatDate } from "../format";
import { Kicker } from "../primitives";
import { useMediaQuery } from "../useMediaQuery";
import { useReleaseInfo } from "../useReleaseInfo";
import { useSpReveal } from "../useSpReveal";

const DocSidebar = ({ current, content }: { current: DocMeta; content: DocContent | null }) => {
  const sidebarExpanded = !useMediaQuery("(max-width: 900px)");
  const headings = content?.blocks.filter((block): block is Extract<typeof block, { type: "h2" }> => block.type === "h2") ?? [];

  return (
    <aside className="sp-docs-sidebar" data-sp-reveal="rise">
      <details className="sp-docs-group" open={sidebarExpanded || undefined}>
        <summary className="sp-docs-group__summary">
          <Kicker>Documentation</Kicker>
          <ChevronDown aria-hidden="true" className="sp-docs-group__chevron" size={14} strokeWidth={2} />
        </summary>
        <div className="sp-docs-group__body sp-docs-nav">
          {DOC_GROUPS.map((group) => (
            <div key={group.id} className="sp-docs-nav__group">
              <div className="sp-docs-nav__heading">{group.heading}</div>
              {docsInGroup(group.id).map((doc) => (
                <Link
                  key={doc.slug}
                  aria-current={doc.slug === current.slug ? "page" : undefined}
                  className={`sp-docs-nav__link${doc.slug === current.slug ? " sp-docs-nav__link--active" : ""}`}
                  to={docPath(doc.slug)}
                >
                  {doc.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </details>
      {headings.length > 0 ? (
        <details className="sp-docs-group" open={sidebarExpanded || undefined}>
          <summary className="sp-docs-group__summary">
            <Kicker>On this page</Kicker>
            <ChevronDown aria-hidden="true" className="sp-docs-group__chevron" size={14} strokeWidth={2} />
          </summary>
          <div className="sp-docs-group__body sp-docs-toc">
            {headings.map((heading) => (
              <a key={heading.id} className="sp-docs-toc__link" href={`#${heading.id}`}>
                {heading.text}
              </a>
            ))}
          </div>
        </details>
      ) : null}
    </aside>
  );
};

const AdjacentCard = ({ doc, direction }: { doc: DocMeta; direction: "previous" | "next" }) => (
  <Link className={`sp-card sp-doc-adjacent sp-doc-adjacent--${direction}`} to={docPath(doc.slug)}>
    <span className="sp-kicker" style={{ marginBottom: 6 }}>
      {direction === "previous" ? "Previous" : "Next"}
    </span>
    <span className="sp-doc-adjacent__title">
      {direction === "previous" ? <ArrowLeft aria-hidden="true" size={15} strokeWidth={2} /> : null}
      {doc.title}
      {direction === "next" ? <ArrowRight aria-hidden="true" size={15} strokeWidth={2} /> : null}
    </span>
    <span className="sp-body" style={{ fontSize: 13, lineHeight: 1.55 }}>
      {doc.summary}
    </span>
  </Link>
);

const DocArticle = ({ doc }: { doc: DocMeta }) => {
  const [content, setContent] = useState<DocContent | null>(null);
  const [failed, setFailed] = useState(false);
  const release = useReleaseInfo();
  const group = DOC_GROUPS.find((entry) => entry.id === doc.group);
  const { previous, next } = adjacentDocs(doc.slug);

  useSpReveal();

  useEffect(() => {
    let active = true;
    loadDocContent(doc.slug)
      .then((loaded) => {
        if (active) {
          setContent(loaded);
        }
      })
      .catch(() => {
        if (active) {
          setFailed(true);
        }
      });
    return () => {
      active = false;
    };
  }, [doc.slug]);

  return (
    <div className="sp-container" style={{ paddingLeft: 0, paddingRight: 0, maxWidth: 1240 }}>
      <div className="sp-docs-layout" style={{ borderBottom: "1px solid var(--sp-hairline)" }}>
        <DocSidebar content={content} current={doc} />
        <article className="sp-docs-article" style={{ maxWidth: 780 }}>
          <header data-sp-reveal="hero">
            <Kicker>Docs · {group?.heading}</Kicker>
            <h1 className="sp-h1" style={{ fontSize: "clamp(32px, 4vw, 42px)", lineHeight: 1.08, marginBottom: 14 }}>
              {doc.title}
            </h1>
            <p className="sp-lede" style={{ maxWidth: 640 }}>
              {doc.summary}
            </p>
            <div className="sp-doc-meta">
              {content ? <span className="sp-mono">Last updated {formatDate(content.updated)}</span> : null}
              {release ? <span className="sp-mono">Applies to v{release.version}</span> : null}
              <a className="sp-mono sp-doc-meta__edit" href={doc.sourceUrl} rel="noreferrer" target="_blank">
                <GitFork aria-hidden="true" size={12} strokeWidth={1.8} />
                Source on GitHub
              </a>
            </div>
          </header>

          {content ? (
            <div className="sp-doc-body">
              <DocBlocks blocks={content.blocks} />
            </div>
          ) : failed ? (
            <p className="sp-body">This page is still being written. The upstream source is linked above.</p>
          ) : (
            <p aria-live="polite" className="sp-mono">
              Loading…
            </p>
          )}

          <nav aria-label="Adjacent pages" className="sp-doc-adjacent-row" data-sp-reveal="stagger">
            {previous ? <AdjacentCard direction="previous" doc={previous} /> : <span />}
            {next ? <AdjacentCard direction="next" doc={next} /> : null}
          </nav>
        </article>
      </div>
    </div>
  );
};

const V2DocPage = () => {
  const { slug } = useParams();
  const doc = getDoc(slug);

  if (!doc || !hasDocContent(doc.slug)) {
    return <Navigate replace to={V2_PATHS.docs} />;
  }

  return (
    <>
      <PageSeo
        description={doc.summary}
        path={docPath(doc.slug)}
        robots="noindex"
        title={`${doc.title} — OpenStudio Docs`}
      />
      {/* Keyed so a slug change remounts the article and re-runs the reveal observer. */}
      <DocArticle key={doc.slug} doc={doc} />
    </>
  );
};

export default V2DocPage;
