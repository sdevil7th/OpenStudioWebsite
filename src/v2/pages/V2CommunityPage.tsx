import { Book, Bug, GitFork, LifeBuoy, Mail, Map, Scale, Star, Tag, Users, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { blogPosts } from "@/data/blogs";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { CONTACT_EMAIL, REPO, SUPPORT_EMAIL, V2_PATHS, docPath } from "../content";
import { formatCount, formatDate } from "../format";
import { ArrowLink, Cta, Eyebrow, GradIcon } from "../primitives";
import { useSpReveal } from "../useSpReveal";

interface CommunityCard {
  icon: ComponentType<LucideProps>;
  title: string;
  copy: string;
  meta: string;
  to?: string;
  href?: string;
}

const V2CommunityPage = () => {
  const { snapshot, status } = useGithubRepoSnapshot();

  useSpReveal();

  const cards: CommunityCard[] = [
    {
      icon: Bug,
      title: "Report a bug",
      copy: "What to include: OS and version, audio device and buffer size, the steps that trigger it, and the project file if you can share it.",
      meta: `${formatCount(snapshot.stats.openIssues)} open issues`,
      href: REPO.newIssue,
    },
    {
      icon: GitFork,
      title: "Contribute",
      copy: "Build from source, read the project layout, pick up an open issue, and follow the code style. Pull requests are reviewed in the open.",
      meta: `${snapshot.primaryLanguage} · TypeScript · CMake · Lua`,
      href: REPO.url,
    },
    {
      icon: Map,
      title: "Roadmap",
      copy: "What is next, what is being explored, and what is explicitly not planned. Direction, not dates — the reasoning is public.",
      meta: "Product direction, not a delivery schedule",
      to: V2_PATHS.roadmap,
    },
    {
      icon: Tag,
      title: "Releases",
      copy: "Every published build with its notes, plus the public release metadata endpoints the app itself reads for update checks.",
      meta: `${formatCount(snapshot.releaseCount ?? null)} releases · latest ${snapshot.latestRelease?.tagName ?? "—"}`,
      to: V2_PATHS.releases,
    },
    {
      icon: Book,
      title: "Blog",
      copy: "Development notes from the maintainer: what broke, what got faster, and why a decision went the way it did.",
      meta: `${blogPosts.length} posts · latest ${formatDate(blogPosts[0]?.date) ?? "—"}`,
      to: V2_PATHS.blog,
    },
    {
      icon: LifeBuoy,
      title: "Get help",
      copy: "Start with troubleshooting and the FAQ. If that does not solve it, open an issue with the details above, or email support.",
      meta: SUPPORT_EMAIL,
      to: docPath("troubleshooting"),
    },
  ];

  const stats: { icon: ComponentType<LucideProps>; label: string; value: string }[] = [
    { icon: Star, label: "stars", value: formatCount(snapshot.stats.stars) },
    { icon: GitFork, label: "forks", value: formatCount(snapshot.stats.forks) },
    { icon: Tag, label: "releases", value: formatCount(snapshot.releaseCount ?? null) },
    { icon: Users, label: "contributors", value: formatCount(snapshot.stats.contributorCount) },
    { icon: Scale, label: "license", value: snapshot.license.replace("-3.0", "v3") },
  ];

  return (
    <>
      <PageSeo
        description="Report bugs, contribute code, read the roadmap, follow development, and get help with OpenStudio."
        path={V2_PATHS.community}
        robots="noindex"
        title="Community & Contributing | OpenStudio"
      />

      <div className="sp-container" data-sp-reveal="hero" style={{ paddingTop: 64 }}>
        <Eyebrow icon={Users}>AGPLv3 · Developed in the open</Eyebrow>
        <h1 className="sp-h1">Build it with us.</h1>
        <p className="sp-lede" style={{ maxWidth: 640 }}>
          OpenStudio is AGPLv3 and developed in the open on GitHub. Bug reports are as useful as pull requests.
        </p>
      </div>

      <div className="sp-container" style={{ paddingTop: 40 }}>
        <div className="sp-grid-3" data-sp-reveal="stagger">
          {cards.map((card) => {
            const inner = (
              <>
                <div>
                  <GradIcon icon={card.icon} size={22} />
                </div>
                <div style={{ font: "700 20px/1.2 'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
                  {card.title}
                </div>
                <p className="sp-body" style={{ fontSize: 13.5, lineHeight: 1.6, flex: 1 }}>
                  {card.copy}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--sp-hairline)",
                    paddingTop: 12,
                    gap: 10,
                  }}
                >
                  <div className="sp-mono" style={{ overflowWrap: "anywhere" }}>
                    {card.meta}
                  </div>
                  <span aria-hidden="true" style={{ color: "var(--sp-accent)", fontWeight: 600 }}>
                    →
                  </span>
                </div>
              </>
            );
            const style = {
              padding: "26px 26px 24px",
              display: "flex",
              flexDirection: "column" as const,
              gap: 10,
            };

            return card.to ? (
              <Link key={card.title} className="sp-card" style={style} to={card.to}>
                {inner}
              </Link>
            ) : (
              <a key={card.title} className="sp-card" href={card.href} rel="noreferrer" style={style} target="_blank">
                {inner}
              </a>
            );
          })}
        </div>
      </div>

      {/* AGPLv3 dark band */}
      <div className="sp-container" style={{ paddingTop: 44 }}>
        <div
          className="sp-dark-panel sp-row sp-agpl-panel"
          data-sp-reveal="panel"
          style={{ gridTemplateColumns: "1fr auto", gap: 36 }}
        >
          <div>
            <h2 className="sp-h2" style={{ fontSize: 32, marginBottom: 12 }}>
              Free under AGPLv3. All of it.
            </h2>
            <p className="sp-body" style={{ color: "var(--sp-dark-body)", maxWidth: 470, marginBottom: 20 }}>
              No trial, no tiers, no account. The full source is public — read it, build it, fork it, ship patches
              back.
            </p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <ArrowLink href={REPO.url} tone="teal">
                Browse the source
              </ArrowLink>
              <ArrowLink href={REPO.issues} tone="teal">
                Open issues
              </ArrowLink>
              <ArrowLink href={REPO.pulls} tone="teal">
                Pull requests
              </ArrowLink>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, minWidth: 200 }}>
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="sp-mono"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 14,
                  color: "var(--sp-dark-body)",
                  borderBottom: index < stats.length - 1 ? "1px solid rgba(255,255,255,.16)" : undefined,
                  paddingBottom: index < stats.length - 1 ? 10 : 0,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <stat.icon aria-hidden="true" size={12} strokeWidth={1.8} />
                  {stat.label}
                </span>
                <span style={{ color: "#f7f8fa" }}>{stat.value}</span>
              </div>
            ))}
            <span className="sp-mono" style={{ fontSize: 10, color: "var(--sp-dark-muted)", marginTop: 4 }}>
              {status === "ready" ? "Live from GitHub" : `Snapshot from ${formatDate(snapshot.fetchedAt)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="sp-container" data-sp-reveal="rise" style={{ paddingTop: 44 }}>
        <div className="sp-card" style={{ padding: "26px 28px", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ font: "700 20px/1.2 'Space Grotesk', sans-serif", letterSpacing: "-0.02em", marginBottom: 6 }}>
              Contact the maintainer
            </div>
            <p className="sp-body" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
              Release feedback, collaboration, and maintainership questions go to{" "}
              <a className="sp-text-link" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              . Bugs and feature requests belong on GitHub so everyone can see them.
            </p>
          </div>
          <Cta href={`mailto:${CONTACT_EMAIL}`} icon={Mail} variant="outline">
            Email
          </Cta>
        </div>
      </div>

      {/* CTA row */}
      <div className="sp-container" data-sp-reveal="stagger" style={{ paddingTop: 44, paddingBottom: 62, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <Cta href={REPO.issues} icon={GitFork}>
          Pick up an open issue
        </Cta>
        <Cta icon={Map} to={V2_PATHS.roadmap} variant="outline">
          Read the roadmap
        </Cta>
        <Cta icon={LifeBuoy} to={docPath("faq")} variant="outline">
          FAQ
        </Cta>
      </div>
    </>
  );
};

export default V2CommunityPage;
