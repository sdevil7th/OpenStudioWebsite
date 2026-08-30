import type { CSSProperties } from "react";
import { Activity, Cable, Sparkles } from "lucide-react";
import type { AccentTone, FeatureChapter } from "@/data/marketing";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { getResponsiveImageAttributes } from "@/lib/assetLoading";
import { cn } from "@/lib/utils";

interface FeatureCanonicalStoryProps {
  activeId: string;
  chapters: FeatureChapter[];
  progressById: Record<string, number>;
}

const accentLabelClass: Record<AccentTone, string> = {
  lavender: "border-primary/25 bg-primary/10 text-primary",
  amber: "border-accent/20 bg-accent/10 text-accent",
  emerald: "border-secondary/25 bg-secondary/10 text-secondary",
  frost: "border-white/15 bg-white/[0.06] text-white/82",
};

const clampProgress = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
};

const revealProgress = (value: number, start: number, end: number) => {
  if (end <= start) {
    return value >= end ? 1 : 0;
  }

  return clampProgress((value - start) / (end - start));
};

const FeatureCanonicalStory = ({
  activeId,
  chapters,
  progressById,
}: FeatureCanonicalStoryProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const activeIndex = Math.max(
    0,
    chapters.findIndex((chapter) => chapter.id === activeId),
  );
  const activeChapter = chapters[activeIndex] ?? chapters[0]!;
  const activeAccent = activeChapter.accent ?? "lavender";
  const activeProgress = clampProgress(progressById[activeChapter.id]);
  const nextReveal = prefersReducedMotion
    ? 0
    : revealProgress(activeProgress, 0.72, 0.96);
  const activeCallout = activeChapter.details.callouts[0];
  const supportingCallout = activeChapter.details.callouts[1];
  const detailItems = activeChapter.details.items.slice(0, 3);

  return (
    <div
      className="feature-canonical-story"
      data-accent={activeAccent}
      style={
        {
          "--feature-canonical-progress": activeProgress.toFixed(3),
        } as CSSProperties
      }
    >
      <div className="feature-canonical-story__stage">
        <div className="feature-canonical-story__stage-chrome">
          <span>
            <Activity className="h-4 w-4" />
            Live chapter focus
          </span>
          <strong>{`${String(activeIndex + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`}</strong>
        </div>

        <div className="feature-canonical-story__diorama" aria-hidden="true">
          {chapters.map((chapter, index) => {
            const isActive = index === activeIndex;
            const isNext = index === activeIndex + 1;
            const isPrevious = index === activeIndex - 1;
            const shouldLoadMedia = isActive || isNext || isPrevious;
            const stageOpacity = prefersReducedMotion
              ? isActive
                ? 1
                : 0
              : isActive
                ? 1 - nextReveal * 0.34
                : isNext
                  ? nextReveal
                  : isPrevious && activeProgress < 0.08
                    ? 0.18 * (1 - activeProgress / 0.08)
                    : 0;
            const stageShift = prefersReducedMotion
              ? 0
              : isActive
                ? -activeProgress * 8
                : isNext
                  ? 18 * (1 - nextReveal)
                  : 0;
            const stageScale = prefersReducedMotion
              ? 1
              : isActive
                ? 1 + activeProgress * 0.018
                : 0.975 + nextReveal * 0.025;

            return (
              <section
                className="feature-canonical-story__chapter"
                data-current={isActive ? "true" : "false"}
                data-next={isNext ? "true" : "false"}
                key={chapter.id}
                style={
                  {
                    "--feature-canonical-chapter-opacity": stageOpacity.toFixed(3),
                    "--feature-canonical-chapter-shift": `${stageShift.toFixed(2)}px`,
                    "--feature-canonical-chapter-scale": stageScale.toFixed(3),
                  } as CSSProperties
                }
              >
                <div className="feature-canonical-story__base">
                  {shouldLoadMedia ? (
                    <img
                      {...getResponsiveImageAttributes(chapter.sceneBase.asset.src, isActive ? "story-active" : "story-next", {
                        maxWidth: 1280,
                        sizes: "(min-width: 1600px) 48vw, (min-width: 1280px) 46vw, 58vw",
                      })}
                      alt=""
                      className={cn(
                        "h-full w-full",
                        chapter.sceneBase.asset.fit === "contain" ? "object-contain" : "object-cover",
                      )}
                    />
                  ) : null}
                  <span />
                </div>

                {chapter.sceneFragments.slice(0, 2).map((fragment, fragmentIndex) => (
                  <div
                    className={cn(
                      "feature-canonical-story__fragment",
                      fragmentIndex === 0
                        ? "feature-canonical-story__fragment--motion"
                        : "feature-canonical-story__fragment--detail",
                    )}
                    key={fragment.id}
                  >
                    {shouldLoadMedia ? (
                      <img
                        {...getResponsiveImageAttributes(fragment.asset.src, "story-next", {
                          maxWidth: 768,
                          sizes: "(min-width: 1280px) 18vw, 24vw",
                        })}
                        alt=""
                        className={cn(
                          "h-full w-full",
                          fragment.asset.fit === "contain" ? "object-contain" : "object-cover",
                        )}
                      />
                    ) : null}
                    <small>{fragment.label ?? fragment.asset.label}</small>
                  </div>
                ))}
              </section>
            );
          })}
        </div>

        <div
          aria-hidden="true"
          className="feature-canonical-story__chapter-title-stack"
          data-feature-chapter-title-stack
        >
          {chapters.map((chapter, index) => {
            const isActive = index === activeIndex;
            const accent = chapter.accent ?? "lavender";
            const numeral = chapter.numeral ?? String(index + 1);
            const titleExitProgress = prefersReducedMotion
              ? isActive
                ? 0
                : 1
              : isActive
                ? revealProgress(activeProgress, 0.34, 0.52)
                : 1;
            const titleOpacity = isActive
              ? (1 - titleExitProgress) * 0.9
              : 0;
            const titleScale = isActive
              ? 1 - titleExitProgress * 0.02
              : 0.98;

            return (
              <div
                className="feature-canonical-story__chapter-title-layer"
                data-accent={accent}
                data-current={isActive ? "true" : "false"}
                data-feature-chapter-title-layer
                key={chapter.id}
                style={
                  {
                    "--feature-title-opacity": titleOpacity.toFixed(3),
                    "--feature-title-scale": titleScale.toFixed(3),
                  } as CSSProperties
                }
              >
                <span className="feature-canonical-story__chapter-title-numeral">
                  {numeral}
                </span>
                <span className="feature-canonical-story__chapter-title-rule" />
                <h2>{chapter.introTitle ?? chapter.label}</h2>
                {chapter.introTagline ? (
                  <p>{chapter.introTagline}</p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="feature-canonical-story__floor" aria-hidden="true" />
      </div>

      <aside className="feature-canonical-story__copy">
        <div className="flex items-center justify-between gap-3">
          <span className={cn("design-badge border", accentLabelClass[activeAccent])}>
            {activeChapter.label}
          </span>
          <span className="feature-canonical-story__numeral">
            {activeChapter.numeral ?? String(activeIndex + 1)}
          </span>
        </div>
        <h2>{activeChapter.storyPanel.title}</h2>
        <p>{activeChapter.storyPanel.description}</p>
        <div className="feature-canonical-story__rails">
          {activeChapter.storyPanel.rail.map((rail) => (
            <span key={rail}>{rail}</span>
          ))}
        </div>
      </aside>

      <aside className="feature-canonical-story__inspect">
        <div className="feature-canonical-story__inspect-top">
          <Cable className="h-4 w-4" />
          <span>Signal inspection</span>
        </div>
        {activeCallout ? (
          <div className="feature-canonical-story__callout">
            <span>{activeCallout.eyebrow}</span>
            <strong>{activeCallout.title}</strong>
            <p>{activeCallout.description}</p>
          </div>
        ) : null}
        {supportingCallout ? (
          <div className="feature-canonical-story__metric">
            <Sparkles className="h-4 w-4" />
            <span>{supportingCallout.metric ?? supportingCallout.eyebrow}</span>
          </div>
        ) : null}
        <div className="feature-canonical-story__detail-list">
          {detailItems.map((item) => (
            <div key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default FeatureCanonicalStory;
