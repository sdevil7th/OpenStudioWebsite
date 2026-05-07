import { lazy, Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import {
  ArrowRight,
  Layers3,
  Piano,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import ChapterProgress from "@/components/ChapterProgress";
import DeferredClientStage from "@/components/DeferredClientStage";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import { Button } from "@/components/ui/button";
import {
  featureChapters,
  featureHighlights,
  featurePageHero,
  featurePageSeo,
  featuresFinalCta,
} from "@/data/features";
import type { FeatureChapter } from "@/data/marketing";
import type { FeatureSceneCompositorState } from "@/components/scene/FeatureSceneCompositor";
import { scheduleAfterInitialLoad } from "@/lib/initialLoad";
import { useScrollScene } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const ChapterIntroOverlay = lazy(() => import("@/components/scene/ChapterIntroOverlay"));
const FeatureSceneCompositor = lazy(() => import("@/components/scene/FeatureSceneCompositor"));
const FeatureSceneWebGLStage = lazy(() => import("@/components/scene/FeatureSceneWebGLStage"));
const FeatureStoryUnifiedTransition = lazy(() => import("@/components/scene/FeatureStoryUnifiedTransition"));
const FeaturesStoryBackdrop = lazy(() => import("@/components/scene/FeaturesStoryBackdrop"));

const DeferredAfterIntro = ({ children, delay = 700 }: { children: ReactNode; delay?: number }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) {
      return;
    }

    return scheduleAfterInitialLoad(
      () => setReady(true),
      { delay, runOnInput: false, timeout: 1800 },
    );
  }, [delay, ready]);

  return ready ? children : null;
};

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
  automation: Settings2,
};

interface FeatureSceneCompositorSurfaceProps {
  chapters: FeatureChapter[];
  className?: string;
  stateRef: MutableRefObject<FeatureSceneCompositorState>;
}

const FeatureSceneStaticFallback = ({ className }: { className?: string }) => (
  <div className={cn("feature-story-static-stage", className)} aria-hidden="true">
    <span className="feature-story-static-stage__wash" />
    <span className="feature-story-static-stage__beam feature-story-static-stage__beam--one" />
    <span className="feature-story-static-stage__beam feature-story-static-stage__beam--two" />
    <span className="feature-story-static-stage__rail" />
    <span className="feature-story-static-stage__panel feature-story-static-stage__panel--primary" />
    <span className="feature-story-static-stage__panel feature-story-static-stage__panel--secondary" />
  </div>
);

const FeatureSceneCompositorSurface = ({
  chapters,
  className,
  stateRef,
}: FeatureSceneCompositorSurfaceProps) => (
  <Suspense fallback={<FeatureSceneStaticFallback className={className} />}>
    <FeatureSceneCompositor chapters={chapters} className={className} stateRef={stateRef} />
  </Suspense>
);

const clampProgress = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
};

const lerpValue = (start: number, end: number, progress: number) =>
  start + (end - start) * progress;
const easeOutCubic = (value: number) =>
  1 - Math.pow(1 - clampProgress(value), 3);

const DEFAULT_COLLAPSE = 0.22;
const DEFAULT_VOID_PEAK = 0.72;
const DEFAULT_ARRIVAL = 0.9;
const DEFAULT_SETTLE = 1;
const INTRO_END = 0.22;
const STORY_CUE_START = 0.22;
const STORY_LOOSEN_START = 0.22;
const STORY_DESTRUCTION_START = 0.36;
const STORY_REASSEMBLY_START = 0.72;
const STORY_PANEL_IN_START = 0.9;
const STORY_PANEL_SETTLE_END = 1;
const STORY_VISUAL_SETTLE_START = 1;
const STORY_SCROLL_STOP_DELAY = 90;

const phaseProgress = (value: number, start: number, end: number) => {
  if (end <= start) {
    return value >= end ? 1 : 0;
  }

  return clampProgress((value - start) / (end - start));
};

const getTransitionPhases = (chapter?: FeatureChapter) => {
  const collapseStart = clampProgress(
    chapter?.transitionProfile?.collapseStart ??
      chapter?.transitionProfile?.hold ??
      DEFAULT_COLLAPSE,
  );
  const voidPeak = Math.max(
    collapseStart + 0.1,
    clampProgress(chapter?.transitionProfile?.voidPeak ?? DEFAULT_VOID_PEAK),
  );
  const bridgeHold = chapter?.transitionProfile?.bridgeHold ?? 0.15;
  const arrivalStart = Math.max(
    voidPeak + 0.06,
    clampProgress(
      chapter?.transitionProfile?.arrivalStart ??
        Math.min(
          voidPeak + bridgeHold,
          chapter?.transitionProfile?.burn ?? DEFAULT_ARRIVAL,
        ),
    ),
  );
  const settleEnd = Math.max(
    arrivalStart + 0.08,
    clampProgress(
      chapter?.transitionProfile?.settleEnd ??
        chapter?.transitionProfile?.settle ??
        DEFAULT_SETTLE,
    ),
  );

  return {
    collapseStart,
    voidPeak: Math.min(1, voidPeak),
    arrivalStart: Math.min(1, arrivalStart),
    settleEnd: Math.min(1, settleEnd),
  };
};

const subPhaseFromProgress = (progress: number, chapter?: FeatureChapter) => {
  const clamped = clampProgress(progress);
  const phases = getTransitionPhases(chapter);
  const intro = phaseProgress(
    clamped,
    0,
    Math.min(INTRO_END, phases.collapseStart),
  );

  const scene = phaseProgress(
    clamped,
    Math.min(INTRO_END, phases.collapseStart),
    phases.collapseStart,
  );
  const handoff = phaseProgress(clamped, phases.arrivalStart, phases.settleEnd);

  return {
    introProgress: intro,
    sceneProgress: scene,
    handoffProgress: handoff,
  };
};

