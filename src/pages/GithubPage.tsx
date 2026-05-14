import { Activity, ArrowRight, Clock3, FileText, GitBranch, GitFork, Github, Shield, Star, Users } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import { Button } from "@/components/ui/button";
import { designMedia } from "@/data/designMedia";
import { githubCallout, githubHero, githubHighlights, githubPillars, githubSeo } from "@/data/github";
import { externalLinks } from "@/data/siteLinks";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { trackEvent } from "@/lib/analytics";
import { formatGithubDate, formatGithubNumber, formatLanguageMix } from "@/lib/github";
import { useScrollScene } from "@/lib/gsap";

const GithubPage = () => {
  const pageRef = useRef<HTMLElement | null>(null);
  const { snapshot, status } = useGithubRepoSnapshot();
  const latestReleaseLabel = snapshot.latestRelease
    ? `${snapshot.latestRelease.name} | ${formatGithubDate(snapshot.latestRelease.publishedAt)}`
    : "No GitHub releases published yet";
  const visibleContributorLabel = `${formatGithubNumber(snapshot.stats.contributorCount)} visible ${snapshot.stats.contributorCount === 1 ? "contributor" : "contributors"}`;

  useScrollScene(pageRef, ({ prefersReducedMotion, gsap }) => {
    if (!prefersReducedMotion) {
      gsap.from("[data-github-title]", {
        y: 18,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.06,
      });
    }

    gsap.from("[data-github-metric]", {
      y: 40,
      opacity: 0,
      stagger: 0.08,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "[data-github-metrics]",
        start: "top 72%",
      },
    });

    gsap.from("[data-contributor-card]", {
      y: 34,
      opacity: 0,
      stagger: 0.06,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "[data-github-contributors]",
        start: "top 75%",
      },
    });
  });

  return (
    <main
      ref={pageRef}
      className="design-page-main route-appear"
      id="main-content"
    >
      <PageSeo {...githubSeo} />

      <div className="page-frame-wide pb-24">
        <section className="relative overflow-hidden pb-14 pt-2">
          <div className="hero-shell overflow-hidden rounded-[2.9rem] px-6 py-8 md:px-10 md:py-10 2xl:px-12">
            <div className="grid gap-8 2xl:grid-cols-[minmax(0,0.9fr)_minmax(22rem,0.65fr)] 2xl:items-start">
              <div className="max-w-4xl">
                <div className="design-badge design-badge-secondary mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                  </span>
                  {status === "ready" ? "LIVE REPOSITORY SIGNALS" : status === "error" ? "FALLBACK REPOSITORY SNAPSHOT" : "SYNCING REPOSITORY SIGNALS"}
                </div>
                <h1 className="bg-gradient-to-r from-white to-white/60 bg-clip-text font-headline text-5xl font-bold tracking-[-0.06em] text-transparent md:text-7xl 2xl:text-[6rem]" data-github-title>
                  Open Source to the Core
                </h1>
                <p className="mt-6 max-w-4xl text-lg leading-8 text-white/64 2xl:text-[1.35rem]">{githubHero.description}</p>
                <p className="mt-5 max-w-4xl font-mono text-xs uppercase tracking-[0.22em] text-white/36">
                  {snapshot.fullName} | {snapshot.license} | {snapshot.defaultBranch} | Last push {formatGithubDate(snapshot.pushedAt)}
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Button asChild className="rounded-2xl px-8 py-4">
                    <a href={snapshot.repositoryUrl} rel="noreferrer" target="_blank">
                      <Star className="h-4 w-4" />
                      Open repository
                    </a>
                  </Button>
                  <Button asChild className="rounded-2xl px-8 py-4" variant="outline">
                    <a href={snapshot.docsUrl} rel="noreferrer" target="_blank">
                      <FileText className="h-4 w-4" />
                      Read docs
                    </a>
                  </Button>
                  <Button asChild className="rounded-2xl px-8 py-4" variant="outline">
                    <Link to="/releases">View release surface</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-white/10 bg-black/25 p-6">
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-primary">Repository snapshot</div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <SnapshotFact icon={GitBranch} label="Default branch" value={snapshot.defaultBranch} />
                    <SnapshotFact icon={Shield} label="License" value={snapshot.license} />
                    <SnapshotFact icon={Activity} label="Primary language" value={snapshot.primaryLanguage} />
                    <SnapshotFact icon={Users} label="Contributors" value={visibleContributorLabel} />
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-secondary">Why this page exists</div>
                  <p className="mt-4 text-sm leading-7 text-white/66">
                    This page should help people read the repository, not squeeze the information into a decorative center strip. On large displays, the layout needs enough width for metrics, contributors, and repository context to breathe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16" data-github-metrics>
          <div className="grid gap-4 xl:grid-cols-4">
            <MetricCard
              body={`${formatGithubNumber(snapshot.stats.commitCount)} commits tracked on the public branch.`}
              label="Repository activity"
              tone="text-secondary"
              value={formatGithubNumber(snapshot.stats.commitCount)}
            />
            <MetricCard
              body={`${formatGithubNumber(snapshot.stats.stars)} stars and ${formatGithubNumber(snapshot.stats.forks)} forks so far.`}
              label="Community signals"
              tone="text-primary"
              value={`${formatGithubNumber(snapshot.stats.stars)} / ${formatGithubNumber(snapshot.stats.forks)}`}
            />
            <MetricCard
              body={`${formatGithubNumber(snapshot.stats.openIssues)} open issues and ${formatGithubNumber(snapshot.stats.watchers)} watchers right now.`}
              label="Current queue"
              tone="text-accent"
              value={formatGithubNumber(snapshot.stats.openIssues)}
            />
            <MetricCard body={latestReleaseLabel} label="Latest GitHub release" tone="text-secondary" value={snapshot.latestRelease ? snapshot.latestRelease.tagName : "Pending"} />
          </div>
        </section>

        <section className="scroll-spotlight mb-16 rounded-[2.75rem] border border-white/10 p-6 md:p-10 2xl:p-12" data-github-story>
          <div className="grid gap-10 2xl:grid-cols-[0.92fr_1.08fr] 2xl:items-center">
            <div className="space-y-6" data-github-story-copy>
              <div className="design-badge design-badge-primary w-fit">{githubCallout.eyebrow}</div>
              <h2 className="font-headline text-4xl font-bold tracking-tight text-white md:text-5xl 2xl:text-[3.6rem]">Repository truth stays visible</h2>
              <p className="max-w-2xl text-base leading-8 text-white/64 2xl:text-lg">{githubCallout.description}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoChip icon={GitBranch} label="Default branch" value={snapshot.defaultBranch} />
                <InfoChip icon={Shield} label="License" value={snapshot.license} />
                <InfoChip icon={Activity} label="Primary language" value={snapshot.primaryLanguage} />
                <InfoChip icon={FileText} label="Docs surface" value="Repo docs live" />
              </div>
              <div className="grid gap-4">
                {githubPillars.map((pillar, index) => (
                  <div className="rounded-[1.45rem] border border-white/10 bg-black/25 px-5 py-4" key={pillar.title}>
                    <div className={`mb-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] ${index === 0 ? "text-primary" : index === 1 ? "text-secondary" : "text-accent"}`}>
                      {pillar.title}
                    </div>
                    <p className="text-sm leading-7 text-white/62">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.35rem] border border-white/10 aspect-[16/11] 2xl:aspect-[16/13]" data-github-story-media>
              <img alt={designMedia.githubCodeLiquid.alt} className="h-full w-full object-cover opacity-80" decoding="async" loading="lazy" src={designMedia.githubCodeLiquid.src} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                {["repo truth", "release truth", "docs truth"].map((item) => (
                  <span className="design-badge bg-black/35 text-white/72" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <div className="absolute inset-x-6 bottom-6 rounded-[1.5rem] border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/42">
                  <span>{visibleContributorLabel}</span>
                  <span>|</span>
                  <span>{formatLanguageMix(snapshot)}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  The public repository is the source of truth for activity, contributors, release state, and technical direction. The site should help people read that surface, not hide it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2.4rem] border border-white/10 bg-white/[0.02] px-4 py-16 md:px-8" data-github-contributors>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h2 className="font-headline text-5xl font-bold tracking-[-0.06em] text-white">Visible Contributors</h2>
              <p className="mt-6 leading-8 text-white/60">
                This contributor strip is bound to the live repository snapshot. It reflects the current public surface on GitHub and grows naturally as more contributors become visible there.
              </p>
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.24em] text-white/32">Snapshot refreshed {formatGithubDate(snapshot.fetchedAt)}</div>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {snapshot.contributors.slice(0, 8).map((contributor, index) => (
              <article className="rounded-[1.8rem] border border-white/10 bg-black/20 p-6 text-left" data-contributor-card key={contributor.login}>
                <a className="block transition hover:-translate-y-1" href={contributor.profileUrl} rel="noreferrer" target="_blank">
                  <div className="flex items-center gap-4">
                    <div className={`w-20 rounded-full border-2 p-1 ${index === 0 ? "border-primary/40" : index === 1 ? "border-secondary/40" : "border-white/20"}`}>
                      <div className="aspect-square overflow-hidden rounded-full bg-white/[0.04]">
                        <img alt={contributor.login} className="h-full w-full object-cover" decoding="async" loading="lazy" src={contributor.avatarUrl} />
                      </div>
                    </div>
                    <div>
                      <div className={`font-mono text-[0.62rem] uppercase tracking-[0.18em] ${index === 0 ? "text-primary" : index === 1 ? "text-secondary" : "text-white/48"}`}>
                        @{contributor.login}
                      </div>
                      <p className="mt-2 text-sm text-white/70">{formatGithubNumber(contributor.contributions)} contributions visible</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-white/60">
                    Public contribution data comes straight from GitHub. As the contributor graph grows, this strip expands without the site needing a fake community story.
                  </p>
                </a>
              </article>
            ))}

            {githubHighlights.map((highlight, index) => (
              <article className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6" key={highlight.title}>
                <div className={`font-mono text-[0.62rem] uppercase tracking-[0.22em] ${index === 0 ? "text-primary" : index === 1 ? "text-secondary" : "text-accent"}`}>
                  {highlight.eyebrow}
                </div>
                <h3 className="mt-4 font-headline text-2xl font-semibold text-white">{highlight.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/62">{highlight.description}</p>
                {highlight.metric ? <div className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/36">{highlight.metric}</div> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="py-16 text-center">
          <SectionReveal className="design-glass-panel relative mx-auto max-w-5xl rounded-[2.75rem] border border-primary/20 p-12 md:p-16">
            <div className="absolute -top-12 left-1/2 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-full border-2 border-primary bg-background">
              <Github className="h-10 w-10 text-primary" />
            </div>
            <div className="mx-auto mb-5 flex w-fit items-center gap-3 rounded-full border border-white/10 bg-black/20 px-5 py-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/50">
              <Clock3 className="h-3.5 w-3.5" />
              {snapshot.latestRelease ? "Published GitHub release detected" : "GitHub releases still empty"}
            </div>
            <h2 className="font-headline text-4xl font-bold text-white">{githubCallout.title}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/60">{githubHero.description}</p>
            <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
              <SnapshotFact icon={GitFork} label="Repository" value={snapshot.fullName} />
              <SnapshotFact icon={Users} label="Contributors" value={visibleContributorLabel} />
              <SnapshotFact icon={Activity} label="Release state" value={snapshot.latestRelease ? snapshot.latestRelease.tagName : "No GitHub release yet"} />
            </div>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild className="rounded-full px-10 py-4">
                <Link
                  onClick={() =>
                    trackEvent("primary_cta_clicked", {
                      cta_name: "download_openstudio",
                      destination_path: "/download",
                      source: "github_page_cta",
                    })
                  }
                  to="/download"
                >
                  Download OpenStudio
                </Link>
              </Button>
              <Button asChild className="rounded-full px-10 py-4" variant="outline">
                <a
                  href={externalLinks.repository ?? snapshot.repositoryUrl}
                  onClick={() =>
                    trackEvent("github_link_clicked", {
                      link_label: "Explore repository",
                      link_url: externalLinks.repository ?? snapshot.repositoryUrl,
                      source: "github_page_cta",
                    })
                  }
                  rel="noreferrer"
                  target="_blank"
                >
                  Explore repository
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </SectionReveal>
        </section>
      </div>
    </main>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  body: string;
  tone: string;
}

const MetricCard = ({ body, label, tone, value }: MetricCardProps) => (
  <div className="design-glass-panel relative overflow-hidden rounded-[2.5rem] p-8" data-github-metric>
    <div className="bg-carbon-fibre absolute inset-0 opacity-[0.04]" />
    <div className="relative z-10">
      <span className={`mb-4 block font-mono text-sm uppercase tracking-[0.22em] ${tone}`}>{label}</span>
      <div className="font-display text-5xl font-bold text-white">{value}</div>
      <div className="mt-2 text-sm text-white/58">{body}</div>
    </div>
  </div>
);

interface InfoChipProps {
  icon: typeof GitBranch;
  label: string;
  value: string;
}

const InfoChip = ({ icon: Icon, label, value }: InfoChipProps) => (
  <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/35">{label}</div>
        <div className="mt-1 text-sm text-white/76">{value}</div>
      </div>
    </div>
  </div>
);

interface SnapshotFactProps {
  icon: typeof GitBranch;
  label: string;
  value: string;
}

const SnapshotFact = ({ icon: Icon, label, value }: SnapshotFactProps) => (
  <div className="rounded-[1.4rem] border border-white/10 bg-black/25 p-4">
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/36">{label}</div>
    <div className="mt-2 text-sm text-white/76">{value}</div>
  </div>
);

export default GithubPage;
