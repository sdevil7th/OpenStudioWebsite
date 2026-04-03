import { motion } from "framer-motion";
import { Activity, ArrowRight, BrainCircuit, Clock3, FileText, GitBranch, GitFork, Github, Shield, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import { Button } from "@/components/ui/button";
import { designMedia } from "@/data/designMedia";
import { githubCallout, githubHero, githubPillars, githubSeo } from "@/data/github";
import { externalLinks } from "@/data/siteLinks";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { formatGithubDate, formatGithubNumber, formatLanguageMix } from "@/lib/github";

const GithubPage = () => {
  const { snapshot, status } = useGithubRepoSnapshot();
  const contributorCountLabel = snapshot.stats.contributorCount === 1 ? "current public contributor" : "visible contributors";
  const latestReleaseLabel = snapshot.latestRelease
    ? `${snapshot.latestRelease.name} | ${formatGithubDate(snapshot.latestRelease.publishedAt)}`
    : "No GitHub releases published yet";

  return (
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      className="design-page-main"
      id="main-content"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageSeo {...githubSeo} />

      <div className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <section className="relative overflow-hidden px-2 pb-24">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="design-badge design-badge-secondary mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
              </span>
              {status === "ready" ? "LIVE REPOSITORY SIGNALS" : status === "error" ? "FALLBACK REPOSITORY SNAPSHOT" : "SYNCING REPOSITORY SIGNALS"}
            </div>
            <h1 className="bg-gradient-to-r from-white to-white/60 bg-clip-text font-headline text-6xl font-bold tracking-[-0.06em] text-transparent md:text-8xl">
              Open Source to the Core
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/64 md:text-xl">{githubHero.description}</p>
            <p className="mt-5 max-w-3xl font-mono text-xs uppercase tracking-[0.22em] text-white/36">
              {snapshot.fullName} | {snapshot.license} | {snapshot.defaultBranch} | Last push {formatGithubDate(snapshot.pushedAt)}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
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
        </section>

        <section className="pb-24">
          <div className="grid gap-4 md:grid-cols-4">
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
            <MetricCard
              body={latestReleaseLabel}
              label="Latest GitHub release"
              tone="text-secondary"
              value={snapshot.latestRelease ? snapshot.latestRelease.tagName : "Pending"}
            />

            <SectionReveal className="rounded-[2.5rem] border border-white/5 bg-[#101014] p-12 md:col-span-3">
              <div className="flex flex-col gap-12 md:flex-row md:items-center">
                <div className="flex-1">
                  <h2 className="font-headline text-4xl font-bold tracking-tight text-white">Repository truth stays visible</h2>
                  <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    <InfoChip icon={GitBranch} label="Default branch" value={snapshot.defaultBranch} />
                    <InfoChip icon={Shield} label="License" value={snapshot.license} />
                    <InfoChip icon={Activity} label="Primary language" value={snapshot.primaryLanguage} />
                    <InfoChip icon={FileText} label="Docs surface" value="Repo docs live" />
                  </div>
                  <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    {githubPillars.slice(0, 2).map((pillar, index) => (
                      <div key={pillar.title}>
                        <div className={`mb-2 font-mono text-sm ${index === 0 ? "text-primary" : "text-secondary"}`}>{`// 0${index + 1} ${pillar.title.split(" ")[0].toUpperCase()}`}</div>
                        <p className="text-sm leading-7 text-white/60">{pillar.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full overflow-hidden rounded-full border-2 border-white/10 shadow-2xl md:w-1/3">
                  <img alt={designMedia.githubCodeLiquid.alt} className="h-full w-full object-cover" src={designMedia.githubCodeLiquid.src} />
                </div>
              </div>
            </SectionReveal>

            <SectionReveal className="rounded-[2.5rem] border border-primary/20 bg-primary/10 p-8 transition hover:bg-primary/15">
              <div>
                <BrainCircuit className="mb-4 h-10 w-10 text-primary" />
                <h3 className="font-headline text-xl font-bold text-white">Contribution surface</h3>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/60">
                OpenStudio currently shows {contributorCountLabel} publicly. The next contribution should come through the repo, docs, or release notes rather than an invented community lane.
              </p>
              <div className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-primary">{formatLanguageMix(snapshot)}</div>
            </SectionReveal>
          </div>
        </section>

        <section className="bg-white/[0.02] px-2 py-24">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-headline text-5xl font-bold tracking-[-0.06em] text-white">
                {snapshot.stats.contributorCount === 1 ? "Current Public Contributor" : "Visible Contributors"}
              </h2>
              <p className="mt-6 leading-8 text-white/60">
                The contributor strip is now bound to the real repository. If there is one visible contributor, we say one. If more join, this surface expands with actual avatars and contribution counts.
              </p>
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.24em] text-white/32">Snapshot refreshed {formatGithubDate(snapshot.fetchedAt)}</div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {snapshot.contributors.slice(0, 8).map((contributor, index) => (
              <SectionReveal className="text-center" delay={index * 0.05} key={contributor.login}>
                <a className="block transition hover:-translate-y-1" href={contributor.profileUrl} rel="noreferrer" target="_blank">
                  <div className={`mx-auto mb-4 w-24 rounded-full border-2 p-1 ${index === 0 ? "border-primary/40" : index === 1 ? "border-secondary/40" : "border-white/20"}`}>
                    <div className="aspect-square overflow-hidden rounded-full bg-white/[0.04]">
                      <img alt={contributor.login} className="h-full w-full object-cover" src={contributor.avatarUrl} />
                    </div>
                  </div>
                  <div className={`font-mono text-[0.62rem] uppercase tracking-[0.18em] ${index === 0 ? "text-primary" : index === 1 ? "text-secondary" : "text-white/48"}`}>
                    @{contributor.login}
                  </div>
                  <p className="mt-2 text-xs text-white/56">{formatGithubNumber(contributor.contributions)} contributions</p>
                </a>
              </SectionReveal>
            ))}
          </div>
        </section>

        <section className="px-2 py-24 text-center">
          <SectionReveal className="design-glass-panel relative mx-auto max-w-4xl rounded-[2.75rem] border border-primary/20 p-16">
            <div className="absolute -top-12 left-1/2 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-full border-2 border-primary bg-background">
              <Github className="h-10 w-10 text-primary" />
            </div>
            <div className="mx-auto mb-5 flex w-fit items-center gap-3 rounded-full border border-white/10 bg-black/20 px-5 py-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/50">
              <Clock3 className="h-3.5 w-3.5" />
              {snapshot.latestRelease ? "Published GitHub release detected" : "GitHub releases still empty"}
            </div>
            <h2 className="font-headline text-4xl font-bold text-white">{githubCallout.title}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/60">{githubCallout.description}</p>
            <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
              <SnapshotFact icon={GitFork} label="Repository" value={snapshot.fullName} />
              <SnapshotFact icon={Users} label="Contributors" value={`${formatGithubNumber(snapshot.stats.contributorCount)} visible`} />
              <SnapshotFact icon={Activity} label="Release state" value={snapshot.latestRelease ? snapshot.latestRelease.tagName : "No GitHub release yet"} />
            </div>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild className="rounded-full px-10 py-4">
                <Link to="/download">Download OpenStudio</Link>
              </Button>
              <Button asChild className="rounded-full px-10 py-4" variant="outline">
                <a href={externalLinks.repository ?? snapshot.repositoryUrl} rel="noreferrer" target="_blank">
                  Explore repository
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </SectionReveal>
        </section>
      </div>
    </motion.main>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  body: string;
  tone: string;
}

const MetricCard = ({ body, label, tone, value }: MetricCardProps) => (
  <SectionReveal className="design-glass-panel relative overflow-hidden rounded-[2.5rem] p-8">
    <div className="bg-carbon-fibre absolute inset-0 opacity-[0.04]" />
    <div className="relative z-10">
      <span className={`mb-4 block font-mono text-sm uppercase tracking-[0.22em] ${tone}`}>{label}</span>
      <div className="font-display text-5xl font-bold text-white">{value}</div>
      <div className="mt-2 text-sm text-white/58">{body}</div>
    </div>
  </SectionReveal>
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