const transitionPhaseFromProgress = (
  progress: number,
  chapter?: FeatureChapter,
) => {
  const phases = getTransitionPhases(chapter);
  const clamped = clampProgress(progress);

  if (clamped < STORY_CUE_START) {
    return "hold" as const;
  }

  if (clamped < phases.collapseStart) {
    return "cue" as const;
  }

  if (clamped < phases.voidPeak) {
    return "push" as const;
  }

  if (clamped < phases.arrivalStart) {
    return "commit" as const;
  }

  if (clamped < STORY_VISUAL_SETTLE_START) {
    return "arrive" as const;
  }

  return "settled" as const;
};

const getVoidFocus = (chapter?: FeatureChapter) => {
  switch (chapter?.transitionProfile?.voidShape) {
    case "eclipse":
      return {
        shellX: "56%",
        shellY: "48%",
        shellSize: "42%",
        panelX: "60%",
        panelY: "46%",
        panelSize: "26%",
      };
    case "shard":
      return {
        shellX: "48%",
        shellY: "52%",
        shellSize: "40%",
        panelX: "44%",
        panelY: "54%",
        panelSize: "24%",
      };
    case "veil":
      return {
        shellX: "52%",
        shellY: "45%",
        shellSize: "48%",
        panelX: "54%",
        panelY: "42%",
        panelSize: "28%",
      };
    default:
      return {
        shellX: "52%",
        shellY: "49%",
        shellSize: "40%",
        panelX: "56%",
        panelY: "48%",
        panelSize: "24%",
      };
  }
};

const FeatureStoryPanel = ({
  chapter,
  index,
}: {
  chapter: FeatureChapter;
  index: number;
}) => {
  const accentKey = chapter.accent ?? "lavender";

  return (
    <article
      className="feature-story-panel"
      data-panel-id={chapter.id}
      data-story-panel
    >
      <div className="flex items-center justify-between gap-4">
        <div className={cn("design-badge border", accentBadgeClass[accentKey])}>
          {chapter.label}
        </div>
        <div className="feature-story-scene-chip">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>
      <h2 className="mt-5 font-headline text-3xl font-bold text-white">
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
      {chapter.storyPanel.standout ? (
        <div className="mt-5 border-l border-primary/35 pl-5 text-sm leading-7 text-white/72">
          {chapter.storyPanel.standout}
        </div>
      ) : null}
    </article>
  );
};

