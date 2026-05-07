import { motion } from "framer-motion";
import { ArrowRight, Clock3, Download, FileText, GitBranch, Megaphone, ShieldCheck, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import { Button } from "@/components/ui/button";
import { designMedia } from "@/data/designMedia";
import { releaseChannels, releasePrinciples, releaseSyncPanel, releaseTimeline, releasesHero, releasesSeo } from "@/data/releases";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { formatGithubDate } from "@/lib/github";
import { useScrollScene } from "@/lib/gsap";

const ReleasesPage = () => {
  const pageRef = useRef<HTMLElement | null>(null);
  const { snapshot, status } = useGithubRepoSnapshot();

  useScrollScene(pageRef, ({ prefersReducedMotion, gsap, ScrollTrigger }) => {
    gsap.fromTo(
      "[data-releases-hero] > *",
      { y: 24, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        clearProps: "transform,opacity,visibility",
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      },
    );

    gsap.fromTo(
      "[data-release-stage]",
      { y: 34, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        clearProps: "transform,opacity,visibility",
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-release-stage]",
          start: "top 76%",
          once: true,
        },
      },
    );

    gsap.fromTo(
      "[data-release-timeline-card]",
      { y: 36, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        clearProps: "transform,opacity,visibility",
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-release-timeline]",
          start: "top 78%",
          once: true,
        },
      },
    );

    gsap.fromTo(
      "[data-release-principle]",
      { y: 26, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        clearProps: "transform,opacity,visibility",
        duration: 0.75,
        stagger: 0.07,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-release-principles]",
          start: "top 78%",
          once: true,
        },
      },
    );

    if (!prefersReducedMotion) {
      gsap.fromTo(
        "[data-release-hero-image]",
        { scale: 1.08, yPercent: -4 },
        {
          scale: 1,
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-release-hero-image]",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    }

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 160);
    return () => window.clearTimeout(refreshId);
  });

  return (
    <motion.main
      ref={pageRef}
      animate={{ opacity: 1 }}
      className="design-page-main audio-scan-grid"
      id="main-content"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageSeo {...releasesSeo} />

      <div className="page-frame-wide pb-24">
        <section className="pb-14" data-releases-hero>
          <div className="hero-shell overflow-hidden rounded-[2.9rem] px-6 py-8 md:px-10 md:py-10 2xl:px-12">
            <div className="grid gap-8 2xl:grid-cols-[minmax(0,0.86fr)_minmax(20rem,1.14fr)] 2xl:items-start">
              <div className="max-w-4xl pt-2">
                <div className="design-badge design-badge-secondary mb-6 w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                  </span>
                  {snapshot.latestRelease ? "GitHub release detected" : status === "error" ? "Using release fallback snapshot" : "GitHub releases currently pending"}
                </div>
                <h1 className="font-headline text-5xl font-bold tracking-[-0.06em] text-white md:text-7xl 2xl:text-[6rem]">{releasesHero.title}</h1>
                <p className="mt-6 max-w-4xl text-lg leading-8 text-white/64 2xl:text-[1.3rem]">{releasesHero.description}</p>

                <div className="mt-8 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-5 py-5">
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-primary">Current release state</div>
                    <h2 className="mt-4 font-headline text-2xl font-semibold text-white">
                      {snapshot.latestRelease ? snapshot.latestRelease.name : "No GitHub release published yet"}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-white/64">
                      {snapshot.latestRelease
                        ? `Published ${formatGithubDate(snapshot.latestRelease.publishedAt)} with ${snapshot.latestRelease.assetCount} release asset${snapshot.latestRelease.assetCount === 1 ? "" : "s"}.`
                        : `As of ${formatGithubDate(snapshot.fetchedAt)}, the public download path is live while GitHub Releases is still catching up.`}
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-5 py-5">
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary">Release philosophy</div>
                    <p className="mt-4 text-sm leading-7 text-white/66">
                      This page should feel like a premium editorial surface for shipping truth: what exists now, what the current trust story is, and what gets cleaner next.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {releaseChannels.map((channel) => (
                    <span className="design-badge bg-black/25 text-white/68" key={channel.title}>
                      {channel.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(17rem,0.82fr)]">
                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/30">
                  <img
                    alt={designMedia.releasesRoadmapNetwork.alt}
                    className="h-[22rem] w-full object-cover md:h-[28rem] 2xl:h-[32rem]"
                    data-release-hero-image
                    decoding="async"
                    loading="eager"
                    src={designMedia.releasesRoadmapNetwork.src}
                  />
                  <div className="border-t border-white/10 bg-black/35 px-5 py-4">
                    <div className="font-headline text-lg font-semibold text-white">Release surface</div>
                    <p className="mt-2 text-sm leading-7 text-white/66">
                      The release story should feel current and premium without hiding the present state of packaging, redirects, and installer trust.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.8rem] border border-white/10 bg-black/30 p-5">
                    <div className="flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-primary">
                      <Download className="h-4 w-4" />
                      Distribution
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/66">Stable redirect endpoints keep the website in control of current builds.</p>
                  </div>
                  <div className="rounded-[1.8rem] border border-white/10 bg-black/30 p-5">
                    <div className="flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary">
                      <ShieldCheck className="h-4 w-4" />
                      Trust cues
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/66">Unsigned install guidance stays explicit until the installer trust story gets stronger.</p>
                  </div>
                  <div className="rounded-[1.8rem] border border-white/10 bg-black/30 p-5">
                    <div className="flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-accent">
                      <Clock3 className="h-4 w-4" />
                      Version rhythm
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/66">The site, notes, and GitHub releases should all tell the same version story.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16" data-release-stage>
          <div className="scroll-spotlight overflow-hidden rounded-[2.6rem] border border-white/10 p-6 md:p-8 2xl:p-10">
            <div className="grid gap-8 2xl:grid-cols-[minmax(0,0.88fr)_minmax(20rem,1.12fr)] 2xl:items-center">
              <div className="space-y-5">
                <div className="design-badge design-badge-primary w-fit">{releasesHero.eyebrow}</div>
                <h2 className="font-headline text-4xl font-bold tracking-tight text-white 2xl:text-[3.5rem]">A premium release page should make the shipping truth obvious fast.</h2>
                <p className="max-w-2xl text-base leading-8 text-white/64 2xl:text-lg">
                  The current public build story needs to be understandable in the first viewport: what ships now, how updates are discovered, and what parts of the install path still depend on visible trust notes.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-primary">What exists now</div>
                    <p className="mt-3 text-sm leading-7 text-white/66">
                      Browser-first downloads, platform notes, and a release surface that refuses to fake more automation than exists.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-secondary">What gets better next</div>
                    <p className="mt-3 text-sm leading-7 text-white/66">
                      Cleaner packaging, stronger trust cues, and a more polished changelog rhythm around public builds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/30">
                <img alt={designMedia.releasesStableSpotlight.alt} className="h-[24rem] w-full object-cover md:h-[30rem]" decoding="async" loading="lazy" src={designMedia.releasesStableSpotlight.src} />
                <div className="border-t border-white/10 bg-black/40 px-5 py-4">
                  <div className="font-headline text-lg font-semibold text-white">Shipping spotlight</div>
                  <p className="mt-2 text-sm leading-7 text-white/66">
                    OpenStudio is in the stage where careful release communication matters as much as the feature list. This page should sell confidence through clarity, not atmosphere alone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16" data-release-timeline>
          <div className="mb-8 max-w-5xl">
            <div>
              <div className="design-badge design-badge-secondary mb-4 w-fit">Release arc</div>
              <h2 className="font-headline text-4xl font-bold text-white md:text-5xl">Current state, update awareness, and next release focus.</h2>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">
              These cards should feel like a premium changelog wall, not a sparse timeline floating in empty space.
            </p>
          </div>

          <div className="grid gap-6 2xl:grid-cols-3">
            {releaseTimeline.map((entry) => (
              <SectionReveal
                className="scroll-spotlight flex min-h-[32rem] flex-col rounded-[2.2rem] border border-white/10 p-6 md:p-7"
                data-release-timeline-card
                key={entry.id}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-secondary">{entry.label}</div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/38">{entry.status}</div>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                    {entry.id === "first-public-release" ? (
                      <Download className="h-5 w-5 text-primary" />
                    ) : entry.id === "metadata-awareness" ? (
                      <GitBranch className="h-5 w-5 text-secondary" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  <div className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/36">{entry.version}</div>
                </div>
                <h3 className="mt-5 font-headline text-2xl font-bold text-white">{entry.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/62">{entry.summary}</p>
                <div className="mt-6 grid flex-1 gap-3">
                  {entry.bullets.map((bullet) => (
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/25 px-4 py-3 text-sm leading-7 text-white/66" key={bullet}>
                      {bullet}
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-white/10 pt-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/34">
                  {entry.dateLabel}
                </div>
              </SectionReveal>
            ))}
          </div>
        </section>

        <section className="mb-16" data-release-principles>
          <div className="mb-8">
            <div className="design-badge design-badge-secondary mb-4 w-fit">Release principles</div>
            <h2 className="font-headline text-4xl font-bold text-white">Keep the shipping story legible.</h2>
          </div>
          <div className="release-principle-rail">
            {releasePrinciples.map((principle) => (
              <div className="release-principle-line" data-release-principle key={principle}>
                <Megaphone className="h-5 w-5 text-primary" />
                <p>{principle}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-4">
          <SectionReveal className="scroll-spotlight rounded-[2.4rem] border border-primary/20 p-8 md:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="design-badge design-badge-secondary mb-5 w-fit">{releaseSyncPanel.eyebrow}</div>
                <h2 className="font-headline text-3xl font-bold text-white md:text-4xl">{releaseSyncPanel.title}</h2>
                <p className="mt-4 text-sm leading-7 text-white/64">{releaseSyncPanel.description}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-2xl px-8 py-4">
                  <Link to="/download">Download OpenStudio</Link>
                </Button>
                <Button asChild className="rounded-2xl px-8 py-4" variant="outline">
                  <Link to="/github">
                    Explore GitHub
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </SectionReveal>
        </section>
      </div>
    </motion.main>
  );
};

export default ReleasesPage;
