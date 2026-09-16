import { Book, Bug, GitFork, LifeBuoy, Mail, Map, Scale, Star, Tag, Users, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { blogPosts } from "@/data/blogs";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { CONTACT_EMAIL, REPO, SUPPORT_EMAIL } from "@/data/siteContent";
import { SITE_PATHS, docPath } from "@/constants/routes";
import { formatCount, formatDate } from "@/lib/format";
import { ArrowLink, Cta, Eyebrow, GradIcon } from "@/components/ui/primitives";
import { SponsorButton } from "@/components/SponsorButton";
import { useSpReveal } from "@/hooks/useSpReveal";

interface CommunityCard {
  icon: ComponentType<LucideProps>;
  title: string;
  copy: string;
  meta: string;
  to?: string;
  href?: string;
}

const CommunityPage = () => {
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
      copy: "What is next, what is being explored, and what is explicitly not planned. It describes direction rather than dates, and the reasoning is out in the open.",
      meta: "Product direction, not a delivery schedule",
      to: SITE_PATHS.roadmap,
    },
    {
      icon: Tag,
      title: "Releases",
      copy: "Every published build with its notes, plus the public release metadata endpoints the app itself reads for update checks.",
      meta: `${formatCount(snapshot.releaseCount ?? null)} releases · latest ${snapshot.latestRelease?.tagName ?? "—"}`,
      to: SITE_PATHS.releases,
    },
    {
      icon: Book,
      title: "Blog",
      copy: "Development notes from the maintainer: what broke, what got faster, and why a decision went the way it did.",
      meta: `${blogPosts.length} posts · latest ${formatDate(blogPosts[0]?.date) ?? "—"}`,
      to: SITE_PATHS.blog,
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
        path={SITE_PATHS.community}
        title="Community & Contributing | OpenStudio"
      />

      <div className="sp-container pt-[64px]" data-sp-reveal="hero">
        <Eyebrow icon={Users}>AGPLv3 · Developed in the open</Eyebrow>
        <h1 className="sp-h1">Build it with us.</h1>
        <p className="sp-lede max-w-[640px]">
          OpenStudio is AGPLv3 and developed in the open on GitHub. Bug reports are as useful as pull requests.
        </p>
        <div className="flex items-center gap-[14px] flex-wrap mt-[22px]">
          <SponsorButton />
          <span className="sp-mono">Sponsoring the maintainer funds development time and CI.</span>
        </div>
      </div>

      <div className="sp-container pt-[40px]">
        <div className="sp-grid-3" data-sp-reveal="stagger">
          {cards.map((card) => {
            const inner = (
              <>
                <div>
                  <GradIcon icon={card.icon} size={22} />
                </div>
                <div className="[font:700_20px/1.2_'Space_Grotesk',_sans-serif] tracking-[-0.02em]">{card.title}</div>
                <p className="sp-body text-[13.5px] leading-[1.6] flex-1">{card.copy}</p>
                <div className="flex justify-between items-center [border-top:1px_solid_var(--sp-hairline)] pt-[12px] gap-[10px]">
                  <div className="sp-mono [overflow-wrap:anywhere]">{card.meta}</div>
                  <span className="text-[var(--sp-accent)] font-[600]" aria-hidden="true">
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
      <div className="sp-container pt-[44px]">
        <div
          className="sp-dark-panel sp-row sp-agpl-panel min-[901px]:grid-cols-[1fr_auto] gap-[36px]"
          data-sp-reveal="panel"
        >
          <div>
            <h2 className="sp-h2 text-[32px] mb-[12px]">Free under AGPLv3. All of it.</h2>
            <p className="sp-body text-[var(--sp-dark-body)] max-w-[470px] mb-[20px]">
              There is no trial, no paid tier, and no account. The full source is public, so you can read it, build it,
              fork it, and send patches back.
            </p>
            <div className="flex gap-[20px] flex-wrap">
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
          <div className="flex flex-col gap-[11px] min-w-[200px]">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="sp-mono flex justify-between gap-[14px] text-[var(--sp-dark-body)]"
                style={{
                  borderBottom: index < stats.length - 1 ? "1px solid rgba(255,255,255,.16)" : undefined,
                  paddingBottom: index < stats.length - 1 ? 10 : 0,
                }}
              >
                <span className="flex items-center gap-[7px]">
                  <stat.icon aria-hidden="true" size={12} strokeWidth={1.8} />
                  {stat.label}
                </span>
                <span className="text-[#f7f8fa]">{stat.value}</span>
              </div>
            ))}
            <span className="sp-mono text-[10px] text-[var(--sp-dark-muted)] mt-[4px]">
              {status === "ready" ? "Live from GitHub" : `Snapshot from ${formatDate(snapshot.fetchedAt)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div id="contact" className="sp-container pt-[44px]" data-sp-reveal="rise">
        <div className="sp-card p-[26px_28px] flex gap-[20px] items-center flex-wrap">
          <div className="flex-1 min-w-[260px]">
            <div className="[font:700_20px/1.2_'Space_Grotesk',_sans-serif] tracking-[-0.02em] mb-[6px]">
              Contact the maintainer
            </div>
            <p className="sp-body text-[13.5px] leading-[1.6]">
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
      <div className="sp-container pt-[44px] pb-[62px] flex items-center gap-[16px] flex-wrap" data-sp-reveal="stagger">
        <Cta href={REPO.issues} icon={GitFork}>
          Pick up an open issue
        </Cta>
        <Cta icon={Map} to={SITE_PATHS.roadmap} variant="outline">
          Read the roadmap
        </Cta>
        <Cta icon={LifeBuoy} to={docPath("faq")} variant="outline">
          FAQ
        </Cta>
      </div>
    </>
  );
};

export default CommunityPage;
