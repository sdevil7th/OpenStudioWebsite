import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Guitar,
  Layers3,
  Piano,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import ChapterProgress from "@/components/ChapterProgress";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import FeatureCanonicalStory from "@/components/scene/FeatureCanonicalStory";
import FeaturesStoryBackdrop from "@/components/scene/FeaturesStoryBackdrop";
import { Button } from "@/components/ui/button";
import {
  featureChapters,
  featureHighlights,
  featurePageHero,
  featurePageSeo,
  featuresFinalCta,
  guitarRigComparison,
  tone3000Feature,
} from "@/data/features";
import type { FeatureChapter } from "@/data/marketing";
import { getResponsiveImageAttributes } from "@/lib/assetLoading";
import "@/lib/generatedImageRoutes/features";
import { trackEvent } from "@/lib/analytics";
import { scheduleAfterInitialLoad } from "@/lib/initialLoad";
import { warmScheduledImages } from "@/lib/imageScheduler";
import { useScrollScene } from "@/lib/gsap";
import "@/styles/features.css";
import { cn } from "@/lib/utils";

const DESKTOP_STORY_MEDIA_QUERY = "(min-width: 1024px)";

const accentBadgeClass = {
  lavender: "border-primary/25 bg-primary/10 text-primary",
  amber: "border-accent/20 bg-accent/10 text-accent",
  emerald: "border-secondary/25 bg-secondary/10 text-secondary",
  frost: "border-white/15 bg-white/[0.06] text-white/82",
} as const;

const chapterIcons: Record<string, LucideIcon> = {
  arrangement: Layers3,
  midi: Piano,
  mixer: SlidersHorizontal,
  engine: Sparkles,
  "nam-rack": Guitar,
  automation: Settings2,
};

const clampProgress = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
};

