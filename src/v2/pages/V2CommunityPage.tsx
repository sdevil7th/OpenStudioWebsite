import { Book, Bug, GitFork, Map, Scale, Star, Tag, Users, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { githubFallbackSnapshot } from "@/lib/github";
import { V2_PATHS } from "../content";
import { ArrowLink, Cta, Eyebrow, GradIcon } from "../primitives";

interface CommunityCard {
  icon: ComponentType<LucideProps>;
  title: string;
  copy: string;
  meta: string;
  to?: string;
  href?: string;
}

const CARDS: CommunityCard[] = [
  {
    icon: Bug,
    title: "Report a bug",
    copy: "What to include: OS and version, audio device and buffer size, the steps that trigger it, and the project file if you can share it.",
    meta: "A good report is as useful as a patch.",
    href: `${githubFallbackSnapshot.repositoryUrl}/issues`,
  },
  {
    icon: GitFork,
    title: "Contribute",
    copy: "Build from source, read the project layout, pick up a good first issue, and follow the code style. Pull requests are reviewed in the open.",
    meta: "C++ · CMake · Lua",
    href: githubFallbackSnapshot.repositoryUrl,
  },
  {
    icon: Map,
    title: "Roadmap",
    copy: "What is next, what is parked, and what is explicitly not planned. Priorities move — the reasoning is public.",
    meta: "Updated per release",
    href: githubFallbackSnapshot.repositoryUrl,
  },
  {
    icon: Tag,
    title: "Releases",
    copy: "The full changelog, plus the public release metadata endpoints the app itself reads for update checks.",
    meta: "/releases/latest.json",
    to: V2_PATHS.releases,
  },
  {
    icon: Book,
    title: "Blog",
    copy: "Development notes from the maintainer: what broke, what got faster, and why a decision went the way it did.",
    meta: "6 posts",
    to: V2_PATHS.blog,
  },
];

const STATS: { icon: ComponentType<LucideProps>; label: string; value: string }[] = [
  { icon: Star, label: "stars", value: "0,000" },
  { icon: Tag, label: "releases", value: "00" },
  { icon: Users, label: "contributors", value: "00" },
  { icon: Scale, label: "license", value: "AGPLv3" },
];

const V2CommunityPage = () => (
  <>
    <PageSeo
      description="Report bugs, contribute code, read the roadmap, and follow development."
      path={V2_PATHS.community}
      robots="noindex"
      title="Community & Contributing | OpenStudio"
    />

    <div className="sp-container" style={{ paddingTop: 64 }}>
      <Eyebrow icon={Users}>AGPLv3 · Developed in the open</Eyebrow>
      <h1 className="sp-h1">Build it with us.</h1>
      <p className="sp-lede" style={{ maxWidth: 640 }}>
        OpenStudio is AGPLv3 and developed in the open. Bug reports are as useful as pull requests.
      </p>
    </div>

    <div className="sp-container" style={{ paddingTop: 40 }}>
      <div className="sp-grid-3">
        {CARDS.map((card) => {
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
                <div className="sp-mono">{card.meta}</div>
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
            <a key={card.title} className="sp-card" href={card.href} rel="noreferrer" style={style}>
              {inner}
            </a>
          );
        })}
      </div>
    </div>

    {/* AGPLv3 dark band */}
    <div className="sp-container" style={{ paddingTop: 44 }}>
      <div
        className="sp-dark-panel sp-row"
        style={{
          gridTemplateColumns: "1fr auto",
          borderRadius: 18,
          padding: "38px 40px",
          gap: 36,
        }}
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
            <ArrowLink href={githubFallbackSnapshot.repositoryUrl} tone="teal">
              Browse the source
            </ArrowLink>
            <ArrowLink href={`${githubFallbackSnapshot.repositoryUrl}/issues`} tone="teal">
              Good first issues
            </ArrowLink>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11, minWidth: 180 }}>
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className="sp-mono"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 14,
                color: "var(--sp-dark-body)",
                borderBottom: index < STATS.length - 1 ? "1px solid rgba(255,255,255,.16)" : undefined,
                paddingBottom: index < STATS.length - 1 ? 10 : 0,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <stat.icon aria-hidden="true" size={12} strokeWidth={1.8} />
                {stat.label}
              </span>
              <span style={{ color: "#f7f8fa" }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* CTA row */}
    <div className="sp-container" style={{ padding: "44px 34px 62px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <Cta href={`${githubFallbackSnapshot.repositoryUrl}/issues`} icon={GitFork}>
        Open a good first issue
      </Cta>
      <Cta href={githubFallbackSnapshot.repositoryUrl} icon={Map} variant="outline">
        Read the roadmap
      </Cta>
      <Cta to={V2_PATHS.docs} variant="outline" icon={Users}>
        Where to ask for help
      </Cta>
    </div>
  </>
);

export default V2CommunityPage;