const FeatureDetailCrawlPanel = ({
  chapter,
  crawlProgress,
}: {
  chapter: FeatureChapter;
  crawlProgress: number;
}) => {
  const detailNodes = [
    ...chapter.details.callouts.map((callout) => ({
      eyebrow: callout.eyebrow,
      metric: callout.metric,
      title: callout.title,
      description: callout.description,
      note: undefined,
    })),
    ...chapter.details.items.map((item) => ({
      eyebrow: "Workflow",
      metric: undefined,
      title: item.title,
      description: item.description,
      note: item.note,
    })),
  ];

  return (
    <article
      className="feature-story-detail-crawl-panel"
      data-detail-crawl-panel
      data-panel-id={chapter.id}
      style={{ ["--credits-progress" as string]: crawlProgress.toFixed(3) }}
    >
      <div className="feature-story-detail-crawl-panel__mask">
        <div className="feature-story-detail-crawl-panel__crawl">
          {detailNodes.map((node, index) => (
            <section
              className="feature-story-detail-crawl-panel__node"
              key={`${chapter.id}-${node.title}`}
            >
              <div>
                <span>{node.eyebrow}</span>
                {node.metric ? <i>{node.metric}</i> : null}
              </div>
              <strong>{node.title}</strong>
              <p>{node.description}</p>
              {node.note ? <em>{node.note}</em> : null}
              <b>{String(index + 1).padStart(2, "0")}</b>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
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
              alt={chapter.sceneBase.asset.alt}
              className={cn(
                "h-full w-full",
                chapter.sceneBase.asset.fit === "contain"
                  ? "object-contain"
                  : "object-cover",
              )}
              decoding="async"
              fetchpriority="low"
              loading="lazy"
              src={chapter.sceneBase.asset.src}
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
                  alt={fragment.asset.alt}
                  className={cn(
                    "h-full w-full",
                    fragment.asset.fit === "contain"
                      ? "object-contain"
                      : "object-cover",
                  )}
                  decoding="async"
                  fetchpriority="low"
                  loading="lazy"
                  src={fragment.asset.src}
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
  const compositorStateRef = useRef<FeatureSceneCompositorState>({
    activeIndex: 0,
    nextIndex: 0,
    fromIndex: 0,
    toIndex: 0,
    committedIndex: 0,
    visualOwnerIndex: 0,
    transitionDirection: 1,
    transitionPhase: "hold",
    scrollProgress: 0,
    settleProgress: 1,
    ambientProgress: 0,
    loosenProgress: 0,
    destructionProgress: 0,
    reassemblyProgress: 0,
    readableProgress: 1,
    transitionProgress: 0,
    burnProgress: 0,
    transitionActive: 0,
    introProgress: 0,
    sceneProgress: 0,
    handoffProgress: 0,
    reducedMotion: false,
    fragmentStagger: [0, 0],
    pointerX: 0,
    pointerY: 0,
    pointerActive: 0,
  });
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
    const mediaQuery = window.matchMedia("(max-width: 1279px)");
    const syncMobileMedia = () => setLoadMobileStoryMedia(mediaQuery.matches);

    syncMobileMedia();
    mediaQuery.addEventListener("change", syncMobileMedia);

    return () => mediaQuery.removeEventListener("change", syncMobileMedia);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) {
      return;
    }
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) {
        return;
      }
      ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useScrollScene(
    pageRef,
    ({ prefersReducedMotion: reduceMotion, isDesktop, gsap, ScrollTrigger }) => {
      const useDesktopStory =
        isDesktop && window.matchMedia("(min-width: 1280px)").matches;
      const cleanups: Array<() => void> = [];

      gsap.from("[data-features-hero] > *", {
        y: 22,
        opacity: 0,
        duration: 0.72,
        stagger: 0.08,
        ease: "power3.out",
      });

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
          start: useDesktopStory ? "top top+=112" : "top center+=80",
          end: useDesktopStory ? "bottom bottom-=160" : "bottom center",
          onEnter: () => {
            if (!useDesktopStory) {
              setActiveId(chapterId);
            }
          },
          onEnterBack: () => {
            if (!useDesktopStory) {
              setActiveId(chapterId);
            }
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
            if (self.isActive && !useDesktopStory) {
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
        return;
      }

      const panels = gsap.utils.toArray<HTMLElement>("[data-story-panel]");
      const detailCrawlPanels = gsap.utils.toArray<HTMLElement>(
        "[data-detail-crawl-panel]",
      );
      const markers = gsap.utils.toArray<HTMLElement>(
        "[data-feature-story-marker]",
      );
      const viewport = document.querySelector<HTMLElement>(
        ".feature-story-viewport",
      );
      const shell = document.querySelector<HTMLElement>(
        ".feature-story-shell-sticky",
      );
      const storyCanvas = document.querySelector<HTMLElement>(
        ".feature-story-canvas",
      );
      const syncStoryRects = () => {
        const stageBounds = storyCanvas?.getBoundingClientRect();
        const shellBounds = shell?.getBoundingClientRect();
        const stageRect = stageBounds
          ? {
              x: stageBounds.left + stageBounds.width * 0.04,
              y: stageBounds.top + stageBounds.height * 0.05,
              width: stageBounds.width * 0.66,
              height: stageBounds.height * 0.6,
            }
          : shellBounds
            ? {
                x: shellBounds.left,
                y: shellBounds.top,
                width: shellBounds.width,
                height: shellBounds.height,
              }
            : {
                x: 0,
                y: 0,
                width: window.innerWidth,
                height: window.innerHeight,
              };

        compositorStateRef.current.stageRect = stageRect;
        compositorStateRef.current.viewportRect = {
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      };

      syncStoryRects();
      window.addEventListener("resize", syncStoryRects);
      window.addEventListener("scroll", syncStoryRects, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("resize", syncStoryRects);
        window.removeEventListener("scroll", syncStoryRects);
      });

      const crawlMetrics = new WeakMap<
        HTMLElement,
        { distance: number; start: number }
      >();

      const setDetailCrawlProgress = (
        panel: HTMLElement,
        nextProgress: number,
      ) => {
        const progress = clampProgress(nextProgress);
        const metrics = crawlMetrics.get(panel);
        panel.style.setProperty("--credits-progress", `${progress}`);

        if (!metrics) {
          return;
        }

        panel.style.setProperty(
          "--credits-crawl-current-y",
          `${metrics.start - progress * metrics.distance}px`,
        );
      };

      const measureDetailCrawlPanels = () => {
        detailCrawlPanels.forEach((panel) => {
          const mask = panel.querySelector<HTMLElement>(
            ".feature-story-detail-crawl-panel__mask",
          );
          const crawl = panel.querySelector<HTMLElement>(
            ".feature-story-detail-crawl-panel__crawl",
          );

          if (!mask || !crawl) {
            return;
          }

          const panelHeight = panel.clientHeight;
          const maskHeight = mask.clientHeight;
          const crawlHeight = crawl.scrollHeight;
          const start = Math.max(16, Math.min(34, panelHeight * 0.08));
          const tailRoom = Math.max(28, Math.min(72, maskHeight * 0.2));
          const distance = Math.max(
            0,
            crawlHeight + start + tailRoom - maskHeight,
          );
          const currentProgress = Number(
            panel.style.getPropertyValue("--credits-progress") || 0,
          );

          crawlMetrics.set(panel, { distance, start });
          panel.style.setProperty("--credits-crawl-start", `${start}px`);
          panel.style.setProperty(
            "--credits-crawl-distance",
            `${distance}px`,
          );
          panel.style.setProperty("--credits-mask-height", `${maskHeight}px`);
          setDetailCrawlProgress(panel, currentProgress);
        });
      };

      let crawlRefreshFrame = 0;
      const measureDetailCrawlsAndRefresh = (refreshScrollTrigger = false) => {
        measureDetailCrawlPanels();

        if (!refreshScrollTrigger || crawlRefreshFrame) {
          return;
        }

        crawlRefreshFrame = window.requestAnimationFrame(() => {
          crawlRefreshFrame = 0;
          syncStoryRects();
          ScrollTrigger.refresh();
        });
      };

      measureDetailCrawlsAndRefresh();

      const crawlResizeObserver =
        typeof ResizeObserver === "undefined"
          ? undefined
          : new ResizeObserver(() => measureDetailCrawlsAndRefresh(true));
      if (crawlResizeObserver) {
        detailCrawlPanels.forEach((panel) => {
          crawlResizeObserver.observe(panel);
          const mask = panel.querySelector<HTMLElement>(
            ".feature-story-detail-crawl-panel__mask",
          );
          const crawl = panel.querySelector<HTMLElement>(
            ".feature-story-detail-crawl-panel__crawl",
          );
          if (mask) {
            crawlResizeObserver.observe(mask);
          }
          if (crawl) {
            crawlResizeObserver.observe(crawl);
          }
        });
      }

      const handleCrawlResize = () => measureDetailCrawlsAndRefresh(true);
      window.addEventListener("resize", handleCrawlResize);
      cleanups.push(() => {
        window.removeEventListener("resize", handleCrawlResize);
        crawlResizeObserver?.disconnect();
        if (crawlRefreshFrame) {
          window.cancelAnimationFrame(crawlRefreshFrame);
        }
      });

      if ("fonts" in document) {
        let fontsCancelled = false;
        document.fonts.ready.then(() => {
          if (!fontsCancelled) {
            measureDetailCrawlsAndRefresh(true);
          }
        });
        cleanups.push(() => {
          fontsCancelled = true;
        });
      }

      if (viewport && shell) {
        ScrollTrigger.create({
          trigger: viewport,
          start: "top top+=92",
          end: "bottom bottom-=24",
          pin: shell,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      }

      if (shell) {
        shell.style.setProperty("--story-shell-hide", "0");
        shell.style.setProperty("--story-shell-rail-hide", "0");
        shell.style.setProperty("--story-shell-canvas-hide", "0");
        shell.style.setProperty("--story-shell-panel-hide", "0");
        shell.style.setProperty("--story-transition-void", "0");
      }

      Object.assign(compositorStateRef.current, {
        activeIndex: 0,
        nextIndex: 0,
        fromIndex: 0,
        toIndex: 0,
        committedIndex: 0,
        visualOwnerIndex: 0,
        transitionDirection: 1,
        transitionPhase: "hold",
        scrollProgress: 0,
        settleProgress: 1,
        ambientProgress: 0,
        loosenProgress: 0,
        destructionProgress: 0,
        reassemblyProgress: 0,
        readableProgress: 1,
        transitionProgress: 0,
        burnProgress: 0,
        transitionActive: 0,
        introProgress: 0,
        sceneProgress: 0,
        handoffProgress: 0,
        reducedMotion: reduceMotion,
        pointerX: 0,
        pointerY: 0,
        pointerActive: 0,
      });

      panels.forEach((panel, index) => {
        gsap.set(panel, {
          autoAlpha: index === 0 ? 1 : 0,
          yPercent: index === 0 ? 0 : 10,
        });
        panel.style.setProperty("--panel-burn", "0");
        panel.style.setProperty("--panel-scorch", "0");
        panel.style.setProperty("--panel-ember", "0");
        panel.style.setProperty("--panel-angle", "-6deg");
        panel.style.setProperty("--panel-frontier", "50%");
        panel.style.setProperty("--panel-void", "0");
        panel.style.setProperty("--panel-focus-x", "56%");
        panel.style.setProperty("--panel-focus-y", "48%");
        panel.style.setProperty("--panel-void-size", "24%");
      });

      detailCrawlPanels.forEach((panel, index) => {
        gsap.set(panel, {
          autoAlpha: index === 0 ? 1 : 0,
          yPercent: index === 0 ? 0 : 8,
        });
        setDetailCrawlProgress(panel, 0);
        panel.style.setProperty("--panel-scorch", "0");
        panel.style.setProperty("--panel-void", "0");
      });

      if (storyCanvas) {
        storyCanvas.style.setProperty("--shell-burn", "0");
        storyCanvas.style.setProperty("--shell-scorch", "0");
        storyCanvas.style.setProperty("--shell-ember", "0");
        storyCanvas.style.setProperty("--shell-angle", "-6deg");
        storyCanvas.style.setProperty("--shell-frontier", "50%");
        storyCanvas.style.setProperty("--shell-void", "0");
        storyCanvas.style.setProperty("--shell-focus-x", "52%");
        storyCanvas.style.setProperty("--shell-focus-y", "49%");
        storyCanvas.style.setProperty("--shell-void-size", "40%");
        storyCanvas.style.setProperty("--story-pointer-x", "0");
        storyCanvas.style.setProperty("--story-pointer-y", "0");
        storyCanvas.style.setProperty("--story-pointer-active", "0");
        storyCanvas.style.setProperty("--story-shift-x", "0px");
        storyCanvas.style.setProperty("--story-shift-y", "0px");
        storyCanvas.style.setProperty("--story-shell-shift-x", "0px");
        storyCanvas.style.setProperty("--story-shell-shift-y", "0px");
        storyCanvas.style.setProperty("--story-panel-shift-x", "0px");
        storyCanvas.style.setProperty("--story-panel-shift-y", "0px");
        storyCanvas.style.setProperty("--story-transition-active", "0");
        storyCanvas.style.setProperty("--story-transition-void", "0");

        const setPointerVars = (x: number, y: number, active: number) => {
          storyCanvas.style.setProperty("--story-pointer-x", `${x}`);
          storyCanvas.style.setProperty("--story-pointer-y", `${y}`);
          storyCanvas.style.setProperty("--story-pointer-active", `${active}`);
          storyCanvas.style.setProperty("--story-shift-x", `${x * 34}px`);
          storyCanvas.style.setProperty("--story-shift-y", `${y * 28}px`);
          storyCanvas.style.setProperty("--story-shell-shift-x", `${x * 20}px`);
          storyCanvas.style.setProperty("--story-shell-shift-y", `${y * 15}px`);
          storyCanvas.style.setProperty("--story-panel-shift-x", `${x * 12}px`);
          storyCanvas.style.setProperty("--story-panel-shift-y", `${y * 10}px`);
        };

        setPointerVars(0, 0, 0);

        if (!reduceMotion) {
          const pointerState = {
            targetX: 0,
            targetY: 0,
            targetActive: 0,
            currentX: 0,
            currentY: 0,
            currentActive: 0,
          };
          let pointerFrame = 0;
          const pointerTarget = shell ?? viewport ?? storyCanvas;

          const tickPointer = () => {
            syncStoryRects();
            pointerState.currentX = lerpValue(
              pointerState.currentX,
              pointerState.targetX,
              0.16,
            );
            pointerState.currentY = lerpValue(
              pointerState.currentY,
              pointerState.targetY,
              0.16,
            );
            pointerState.currentActive = lerpValue(
              pointerState.currentActive,
              pointerState.targetActive,
              0.14,
            );

            compositorStateRef.current.pointerX = pointerState.currentX;
            compositorStateRef.current.pointerY = pointerState.currentY;
            compositorStateRef.current.pointerActive =
              pointerState.currentActive;
            setPointerVars(
              pointerState.currentX,
              pointerState.currentY,
              pointerState.currentActive,
            );

            pointerFrame = window.requestAnimationFrame(tickPointer);
          };

          const handlePointerMove = (event: PointerEvent) => {
            const bounds = pointerTarget.getBoundingClientRect();
            if (bounds.width <= 0 || bounds.height <= 0) {
              return;
            }

            const nextX =
              ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
            const nextY =
              ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
            pointerState.targetX = Math.max(-1, Math.min(1, nextX));
            pointerState.targetY = Math.max(-1, Math.min(1, nextY));
            pointerState.targetActive = 1;
          };

          const handlePointerLeave = () => {
            pointerState.targetX = 0;
            pointerState.targetY = 0;
            pointerState.targetActive = 0;
          };

          pointerTarget.addEventListener("pointermove", handlePointerMove);
          pointerTarget.addEventListener("pointerleave", handlePointerLeave);
          pointerTarget.addEventListener("pointercancel", handlePointerLeave);
          pointerFrame = window.requestAnimationFrame(tickPointer);

          cleanups.push(() => {
            window.cancelAnimationFrame(pointerFrame);
            pointerTarget.removeEventListener("pointermove", handlePointerMove);
            pointerTarget.removeEventListener(
              "pointerleave",
              handlePointerLeave,
            );
            pointerTarget.removeEventListener(
              "pointercancel",
              handlePointerLeave,
            );
            compositorStateRef.current.pointerX = 0;
            compositorStateRef.current.pointerY = 0;
            compositorStateRef.current.pointerActive = 0;
            setPointerVars(0, 0, 0);
          });
        }
      }

      const storyController = {
        visualProgress: 0,
        lastScrollY: window.scrollY,
        lastScrollTime: performance.now(),
        direction: 1 as 1 | -1,
        activeIndex: 0,
        activeId: featureChapters[0]?.id ?? "",
        progressCache: new Map<string, number>(),
        frameId: 0,
        startedAt: performance.now(),
      };

      const markerProgress = (marker: HTMLElement) => {
        const rect = marker.getBoundingClientRect();
        const startOffset = 112;
        const endOffset = window.innerHeight - 160;
        const travel = Math.max(1, rect.height - endOffset + startOffset);
        return clampProgress((startOffset - rect.top) / travel);
      };

      const getActiveMarkerState = () => {
        const states = markers.map((marker, index) => ({
          index,
          progress: markerProgress(marker),
          rect: marker.getBoundingClientRect(),
        }));
        const active =
          states.find(
            (state) =>
              state.rect.top <= 112 &&
              state.rect.bottom >= window.innerHeight - 160,
          ) ?? states.find((state) => state.progress > 0 && state.progress < 1);

        if (active) {
          return active;
        }

        const beforeFirst = states[0] && states[0].rect.top > 112;
        if (beforeFirst) {
          return { index: 0, progress: 0, rect: states[0]!.rect };
        }

        const upcoming = states.find((state) => state.rect.top > 112);
        if (upcoming) {
          const previousIndex = Math.max(0, upcoming.index - 1);
          const previous = states[previousIndex];
          return previous
            ? { ...previous, progress: 1 }
            : { ...upcoming, progress: 0 };
        }

        const last = states[states.length - 1];
        return last
          ? { ...last, progress: 1 }
          : { index: 0, progress: 0, rect: new DOMRect() };
      };

      const syncCanonicalStory = () => {
        syncStoryRects();

        const now = performance.now();
        const scrollDelta = window.scrollY - storyController.lastScrollY;
        const scrollMoved = Math.abs(scrollDelta) > 0.5;
        if (scrollMoved) {
          storyController.direction = scrollDelta > 0 ? 1 : -1;
          storyController.lastScrollY = window.scrollY;
          storyController.lastScrollTime = now;
        }

        const markerState = getActiveMarkerState();
        const chapter =
          featureChapters[markerState.index] ?? featureChapters[0]!;
        const nextChapter = featureChapters[markerState.index + 1];
        const hasNextPanel = Boolean(
          nextChapter && markerState.index < featureChapters.length - 1,
        );
        const panel = panels[markerState.index];
        const nextPanel = panels[markerState.index + 1];
        const phases = getTransitionPhases(chapter);
        const targetProgress = markerState.progress;
        const smoothing =
          Math.abs(targetProgress - storyController.visualProgress) > 0.46
            ? 0.42
            : 0.18;

        storyController.visualProgress = scrollMoved
          ? targetProgress
          : lerpValue(
              storyController.visualProgress,
              targetProgress,
              smoothing,
            );
        if (Math.abs(storyController.visualProgress - targetProgress) < 0.004) {
          storyController.visualProgress = targetProgress;
        }

        storyController.activeIndex = markerState.index;
        const progress = clampProgress(storyController.visualProgress);
        const loosenProgress = hasNextPanel
          ? phaseProgress(progress, STORY_LOOSEN_START, STORY_DESTRUCTION_START)
          : 0;
        const destructionProgress = hasNextPanel
          ? phaseProgress(
              progress,
              STORY_DESTRUCTION_START,
              STORY_REASSEMBLY_START,
            )
          : 0;
        const reassemblyProgress = hasNextPanel
          ? phaseProgress(
              progress,
              STORY_REASSEMBLY_START,
              STORY_PANEL_IN_START,
            )
          : 1;
        const readableProgress = hasNextPanel
          ? phaseProgress(
              progress,
              STORY_PANEL_IN_START,
              STORY_PANEL_SETTLE_END,
            )
          : 1;
        const collapse = hasNextPanel
          ? phaseProgress(progress, phases.collapseStart, phases.voidPeak)
          : 0;
        const bridge = hasNextPanel
          ? phaseProgress(progress, phases.voidPeak, phases.arrivalStart)
          : 0;
        const burn = hasNextPanel
          ? phaseProgress(progress, phases.collapseStart, phases.arrivalStart)
          : 0;
        const arrival = hasNextPanel
          ? phaseProgress(progress, phases.arrivalStart, phases.settleEnd)
          : 0;
        const panelEntry = hasNextPanel
          ? phaseProgress(
              progress,
              STORY_PANEL_IN_START,
              STORY_PANEL_SETTLE_END,
            )
          : 1;
        const scrollStoppedFor = now - storyController.lastScrollTime;
        const settleProgress = clampProgress(
          (scrollStoppedFor - STORY_SCROLL_STOP_DELAY) / 620,
        );
        const isAuthoredBridge = Boolean(
          chapter.transitionProfile?.authoredBridge,
        );
        const usesScreenwideBridge = isAuthoredBridge && !reduceMotion;
        const inTransition =
          usesScreenwideBridge &&
          progress >= phases.collapseStart &&
          progress < STORY_VISUAL_SETTLE_START;
        const subPhase = subPhaseFromProgress(progress, chapter);
        const shellIgnitionDelay =
          chapter.transitionProfile?.shellIgnitionDelay ?? 0.1;
        const focus = getVoidFocus(chapter);
        const shellVoid = usesScreenwideBridge
          ? phaseProgress(
              progress,
              phases.collapseStart + shellIgnitionDelay * 0.2,
              phases.arrivalStart,
            )
          : 0;
        const panelVoid = usesScreenwideBridge
          ? phaseProgress(
              progress,
              phases.collapseStart + shellIgnitionDelay * 0.44,
              phases.arrivalStart,
            )
          : 0;
        const panelEmber = usesScreenwideBridge
          ? phaseProgress(
              progress,
              phases.collapseStart + shellIgnitionDelay * 0.64,
              phases.settleEnd,
            )
          : 0;
        const edgeAngle = `${chapter.transitionProfile?.edgeAngle ?? -6}deg`;
        const bridgeGlow =
          Math.max(collapse * 0.64, bridge) * (1 - arrival * 0.66);
        const activeBridgeGlow = usesScreenwideBridge ? bridgeGlow : 0;
        const shellCanvasHide = usesScreenwideBridge
          ? clampProgress(
              (collapse * 0.12 + bridge * 0.42) * (1 - arrival * 0.86),
            )
          : 0;
        const shellRailHide = usesScreenwideBridge
          ? clampProgress(
              (collapse * 0.08 + bridge * 0.28) * (1 - arrival * 0.78),
            )
          : 0;
        const shellPanelHide = usesScreenwideBridge
          ? clampProgress(
              (collapse * 0.18 + bridge * 0.5) * (1 - panelEntry * 1.18),
            )
          : 0;
        const shellHide = usesScreenwideBridge
          ? clampProgress(
              (collapse * 0.08 + bridge * 0.36) * (1 - arrival * 0.82),
            )
          : 0;
        const transitionVoid = usesScreenwideBridge
          ? clampProgress(
              Math.max(shellVoid * 0.42, activeBridgeGlow * 0.56) *
                (1 - arrival * 1.08),
            )
          : 0;

        storyCanvas?.style.setProperty("--shell-burn", `${shellVoid * 0.28}`);
        storyCanvas?.style.setProperty("--shell-void", `${shellVoid * 0.36}`);
        storyCanvas?.style.setProperty(
          "--shell-scorch",
          `${Math.max(shellVoid * 0.26, bridge * 0.42)}`,
        );
        storyCanvas?.style.setProperty(
          "--shell-ember",
          `${Math.max(activeBridgeGlow * 0.58, panelEmber * 0.36)}`,
        );
        storyCanvas?.style.setProperty("--shell-angle", edgeAngle);
        storyCanvas?.style.setProperty("--shell-focus-x", focus.shellX);
        storyCanvas?.style.setProperty("--shell-focus-y", focus.shellY);
        storyCanvas?.style.setProperty("--shell-void-size", focus.shellSize);
        storyCanvas?.style.setProperty(
          "--story-transition-active",
          inTransition ? "1" : "0",
        );
        storyCanvas?.style.setProperty(
          "--story-transition-void",
          `${transitionVoid}`,
        );

        panels.forEach((otherPanel) => {
          otherPanel.style.setProperty("--panel-burn", "0");
          otherPanel.style.setProperty("--panel-void", "0");
          otherPanel.style.setProperty("--panel-scorch", "0");
          otherPanel.style.setProperty("--panel-ember", "0");
          otherPanel.style.setProperty("--panel-angle", edgeAngle);
          otherPanel.style.setProperty("--panel-focus-x", focus.panelX);
          otherPanel.style.setProperty("--panel-focus-y", focus.panelY);
          otherPanel.style.setProperty("--panel-void-size", focus.panelSize);
        });

        detailCrawlPanels.forEach((otherPanel) => {
          setDetailCrawlProgress(otherPanel, 0);
          otherPanel.style.setProperty("--panel-scorch", "0");
          otherPanel.style.setProperty("--panel-void", "0");
        });

        if (panel) {
          panel.style.setProperty("--panel-burn", `${panelVoid * 0.3}`);
          panel.style.setProperty("--panel-void", `${panelVoid * 0.34}`);
          panel.style.setProperty(
            "--panel-scorch",
            `${Math.max(panelVoid * 0.24, bridge * 0.3)}`,
          );
          panel.style.setProperty("--panel-ember", `${panelEmber * 0.34}`);
        }

        const detailPanel = detailCrawlPanels[markerState.index];
        const nextDetailPanel = hasNextPanel
          ? detailCrawlPanels[markerState.index + 1]
          : undefined;
        if (detailPanel) {
          setDetailCrawlProgress(detailPanel, progress);
          detailPanel.style.setProperty(
            "--panel-scorch",
            `${Math.max(panelVoid * 0.16, bridge * 0.2)}`,
          );
          detailPanel.style.setProperty("--panel-void", `${panelVoid * 0.2}`);
        }

        shell?.style.setProperty("--story-shell-hide", `${shellHide}`);
        shell?.style.setProperty("--story-shell-rail-hide", `${shellRailHide}`);
        shell?.style.setProperty(
          "--story-shell-canvas-hide",
          `${shellCanvasHide}`,
        );
        shell?.style.setProperty(
          "--story-shell-panel-hide",
          `${shellPanelHide}`,
        );
        shell?.style.setProperty(
          "--story-transition-void",
          `${transitionVoid}`,
        );
        document.documentElement.style.setProperty(
          "--feature-story-portal-opacity",
          inTransition
            ? `${clampProgress((destructionProgress * 0.05 + bridge * 0.04) * (1 - readableProgress))}`
            : "0",
        );

        const visualOwnerIndex =
          hasNextPanel && progress >= phases.voidPeak
            ? markerState.index + 1
            : markerState.index;
        const visualOwnerId = featureChapters[visualOwnerIndex]?.id;
        if (visualOwnerId && visualOwnerId !== storyController.activeId) {
          storyController.activeId = visualOwnerId;
          setActiveId(visualOwnerId);
        }

        const currentPanelExit = hasNextPanel
          ? phaseProgress(
              progress,
              STORY_CUE_START,
              STORY_DESTRUCTION_START + 0.16,
            )
          : 0;
        const currentPanelOpacity = hasNextPanel ? 1 - currentPanelExit : 1;
        const easedPanelEntry = easeOutCubic(panelEntry);
        const detailEntry = hasNextPanel
          ? phaseProgress(progress, phases.voidPeak, STORY_PANEL_SETTLE_END)
          : 1;
        const easedDetailEntry = easeOutCubic(detailEntry);

        panels.forEach((otherPanel, otherIndex) => {
          if (otherPanel !== panel && otherPanel !== nextPanel) {
            gsap.set(otherPanel, {
              autoAlpha:
                otherIndex === visualOwnerIndex && !hasNextPanel ? 1 : 0,
              pointerEvents: "none",
            });
          }
        });

        detailCrawlPanels.forEach((otherPanel, otherIndex) => {
          if (otherPanel !== detailPanel && otherPanel !== nextDetailPanel) {
            gsap.set(otherPanel, {
              autoAlpha:
                otherIndex === visualOwnerIndex && !hasNextPanel ? 1 : 0,
            });
          }
        });

        if (panel) {
          gsap.set(panel, {
            autoAlpha: currentPanelOpacity,
            pointerEvents: currentPanelOpacity > 0.08 ? "auto" : "none",
            yPercent: reduceMotion ? 0 : -5 * currentPanelExit,
            xPercent: reduceMotion ? 0 : -8 * currentPanelExit,
          });
        }

        if (nextPanel) {
          gsap.set(nextPanel, {
            autoAlpha: easedPanelEntry,
            pointerEvents: easedPanelEntry > 0.9 ? "auto" : "none",
            yPercent: reduceMotion ? 0 : 8 * (1 - easedPanelEntry),
            xPercent: reduceMotion ? 0 : 5 * (1 - easedPanelEntry),
          });
        }

        if (detailPanel) {
          gsap.set(detailPanel, {
            autoAlpha: currentPanelOpacity,
            yPercent: reduceMotion ? 0 : -4 * currentPanelExit,
          });
        }

        if (nextDetailPanel) {
          setDetailCrawlProgress(nextDetailPanel, detailEntry);
          gsap.set(nextDetailPanel, {
            autoAlpha: easedDetailEntry,
            yPercent: reduceMotion ? 0 : 6 * (1 - easedDetailEntry),
          });
        }

        Object.assign(compositorStateRef.current, {
          activeIndex: markerState.index,
          nextIndex: hasNextPanel ? markerState.index + 1 : markerState.index,
          fromIndex: markerState.index,
          toIndex: hasNextPanel ? markerState.index + 1 : markerState.index,
          committedIndex: visualOwnerIndex,
          visualOwnerIndex,
          transitionDirection: storyController.direction,
          transitionPhase: hasNextPanel
            ? transitionPhaseFromProgress(progress, chapter)
            : "hold",
          scrollProgress: targetProgress,
          settleProgress,
          ambientProgress: (now - storyController.startedAt) / 1000,
          loosenProgress,
          destructionProgress,
          reassemblyProgress,
          readableProgress,
          transitionProgress: progress,
          burnProgress: burn,
          transitionActive: inTransition ? 1 : 0,
          introProgress: subPhase.introProgress,
          sceneProgress: subPhase.sceneProgress,
          handoffProgress: subPhase.handoffProgress,
          reducedMotion: reduceMotion,
        });

        const chapterId = chapter.id;
        const cachedProgress =
          storyController.progressCache.get(chapterId) ?? -1;
        if (Math.abs(targetProgress - cachedProgress) >= 0.025) {
          storyController.progressCache.set(chapterId, targetProgress);
          setProgressById((previous) => ({
            ...previous,
            [chapterId]: targetProgress,
          }));
        }

        storyController.frameId =
          window.requestAnimationFrame(syncCanonicalStory);
      };

      storyController.frameId =
        window.requestAnimationFrame(syncCanonicalStory);
      cleanups.push(() => window.cancelAnimationFrame(storyController.frameId));

      return () => {
        shell?.style.setProperty("--story-shell-hide", "0");
        shell?.style.setProperty("--story-shell-rail-hide", "0");
        shell?.style.setProperty("--story-shell-canvas-hide", "0");
        shell?.style.setProperty("--story-shell-panel-hide", "0");
        shell?.style.setProperty("--story-transition-void", "0");
        storyCanvas?.style.setProperty("--story-transition-active", "0");
        storyCanvas?.style.setProperty("--story-transition-void", "0");
        document.documentElement.style.setProperty(
          "--feature-story-portal-opacity",
          "0",
        );
        Object.assign(compositorStateRef.current, {
          fromIndex: compositorStateRef.current.activeIndex,
          toIndex: compositorStateRef.current.activeIndex,
          committedIndex: compositorStateRef.current.activeIndex,
          visualOwnerIndex: compositorStateRef.current.activeIndex,
          transitionDirection: 1,
          transitionPhase: "hold",
          scrollProgress: 0,
          settleProgress: 1,
          loosenProgress: 0,
          destructionProgress: 0,
          reassemblyProgress: 0,
          readableProgress: 1,
        });
        cleanups.forEach((cleanup) => cleanup());
      };
    },
  );

  const activeProgress = clampProgress(progressById[activeChapter.id]);
  const ActiveChapterIcon = chapterIcons[activeChapter.id] ?? Sparkles;
  const HeroChapterIcon = chapterIcons[featureChapters[0]?.id ?? ""] ?? Layers3;

  return (
    <main
      ref={pageRef}
      className="design-page-main feature-story-page route-appear"
      id="main-content"
    >
      <PageSeo {...featurePageSeo} />
      <DeferredAfterIntro delay={520}>
        <Suspense fallback={null}>
          <FeaturesStoryBackdrop
            chapter={activeChapter}
            chapters={featureChapters}
            progress={activeProgress}
            stateRef={compositorStateRef}
          />
        </Suspense>
      </DeferredAfterIntro>

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
                  alt={featureChapters[0]!.sceneBase.asset.alt}
                  className="h-[22rem] w-full object-cover md:h-[27rem] xl:h-[31rem]"
                  decoding="async"
                  fetchpriority="high"
                  loading="eager"
                  src={featureChapters[0]!.sceneBase.asset.src}
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
                      WebGL stage
                    </span>
                  </div>
                </div>
                <div className="feature-story-hero-stage feature-story-hero-stage--secondary overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/36">
                  <img
                    alt={featureChapters[3]!.sceneBase.asset.alt}
                    className="h-52 w-full object-cover"
                    decoding="async"
                    fetchpriority="low"
                    loading="lazy"
                    src={featureChapters[3]!.sceneBase.asset.src}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-story-viewport">
          <DeferredClientStage
            className="feature-story-deferred-layer"
            fallback={null}
            idleDelay={2400}
            idleTimeout={4200}
            rootMargin="240px 0px"
          >
            <Suspense fallback={null}>
              <FeatureStoryUnifiedTransition
                chapters={featureChapters}
                stateRef={compositorStateRef}
              />
            </Suspense>
          </DeferredClientStage>

          <div className="feature-story-shell-sticky hidden xl:block">
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
                <div className="feature-story-canvas">
                  <DeferredClientStage
                    className="h-full"
                    fallback={<FeatureSceneStaticFallback />}
                    idleDelay={2600}
                    idleTimeout={4600}
                    rootMargin="240px 0px"
                  >
                    <Suspense
                      fallback={<FeatureSceneStaticFallback />}
                    >
                      <FeatureSceneWebGLStage
                        chapters={featureChapters}
                        fallback={
                          <FeatureSceneCompositorSurface
                            chapters={featureChapters}
                            stateRef={compositorStateRef}
                          />
                        }
                        stateRef={compositorStateRef}
                      />
                    </Suspense>
                  </DeferredClientStage>
                  <div className="feature-story-panel-stack">
                    {featureChapters.map((chapter, index) => (
                      <FeatureStoryPanel
                        chapter={chapter}
                        index={index}
                        key={chapter.id}
                      />
                    ))}
                  </div>
                  <div className="feature-story-detail-crawl-stack">
                    {featureChapters.map((chapter) => (
                      <FeatureDetailCrawlPanel
                        chapter={chapter}
                        crawlProgress={clampProgress(progressById[chapter.id])}
                        key={`${chapter.id}-detail-crawl`}
                      />
                    ))}
                  </div>
                  <Suspense fallback={null}>
                    <ChapterIntroOverlay
                      chapters={featureChapters}
                      stateRef={compositorStateRef}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:hidden">
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
                  className="feature-story-marker hidden xl:block"
                  data-chapter-id={chapter.id}
                  data-feature-story-marker
                >
                  <span className="sr-only">{chapter.storyPanel.title}</span>
                </div>

                <div className="xl:hidden" data-chapter-id={chapter.id}>
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
                  <Link to={featuresFinalCta.primaryCta.to}>
                    {featuresFinalCta.primaryCta.label}
                  </Link>
                </Button>
                <Button asChild className="rounded-2xl px-8" variant="outline">
                  <Link to={featuresFinalCta.secondaryCta.to}>
                    {featuresFinalCta.secondaryCta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild className="rounded-2xl px-8" variant="ghost">
                  <Link to="/github">
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