const FeatureMobileCard = ({
  chapter,
  index,
  loadMedia,
}: {
  chapter: FeatureChapter;
  index: number;
  loadMedia: boolean;
}) => {
  const Icon = chapterIcons[chapter.id] ?? Sparkles;
  const accentKey = chapter.accent ?? "lavender";
  const primaryImageAttributes = getResponsiveImageAttributes(chapter.sceneBase.asset.src, "story-active", {
    maxWidth: 960,
    sizes: "100vw",
  });

  return (
    <div
      className="feature-story-mobile-card"
      data-chapter-id={chapter.id}
      data-feature-story-mobile
    >
      <div className="flex items-center justify-between gap-4">
        <div className={cn("design-badge border", accentBadgeClass[accentKey])}>
          {chapter.eyebrow}
        </div>
        <div className="feature-story-scene-chip">
          <Icon className="h-4 w-4" />
          <span>{`0${index + 1}`}</span>
        </div>
      </div>

      <div className="feature-story-mobile-stage">
        <div className="feature-story-mobile-primary">
          {loadMedia ? (
            <img
              {...primaryImageAttributes}
              alt={chapter.sceneBase.asset.alt}
              className={cn(
                "h-full w-full",
                chapter.sceneBase.asset.fit === "contain"
                  ? "object-contain"
                  : "object-cover",
              )}
            />
          ) : null}
        </div>
        <div className="feature-story-mobile-support">
          {chapter.sceneFragments.slice(0, 2).map((fragment, fragmentIndex) => (
            <div
              className={
                fragmentIndex === 0
                  ? "feature-story-mobile-secondary"
                  : "feature-story-mobile-detail"
              }
              key={fragment.id}
            >
              {loadMedia ? (
                <img
                  {...getResponsiveImageAttributes(fragment.asset.src, "story-next", {
                    maxWidth: 768,
                    sizes: "50vw",
                  })}
                  alt={fragment.asset.alt}
                  className={cn(
                    "h-full w-full",
                    fragment.asset.fit === "contain"
                      ? "object-contain"
                      : "object-cover",
                  )}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-hidden="true"
            className="feature-story-mobile-numeral"
            data-accent={chapter.accent ?? "lavender"}
          >
            {chapter.numeral ?? String(index + 1)}
          </span>
          <div
            className={cn("design-badge border", accentBadgeClass[accentKey])}
          >
            {chapter.label}
          </div>
          <div className="design-badge bg-black/26 text-white/58">{`Stage ${index + 1}`}</div>
        </div>
        <h2 className="mt-5 font-headline text-3xl font-bold leading-tight text-white">
          {chapter.storyPanel.title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/66">
          {chapter.storyPanel.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {chapter.storyPanel.rail.map((rail) => (
            <span className="design-badge bg-black/26 text-white/66" key={rail}>
              {rail}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const FeaturesPage = () => {
  const pageRef = useRef<HTMLElement | null>(null);
  const [activeId, setActiveId] = useState(featureChapters[0]?.id ?? "");
  const [progressById, setProgressById] = useState<Record<string, number>>(() =>
    Object.fromEntries(featureChapters.map((chapter) => [chapter.id, 0])),
  );
  const [loadMobileStoryMedia, setLoadMobileStoryMedia] = useState(false);

  const activeChapter = useMemo(
    () =>
      featureChapters.find((chapter) => chapter.id === activeId) ??
      featureChapters[0]!,
    [activeId],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const syncMobileMedia = () => setLoadMobileStoryMedia(mediaQuery.matches);

    syncMobileMedia();
    mediaQuery.addEventListener("change", syncMobileMedia);

    return () => mediaQuery.removeEventListener("change", syncMobileMedia);
  }, []);

  useEffect(
    () =>
      scheduleAfterInitialLoad(
        () => {
          if (!window.matchMedia(DESKTOP_STORY_MEDIA_QUERY).matches) {
            return;
          }

          const firstChapter = featureChapters[0];
          const nextChapter = featureChapters[1];
          const firstFrameSources = [
            firstChapter?.sceneBase.asset.src,
            ...(firstChapter?.sceneFragments.map((fragment) => fragment.asset.src) ?? []),
            nextChapter?.sceneBase.asset.src,
          ].filter((src): src is string => Boolean(src));

          warmScheduledImages([...new Set(firstFrameSources)], {
            group: "cinematicFirstFrame",
            maxWidth: 1280,
            priority: "active",
            route: "/features",
            slot: "cinematic",
            tier: "story-active",
          });

          warmScheduledImages(
            [
              nextChapter?.sceneBase.asset.src,
              ...(nextChapter?.sceneFragments.map((fragment) => fragment.asset.src) ?? []),
            ].filter((src): src is string => Boolean(src)),
            {
              group: "canonicalRouteUpcoming",
              maxWidth: 960,
              priority: "next",
              route: "/features",
              slot: "cinematic",
              tier: "story-next",
            },
          );
        },
        { delay: 320, runOnInput: false, timeout: 1400 },
      ),
    [],
  );

  useScrollScene(
    pageRef,
    ({ prefersReducedMotion, gsap }) => {
      if (prefersReducedMotion) {
        return;
      }

      gsap.from("[data-features-hero] > *", {
        y: 22,
        opacity: 0,
        duration: 0.72,
        stagger: 0.08,
        ease: "power3.out",
      });

      if (window.matchMedia("(max-width: 1023px)").matches) {
        gsap.from("[data-feature-story-mobile]", {
          y: 28,
          opacity: 0,
          duration: 0.78,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-feature-story-mobile]",
            start: "top 82%",
          },
        });
      }
    },
    { delay: 320, runOnInput: false, timeout: 1400 },
  );

  useScrollScene(
    pageRef,
    ({ isDesktop, gsap, ScrollTrigger }) => {
      const useDesktopStory = isDesktop;

      const progressCache = new Map<string, number>();
      const progressTargets = gsap.utils.toArray<HTMLElement>(
        useDesktopStory
          ? "[data-feature-story-marker]"
          : "[data-feature-story-mobile]",
      );

      progressTargets.forEach((target) => {
        const chapterId = target.dataset.chapterId;

        if (!chapterId) {
          return;
        }

        ScrollTrigger.create({
          trigger: target,
          start: useDesktopStory ? "top bottom-=160" : "top center+=80",
          end: useDesktopStory ? "bottom top+=112" : "bottom center",
          onEnter: () => {
            setActiveId(chapterId);
          },
          onEnterBack: () => {
            setActiveId(chapterId);
          },
          onLeave: () => {
            progressCache.set(chapterId, 1);
            setProgressById((previous) => ({ ...previous, [chapterId]: 1 }));
          },
          onLeaveBack: () => {
            progressCache.set(chapterId, 0);
            setProgressById((previous) => ({ ...previous, [chapterId]: 0 }));
          },
          onUpdate: (self) => {
            if (self.isActive) {
              setActiveId(chapterId);
            }

            const nextProgress = clampProgress(
              Number(self.progress.toFixed(3)),
            );
            const cachedProgress = progressCache.get(chapterId) ?? -1;

            if (Math.abs(nextProgress - cachedProgress) < 0.03) {
              return;
            }

            progressCache.set(chapterId, nextProgress);
            setProgressById((previous) => ({
              ...previous,
              [chapterId]: nextProgress,
            }));
          },
        });
      });

      if (!useDesktopStory) {
        return;
      }

      document.documentElement.style.setProperty(
        "--feature-story-portal-opacity",
        "0",
      );

      return () => {
        document.documentElement.style.setProperty(
          "--feature-story-portal-opacity",
          "0",
        );
      };
    },
    { delay: 320, runOnInput: false, timeout: 1400, watchDesktopBreakpoint: true },
  );

  const activeProgress = clampProgress(progressById[activeChapter.id]);
  const ActiveChapterIcon = chapterIcons[activeChapter.id] ?? Sparkles;
  const HeroChapterIcon = chapterIcons[featureChapters[0]?.id ?? ""] ?? Layers3;
  const tone3000DesktopImage = getResponsiveImageAttributes(
    tone3000Feature.screenshot.src,
    "below-fold",
    {
      maxWidth: 1280,
      sizes: "(min-width: 1024px) 58vw, 100vw",
    },
  );
  const tone3000MobileImage = getResponsiveImageAttributes(
    tone3000Feature.mobileScreenshot.src,
    "below-fold",
    {
      maxWidth: 380,
      sizes: "calc(100vw - 3rem)",
    },
  );

  return (
    <main
      ref={pageRef}
      className="design-page-main feature-story-page route-appear"
      id="main-content"
    >
      <PageSeo {...featurePageSeo} />
      <FeaturesStoryBackdrop
        chapter={activeChapter}
        chapters={featureChapters}
        progress={activeProgress}
      />

      <div className="page-frame-wide relative">
        <section
          className="feature-story-hero-section pb-10"
          data-features-hero
        >
          <div className="feature-story-hero feature-story-hero--premium grid gap-6 overflow-hidden rounded-[2.8rem] border border-white/10 px-6 py-8 md:px-8 xl:grid-cols-[minmax(0,0.84fr)_minmax(26rem,1.16fr)] xl:items-end 2xl:px-10">
            <div className="feature-story-hero-copy max-w-3xl">
              <div className="design-badge design-badge-primary mb-5 w-fit">
                Feature Story
              </div>
              <h1 className="font-headline text-5xl font-extrabold leading-[0.98] text-white md:text-7xl">
                {featurePageHero.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/74 xl:text-[1.22rem]">
                {featurePageHero.description}
              </p>
              <div className="feature-story-hero-badges mt-8 flex flex-wrap gap-3">
                {featureHighlights.map((item) => (
                  <span
                    className="design-badge bg-black/30 text-white/70"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="feature-story-hero-visual grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
              <div className="feature-story-hero-stage feature-story-hero-stage--primary overflow-hidden rounded-[2rem] border border-white/10">
                <img
                  {...getResponsiveImageAttributes(featureChapters[0]!.sceneBase.asset.src, "hero/eager", {
                    maxWidth: 1600,
                    sizes: "(min-width: 1280px) 48vw, 100vw",
                  })}
                  alt={featureChapters[0]!.sceneBase.asset.alt}
                  className="h-[22rem] w-full object-cover md:h-[27rem] xl:h-[31rem]"
                />
              </div>
              <div className="grid gap-4">
                <div className="feature-story-hero-console">
                  <div className="feature-story-hero-console__top">
                    <HeroChapterIcon className="h-4 w-4" />
                    <span>Chapter engine</span>
                    <strong>{`01 / ${featureChapters.length.toString().padStart(2, "0")}`}</strong>
                  </div>
                  <p>{featureChapters[0]!.storyPanel.description}</p>
                  <div
                    className="feature-story-hero-console__meter"
                    aria-hidden="true"
                  >
                    <span />
                  </div>
                  <div className="feature-story-hero-console__stats">
                    <span>
                      <strong>{featureChapters.length}</strong>
                      Chapters
                    </span>
                    <span>
                      <strong>Live</strong>
                      Signal route
                    </span>
                  </div>
                </div>
                <div className="feature-story-hero-stage feature-story-hero-stage--secondary overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/36">
                  <img
                    {...getResponsiveImageAttributes(featureChapters[3]!.sceneBase.asset.src, "near-fold", {
                      maxWidth: 960,
                      sizes: "(min-width: 1280px) 22vw, 60vw",
                    })}
                    alt={featureChapters[3]!.sceneBase.asset.alt}
                    className="h-52 w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-story-viewport">
          <div className="feature-story-shell-sticky hidden lg:block">
            <div className="feature-story-shell-grid">
              <aside className="feature-story-rail-panel">
                <div>
                  <p className="editorial-kicker mb-4">Feature atlas</p>
                  <ChapterProgress
                    activeId={activeId}
                    items={featureChapters.map((chapter, chapterIndex) => ({
                      id: chapter.id,
                      label: chapter.label,
                      numeral: chapter.numeral ?? String(chapterIndex + 1),
                    }))}
                    progressById={progressById}
                  />
                </div>
                <div className="feature-story-current-focus mt-5">
                  <div className="feature-story-current-focus__top">
                    <ActiveChapterIcon className="h-4 w-4" />
                    <p>Current focus</p>
                  </div>
                  <p className="mt-3 font-headline text-2xl font-semibold text-white">
                    {activeChapter.label}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    {activeChapter.storyPanel.description}
                  </p>
                  <div className="feature-story-current-focus__meter mt-4">
                    <span
                      style={{
                        width: `${Math.max(12, activeProgress * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </aside>

              <div className="feature-story-shell-stage">
                <div className="feature-story-canvas feature-story-canvas--canonical">
                  <FeatureCanonicalStory
                    activeId={activeId}
                    chapters={featureChapters}
                    progressById={progressById}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden">
            <div className="feature-story-mobile-rail rounded-[2rem] border border-white/10 bg-[rgba(9,12,20,0.66)] p-5 backdrop-blur-2xl">
              <p className="editorial-kicker mb-4">Feature atlas</p>
              <ChapterProgress
                activeId={activeId}
                items={featureChapters.map((chapter) => ({
                  id: chapter.id,
                  label: chapter.label,
                }))}
                progressById={progressById}
              />
            </div>
          </div>

          <div className="feature-story-track">
            {featureChapters.map((chapter, index) => (
              <section
                className="feature-story-track-section scroll-mt-32"
                id={chapter.id}
                key={chapter.id}
                style={{
                  ["--feature-story-span" as string]: `${chapter.scrollSpan ?? 196}vh`,
                }}
              >
                <div
                  className="feature-story-marker hidden lg:block"
                  data-chapter-id={chapter.id}
                  data-feature-story-marker
                >
                  <span className="sr-only">{chapter.storyPanel.title}</span>
                </div>

                <div className="lg:hidden" data-chapter-id={chapter.id}>
                  <FeatureMobileCard
                    chapter={chapter}
                    index={index}
                    loadMedia={loadMobileStoryMedia}
                  />
                </div>
              </section>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="tone3000-feature-title"
          className="py-12"
          id="tone3000"
        >
          <SectionReveal className="scroll-spotlight overflow-hidden rounded-[2.75rem] border border-white/10 p-6 md:p-10 xl:p-12">
            <div className="grid gap-10 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] xl:items-center">
              <div className="max-w-2xl">
                <div className="design-badge border border-white/15 bg-white/[0.06] text-white/82">
                  {tone3000Feature.eyebrow}
                </div>
                <h2
                  className="mt-6 font-headline text-3xl font-bold leading-tight text-white md:text-5xl"
                  id="tone3000-feature-title"
                >
                  {tone3000Feature.title}
                </h2>
                <p className="mt-6 text-base leading-8 text-white/68 md:text-lg">
                  {tone3000Feature.description}
                </p>
                <div className="mt-7 grid gap-3">
                  {tone3000Feature.points.map((point) => (
                    <div
                      className="hover-card rounded-[1.35rem] border border-white/10 bg-black/24 px-5 py-4 text-sm leading-7 text-white/68"
                      key={point}
                    >
                      {point}
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link
                      onClick={() =>
                        trackEvent("primary_cta_clicked", {
                          cta_name: "download_openstudio",
                          destination_path: "/download",
                          source: "features_tone3000",
                        })
                      }
                      to="/download"
                    >
                      Download OpenStudio
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a
                      href={tone3000Feature.termsHref}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Read the API terms
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <figure className="design-glass-panel overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-3">
                <picture>
                  <source
                    height={tone3000MobileImage.height}
                    media="(max-width: 639px)"
                    sizes={tone3000MobileImage.sizes}
                    srcSet={
                      tone3000MobileImage.srcSet ?? tone3000MobileImage.src
                    }
                    width={tone3000MobileImage.width}
                  />
                  <img
                    {...tone3000DesktopImage}
                    alt={tone3000Feature.screenshot.alt}
                    className="mx-auto h-auto w-full max-w-[380px] rounded-[1.45rem] object-cover sm:max-w-none"
                  />
                </picture>
                <figcaption className="px-3 pb-1 pt-4 text-sm leading-6 text-white/48">
                  {tone3000Feature.caption}
                </figcaption>
              </figure>
            </div>
          </SectionReveal>
        </section>

        <section
          aria-labelledby="guitar-rig-comparison-title"
          className="py-12"
          id="nam-comparison"
        >
          <SectionReveal className="feature-story-exit feature-story-exit--premium mx-auto max-w-[94rem] p-6 md:p-10 xl:p-12">
            <div className="max-w-4xl">
              <div className="design-badge design-badge-primary mb-5 w-fit">
                {guitarRigComparison.eyebrow}
              </div>
              <h2
                className="font-headline text-3xl font-bold leading-tight text-white md:text-5xl"
                id="guitar-rig-comparison-title"
              >
                {guitarRigComparison.title}
              </h2>
              <p className="mt-5 text-base leading-8 text-white/66 md:text-lg">
                {guitarRigComparison.description}
              </p>
            </div>

            <div
              aria-labelledby="guitar-rig-comparison-title"
              className="mt-9 overflow-x-auto rounded-[1.5rem] border border-white/10 bg-black/28 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              role="region"
              tabIndex={0}
            >
              <table className="w-full min-w-[70rem] border-collapse text-left text-sm leading-6 text-white/70">
                <caption className="sr-only">
                  OpenStudio NAM Rack compared with AmpliTube 5 and CS, Guitar
                  Rig 7 and Player, and Neural DSP plug-ins.
                </caption>
                <thead className="bg-white/[0.055]">
                  <tr>
                    <th
                      className="sticky left-0 z-10 w-40 border-b border-r border-white/10 bg-[#0b0d15] px-5 py-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/52"
                      scope="col"
                    >
                      Comparison
                    </th>
                    {guitarRigComparison.products.map((product) => (
                      <th
                        className="w-60 border-b border-white/10 px-5 py-4 font-headline text-base font-semibold text-white"
                        key={product}
                        scope="col"
                      >
                        {product}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guitarRigComparison.rows.map((row) => (
                    <tr className="border-b border-white/[0.07] last:border-0" key={row.label}>
                      <th
                        className="sticky left-0 z-10 border-r border-white/10 bg-[#090b12] px-5 py-4 align-top font-mono text-[0.66rem] uppercase tracking-[0.16em] text-secondary"
                        scope="row"
                      >
                        {row.label}
                      </th>
                      {row.values.map((value, valueIndex) => (
                        <td
                          className="px-5 py-4 align-top"
                          key={`${row.label}-${guitarRigComparison.products[valueIndex]}`}
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 max-w-5xl text-sm leading-7 text-white/48">
              {guitarRigComparison.note}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {guitarRigComparison.sources.map((source) => (
                <a
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/58 transition hover:border-primary/35 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  href={source.href}
                  key={source.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {source.label}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </SectionReveal>
        </section>

        <section className="py-12">
          <SectionReveal className="feature-story-exit feature-story-exit--premium mx-auto max-w-6xl p-8 md:p-12">
            <div className="feature-story-exit__chrome" aria-hidden="true">
              <span>OpenStudio</span>
              <span>Feature system</span>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="design-badge design-badge-secondary mb-5 w-fit">
                  {featuresFinalCta.eyebrow}
                </div>
                <h2 className="font-headline text-3xl font-bold text-white md:text-4xl">
                  {featuresFinalCta.title}
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">
                  {featuresFinalCta.description}
                </p>
              </div>
              <div className="feature-story-exit__actions flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button asChild className="rounded-2xl px-8">
                  <Link
                    onClick={() =>
                      trackEvent("internal_link_clicked", {
                        destination_path: featuresFinalCta.primaryCta.to,
                        link_label: featuresFinalCta.primaryCta.label,
                        source: "features_final_cta",
                      })
                    }
                    to={featuresFinalCta.primaryCta.to}
                  >
                    {featuresFinalCta.primaryCta.label}
                  </Link>
                </Button>
                <Button asChild className="rounded-2xl px-8" variant="outline">
                  <Link
                    onClick={() =>
                      trackEvent("primary_cta_clicked", {
                        cta_name: "download_openstudio",
                        destination_path: featuresFinalCta.secondaryCta.to,
                        source: "features_final_cta",
                      })
                    }
                    to={featuresFinalCta.secondaryCta.to}
                  >
                    {featuresFinalCta.secondaryCta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild className="rounded-2xl px-8" variant="ghost">
                  <Link
                    onClick={() =>
                      trackEvent("internal_link_clicked", {
                        destination_path: "/github",
                        link_label: "Explore GitHub",
                        source: "features_final_cta",
                      })
                    }
                    to="/github"
                  >
                    <Sparkles className="h-4 w-4" />
                    Explore GitHub
                  </Link>
                </Button>
              </div>
            </div>
          </SectionReveal>
        </section>
      </div>
    </main>
  );
};

export default FeaturesPage;
