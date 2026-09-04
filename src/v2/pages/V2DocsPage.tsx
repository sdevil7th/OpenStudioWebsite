import { Book, Bug, ChevronRight, GitFork } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { blogPosts } from "@/data/blogs";
import { REPO, V2_PATHS, blogPostPath, docPath } from "../content";
import { DOC_GROUPS, docsInGroup } from "../docs";
import { formatDate } from "../format";
import { ArrowLink, Cta, Eyebrow, GradIcon, Kicker } from "../primitives";
import { useSpReveal } from "../useSpReveal";
import { categoryOf } from "./V2BlogPage";

const V2DocsPage = () => {
  useSpReveal();

  const latestPosts = blogPosts.slice(0, 3);

  return (
    <>
      <PageSeo
        description="Setup guides, workflow walkthroughs, keyboard shortcuts, scripting reference, and troubleshooting for OpenStudio."
        path={V2_PATHS.docs}
        robots="noindex"
        title="Documentation | OpenStudio"
      />

      <div className="sp-container" data-sp-reveal="hero" style={{ paddingTop: 64 }}>
        <h1 className="sp-h1">Documentation.</h1>
        <p className="sp-lede" style={{ maxWidth: 640 }}>
          Everything from installing to scripting, written from the user manual in the repository. If something is
          missing or wrong, open an issue or edit the source on GitHub.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <Cta icon={ChevronRight} to={docPath("getting-started")}>
            Start with Getting started
          </Cta>
          <Cta href={REPO.newIssue} icon={Bug} variant="outline">
            Open an issue
          </Cta>
          <Cta href={REPO.docs} icon={GitFork} variant="outline">
            Docs source on GitHub
          </Cta>
        </div>
      </div>

      {/* Blog spotlight — the deepest content on the site right now lives there */}
      <div className="sp-container" style={{ paddingTop: 44 }}>
        <div className="sp-card sp-card--dark" data-sp-reveal="panel" style={{ padding: "28px 30px" }}>
          <div className="sp-row" style={{ gridTemplateColumns: ".8fr 1.2fr", gap: 30, alignItems: "start" }}>
            <div>
              <Eyebrow icon={Book} tone="teal">
                Deep dives
              </Eyebrow>
              <h2 className="sp-h2" style={{ fontSize: 26, marginBottom: 10 }}>
                The blog goes further than these guides.
              </h2>
              <p className="sp-body" style={{ fontSize: 14, color: "var(--sp-dark-body)", marginBottom: 16 }}>
                Long-form write-ups on how the NAM Rack, the MIDI editor, ARA2 hosting, and the AI runtime were
                built — and how to get the most out of them.
              </p>
              <ArrowLink to={V2_PATHS.blog} tone="teal">
                All posts
              </ArrowLink>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 14,
                    alignItems: "center",
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,.14)",
                  }}
                  to={blogPostPath(post.slug)}
                >
                  <span>
                    <span style={{ display: "block", font: "600 14px/1.35 'Space Grotesk', sans-serif", color: "#f7f8fa", marginBottom: 3 }}>
                      {post.title}
                    </span>
                    <span className="sp-mono" style={{ color: "var(--sp-dark-muted)" }}>
                      {categoryOf(post)} · {formatDate(post.date) ?? "—"} · {post.readTimeMinutes} min
                    </span>
                  </span>
                  <ChevronRight aria-hidden="true" size={14} strokeWidth={2} style={{ color: "var(--sp-teal-bright)" }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sp-container" style={{ paddingTop: 44, paddingBottom: 62 }}>
        <Kicker>Guides</Kicker>
        <div className="sp-grid-2" data-sp-reveal="stagger">
          {DOC_GROUPS.map((group) => (
            <div key={group.id} className="sp-card" style={{ padding: "26px 28px 22px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  font: "700 19px/1.2 'Space Grotesk', sans-serif",
                  letterSpacing: "-0.02em",
                  marginBottom: 18,
                }}
              >
                <GradIcon icon={group.icon} size={20} />
                {group.heading}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {docsInGroup(group.id).map((entry, index) => (
                  <Link
                    key={entry.slug}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "13px 0",
                      borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined,
                    }}
                    to={docPath(entry.slug)}
                  >
                    <span style={{ color: "var(--sp-accent)", paddingTop: 2 }}>
                      <ChevronRight aria-hidden="true" size={14} strokeWidth={2} />
                    </span>
                    <span>
                      <span
                        style={{
                          display: "block",
                          font: "600 14px/1.35 'Space Grotesk', sans-serif",
                          marginBottom: 3,
                        }}
                      >
                        {entry.title}
                      </span>
                      <span className="sp-body" style={{ display: "block", fontSize: 12.5, lineHeight: 1.55 }}>
                        {entry.summary}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default V2DocsPage;
