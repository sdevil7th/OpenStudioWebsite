import NotFound from "@/pages/NotFound";
import { ArrowLeft, ArrowRight, ChevronDown, GitFork } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { StaticRenderContext } from "@/lib/staticRender";
import { Link, useParams } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { getGuideJsonLd } from "@/lib/structuredData";
import { docPath } from "@/constants/routes";
import { DocBlocks } from "@/features/docs/DocBlocks";
import { DOC_GROUPS, adjacentDocs, docsInGroup, getDoc, hasDocContent, loadDocContent } from "@/features/docs/index";
import type { DocContent, DocMeta } from "@/features/docs/types";
import { formatDate } from "@/lib/format";
import { Kicker } from "@/components/ui/primitives";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSpReveal } from "@/hooks/useSpReveal";

const DocSidebar = ({ current, content }: { current: DocMeta; content: DocContent | null }) => {
  const sidebarExpanded = !useMediaQuery("(max-width: 900px)");
  const headings =
    content?.blocks.filter((block): block is Extract<typeof block, { type: "h2" }> => block.type === "h2") ?? [];

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
  <Link
    className={`sp-card sp-doc-adjacent ${direction === "next" ? "sp-doc-adjacent--next" : "sp-doc-adjacent--prev"}`}
    to={docPath(doc.slug)}
  >
    <span className="sp-kicker mb-[6px]">{direction === "previous" ? "Previous" : "Next"}</span>
    <span className="sp-doc-adjacent__title">
      {direction === "previous" ? <ArrowLeft aria-hidden="true" size={15} strokeWidth={2} /> : null}
      {doc.title}
      {direction === "next" ? <ArrowRight aria-hidden="true" size={15} strokeWidth={2} /> : null}
    </span>
    <span className="sp-body text-[13px] leading-[1.55]">{doc.summary}</span>
  </Link>
);

const DocArticle = ({ doc }: { doc: DocMeta }) => {
  const staticRender = useContext(StaticRenderContext);
  const [content, setContent] = useState<DocContent | null>(staticRender?.docContent ?? null);
  const [failed, setFailed] = useState(false);
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
    <div className="sp-container pl-[0px] pr-[0px] max-w-[1240px]">
      <div className="sp-docs-layout [border-bottom:1px_solid_var(--sp-hairline)]">
        <DocSidebar content={content} current={doc} />
        <article className="sp-docs-article max-w-[780px]">
          <header data-sp-reveal="hero">
            <Kicker>Docs · {group?.heading}</Kicker>
            <h1 className="sp-h1 text-[clamp(32px,_4vw,_42px)] leading-[1.08] mb-[14px]">{doc.title}</h1>
            <p className="sp-lede max-w-[640px]">{doc.summary}</p>
            <div className="sp-doc-meta">
              {content ? <span className="sp-mono">Last updated {formatDate(content.updated)}</span> : null}
              {content ? (
                <span className="sp-mono">
                  {content.appReference.channel === "release"
                    ? `Applies to v${content.appReference.version}`
                    : "Development build reference"}
                </span>
              ) : null}
              <a
                className="sp-mono sp-doc-meta__edit"
                href={
                  content
                    ? doc.sourceUrl.replace("/blob/main/", `/blob/${content.appReference.commit}/`)
                    : doc.sourceUrl
                }
                rel="noreferrer"
                target="_blank"
              >
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
            <section role="alert" className="sp-body">
              <p>This article could not load. Reload the page to retry, or open the source linked above.</p>
              <button
                className="mt-3 rounded border border-current px-3 py-2 focus-visible:outline"
                onClick={() => window.location.reload()}
                type="button"
              >
                Reload article
              </button>
            </section>
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

const DocPage = () => {
  const { slug } = useParams();
  const doc = getDoc(slug);

  if (!doc || !hasDocContent(doc.slug)) {
    return <NotFound />;
  }

  return (
    <>
      <PageSeo description={doc.summary} path={docPath(doc.slug)} title={`${doc.title} | OpenStudio Docs`} jsonLd={getGuideJsonLd(doc)} />
      {/* Keyed so a slug change remounts the article and re-runs the reveal observer. */}
      <DocArticle key={doc.slug} doc={doc} />
    </>
  );
};

export default DocPage;
