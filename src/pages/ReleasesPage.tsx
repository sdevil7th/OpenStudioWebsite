import { motion } from "framer-motion";
import { Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import { Button } from "@/components/ui/button";
import { designMedia } from "@/data/designMedia";
import { releaseChannels, releasePrinciples, releaseTimeline, releasesSeo } from "@/data/releases";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { formatGithubDate } from "@/lib/github";

const ReleasesPage = () => {
  const current = releaseTimeline[0]!;
  const currentBehavior = releaseTimeline[1]!;
  const next = releaseTimeline[2]!;
  const { snapshot, status } = useGithubRepoSnapshot();

  return (
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      className="design-page-main audio-scan-grid"
      id="main-content"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageSeo {...releasesSeo} />

      <div className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <header className="mb-24 max-w-4xl">
          <div className="design-badge design-badge-secondary mb-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
            </span>
            {snapshot.latestRelease ? "GitHub release detected" : status === "error" ? "Using release fallback snapshot" : "GitHub releases currently pending"}
          </div>
          <h1 className="font-headline text-6xl font-bold tracking-[-0.06em] text-white md:text-8xl">
            Release <span className="italic text-primary">Timeline</span>
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-8 text-white/60">
            Track the current release arc, the update-awareness layer, and the next distribution improvements without guessing how the product actually ships.
          </p>
        </header>

        <SectionReveal className="mb-16 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary">GitHub release state</div>
              <h2 className="font-headline text-2xl font-bold text-white">
                {snapshot.latestRelease ? snapshot.latestRelease.name : "No GitHub releases published yet"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                {snapshot.latestRelease
                  ? `The repository now shows ${snapshot.latestRelease.tagName} on GitHub, published ${formatGithubDate(snapshot.latestRelease.publishedAt)} with ${snapshot.latestRelease.assetCount} release asset${snapshot.latestRelease.assetCount === 1 ? "" : "s"}.`
                  : `As of ${formatGithubDate(snapshot.fetchedAt)}, the public repository is live but GitHub Releases is still empty. The site continues to explain the release path honestly until the first asset-backed GitHub release is published.`}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/30 px-6 py-5 font-mono text-xs uppercase tracking-[0.18em] text-white/54">
              {snapshot.latestRelease ? "Published release present" : "Release page is the truthful fallback"}
            </div>
          </div>
        </SectionReveal>

        <section className="relative mx-auto max-w-6xl">
          <div className="timeline-playhead absolute left-1/2 top-0 hidden w-[2px] -translate-x-1/2 opacity-40 md:block" style={{ height: "100%" }} />

          <div className="relative z-10 mb-40">
            <div className="mb-16 flex flex-col items-center">
              <div className="rounded-full border border-white/10 bg-black/30 px-6 py-2">
                <span className="font-display text-sm tracking-[0.28em] text-primary">UPCOMING_ROADMAP</span>
              </div>
            </div>
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div className="md:text-right">
                <h2 className="text-3xl font-headline font-bold text-white">Expanding Distribution</h2>
                <p className="mb-6 mt-4 text-white/60">{next.summary}</p>
                <ul className="space-y-4 font-mono text-sm text-secondary/80">
                  {next.bullets.map((bullet) => (
                    <li className="flex items-center gap-3 md:justify-end" key={bullet}>
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="design-panel group relative aspect-video overflow-hidden rounded-[2.5rem] p-8">
                <img alt={designMedia.releasesRoadmapNetwork.alt} className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-700 group-hover:scale-105" src={designMedia.releasesRoadmapNetwork.src} />
                <div className="relative z-10 flex h-full flex-col justify-end">
                  <span className="font-display text-4xl text-primary/25">NEXT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mb-40">
            <div className="absolute left-1/2 top-0 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-primary shadow-[0_0_36px_rgba(208,188,255,0.28)] md:block" />
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div className="order-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] md:order-1 md:h-96">
                <img alt={designMedia.releasesStableSpotlight.alt} className="h-full w-full rounded-full object-cover" src={designMedia.releasesStableSpotlight.src} />
              </div>
              <div className="order-1 md:order-2">
                <div className="mb-4 flex items-baseline gap-4">
                  <span className="font-display text-5xl text-white">Public</span>
                  <span className="font-mono text-sm uppercase tracking-[0.18em] text-secondary">CURRENT_STABLE</span>
                </div>
                <h3 className="text-3xl font-headline font-bold text-white">The current release path</h3>
                <p className="mt-4 italic text-white/58">
                  "{snapshot.latestRelease ? `GitHub release ${snapshot.latestRelease.tagName} is visible alongside the site release narrative.` : current.title}"
                </p>
                <div className="mt-8 space-y-4 rounded-[1.5rem] border border-white/10 bg-black/30 p-6">
                  {(snapshot.latestRelease
                    ? [
                        `GitHub release ${snapshot.latestRelease.tagName} is published and can anchor the public release story.`,
                        `Release notes on the site should still clarify platform caveats and manual trust steps.`,
                        `Download endpoints can now resolve against release assets instead of hardcoded binary URLs.`,
                      ]
                    : current.bullets
                  ).map((bullet) => (
                    <div className="flex gap-4" key={bullet}>
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm leading-7 text-white/72">{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-24">
            <HistoryRow
              align="right"
              body={currentBehavior.summary}
              iconColor="text-primary"
              label={currentBehavior.dateLabel}
              title={currentBehavior.title}
            />
            <HistoryRow
              align="left"
              body={releasePrinciples[1] ?? releasePrinciples[0]!}
              iconColor="text-secondary"
              label="Current release principle"
              title="Keep caveats visible at the point of download"
            />
            <HistoryRow
              align="right"
              body={releasePrinciples[2] ?? next.summary}
              iconColor="text-accent"
              label={next.dateLabel}
              title="Treat update discovery and update automation as different claims"
            />
          </div>
        </section>

        <section className="mt-40">
          <SectionReveal className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-[#121216] p-12 text-center">
            <h2 className="text-3xl font-headline font-bold text-white">Stay Synchronized</h2>
            <p className="mt-4 text-white/60">Follow the release surface directly through downloads, release notes, and the public engineering story.</p>
            <div className="mx-auto mt-8 flex max-w-md flex-col gap-4 md:flex-row">
              <Button asChild className="flex-1 rounded-2xl px-8 py-3">
                <Link to="/download">Download OpenStudio</Link>
              </Button>
              <Button asChild className="flex-1 rounded-2xl px-8 py-3" variant="outline">
                <Link to="/github">Explore GitHub</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {releaseChannels.map((channel) => (
                <span className="design-badge bg-black/20 text-white/56" key={channel.title}>
                  {channel.title}
                </span>
              ))}
            </div>
          </SectionReveal>
        </section>
      </div>
    </motion.main>
  );
};

interface HistoryRowProps {
  align: "left" | "right";
  label: string;
  title: string;
  body: string;
  iconColor: string;
}

const HistoryRow = ({ align, body, iconColor, label, title }: HistoryRowProps) => (
  <SectionReveal className="grid items-center gap-12 md:grid-cols-2">
    {align === "right" ? (
      <>
        <div className="md:text-right">
          <span className="mb-2 block font-mono text-xs uppercase tracking-[0.3em] text-primary/60">{label}</span>
          <h3 className="text-2xl font-headline font-bold text-white">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/58 md:ml-auto md:max-w-md">{body}</p>
        </div>
        <div className="hidden md:block">
          <div className={`flex h-12 w-12 -ml-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] ${iconColor}`}>
            <Megaphone className="h-5 w-5" />
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="hidden justify-end md:flex">
          <div className={`z-20 flex h-12 w-12 -mr-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] ${iconColor}`}>
            <Megaphone className="h-5 w-5" />
          </div>
        </div>
        <div>
          <span className="mb-2 block font-mono text-xs uppercase tracking-[0.3em] text-primary/60">{label}</span>
          <h3 className="text-2xl font-headline font-bold text-white">{title}</h3>
          <p className="mt-3 max-w-md text-sm leading-7 text-white/58">{body}</p>
        </div>
      </>
    )}
  </SectionReveal>
);

export default ReleasesPage;
