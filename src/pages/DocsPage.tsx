import { Book, Bug, ChevronRight, GitFork } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { blogPosts } from "@/data/blogs";
import { REPO } from "@/data/siteContent";
import { SITE_PATHS, blogPostPath, docPath } from "@/constants/routes";
import { DOC_GROUPS, docsInGroup } from "@/features/docs/index";
import { formatDate } from "@/lib/format";
import { ArrowLink, Cta, Eyebrow, GradIcon, Kicker } from "@/components/ui/primitives";
import { useSpReveal } from "@/hooks/useSpReveal";
import { categoryOf } from "@/data/blogCategories";

const DocsPage = () => {
  useSpReveal();

  const latestPosts = blogPosts.slice(0, 3);

  return (
    <>
      <PageSeo
        description="Setup guides, workflow walkthroughs, keyboard shortcuts, scripting reference, and troubleshooting for OpenStudio."
        path={SITE_PATHS.docs}
        title="Documentation | OpenStudio"
      />

      <div className="sp-container pt-[64px]" data-sp-reveal="hero">
        <h1 className="sp-h1">Documentation.</h1>
        <p className="sp-lede max-w-[640px]">
          Everything from installing to scripting, written from the user manual in the repository. If something is
          missing or wrong, open an issue or edit the source on GitHub.
        </p>
        <div className="flex items-center gap-[14px] flex-wrap">
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
      <div className="sp-container pt-[44px]">
        <div className="sp-card sp-card--dark p-[28px_30px]" data-sp-reveal="panel">
          <div className="sp-row min-[901px]:grid-cols-[.8fr_1.2fr] gap-[30px] items-start">
            <div>
              <Eyebrow icon={Book} tone="teal">
                Deep dives
              </Eyebrow>
              <h2 className="sp-h2 text-[26px] mb-[10px]">The blog goes further than these guides.</h2>
              <p className="sp-body text-[14px] text-[var(--sp-dark-body)] mb-[16px]">
                Long-form write-ups on how the NAM Rack, the MIDI editor, ARA2 hosting, and the AI runtime were built,
                and how to get the most out of them.
              </p>
              <ArrowLink to={SITE_PATHS.blog} tone="teal">
                All posts
              </ArrowLink>
            </div>
            <div className="flex flex-col gap-[10px]">
              {latestPosts.map((post) => (
                <Link
                  className="grid [grid-template-columns:1fr_auto] gap-[14px] items-center p-[12px_14px] rounded-[8px] [border:1px_solid_rgba(255,255,255,.14)]"
                  key={post.slug}
                  to={blogPostPath(post.slug)}
                >
                  <span>
                    <span className="block [font:600_14px/1.35_'Space_Grotesk',_sans-serif] text-[#f7f8fa] mb-[3px]">
                      {post.title}
                    </span>
                    <span className="sp-mono text-[var(--sp-dark-muted)]">
                      {categoryOf(post)} · {formatDate(post.date) ?? "—"} · {post.readTimeMinutes} min
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    size={14}
                    strokeWidth={2}
                    style={{ color: "var(--sp-teal-bright)" }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sp-container pt-[44px] pb-[62px]">
        <Kicker>Guides</Kicker>
        <div className="sp-grid-2" data-sp-reveal="stagger">
          {DOC_GROUPS.map((group) => (
            <div key={group.id} className="sp-card p-[26px_28px_22px]">
              <div className="flex items-center gap-[10px] [font:700_19px/1.2_'Space_Grotesk',_sans-serif] tracking-[-0.02em] mb-[18px]">
                <GradIcon icon={group.icon} size={20} />
                {group.heading}
              </div>
              <div className="flex flex-col">
                {docsInGroup(group.id).map((entry, index) => (
                  <Link
                    className="flex gap-[12px] p-[13px_0]"
                    key={entry.slug}
                    style={{ borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined }}
                    to={docPath(entry.slug)}
                  >
                    <span className="text-[var(--sp-accent)] pt-[2px]">
                      <ChevronRight aria-hidden="true" size={14} strokeWidth={2} />
                    </span>
                    <span>
                      <span className="block [font:600_14px/1.35_'Space_Grotesk',_sans-serif] mb-[3px]">
                        {entry.title}
                      </span>
                      <span className="sp-body block text-[12.5px] leading-[1.55]">{entry.summary}</span>
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

export default DocsPage;
