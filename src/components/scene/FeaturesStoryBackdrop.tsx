import { createPortal } from "react-dom";
import type { AccentTone, FeatureChapter } from "@/data/marketing";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

interface FeaturesStoryBackdropProps {
  chapter: FeatureChapter;
  chapters: FeatureChapter[];
  progress: number;
  className?: string;
}

const washMap: Record<AccentTone, string> = {
  lavender:
    "radial-gradient(circle at 18% 12%, rgba(199,180,255,0.14), transparent 26%), radial-gradient(circle at 84% 78%, rgba(116,241,169,0.06), transparent 34%), linear-gradient(180deg, rgba(5,7,13,1), rgba(3,4,9,1))",
  emerald:
    "radial-gradient(circle at 16% 14%, rgba(116,241,169,0.14), transparent 26%), radial-gradient(circle at 82% 80%, rgba(185,231,255,0.06), transparent 34%), linear-gradient(180deg, rgba(5,8,11,1), rgba(3,5,9,1))",
  amber:
    "radial-gradient(circle at 18% 14%, rgba(255,201,113,0.14), transparent 26%), radial-gradient(circle at 82% 78%, rgba(199,180,255,0.06), transparent 34%), linear-gradient(180deg, rgba(8,7,5,1), rgba(4,3,2,1))",
  frost:
    "radial-gradient(circle at 20% 12%, rgba(185,231,255,0.14), transparent 26%), radial-gradient(circle at 80% 80%, rgba(199,180,255,0.06), transparent 34%), linear-gradient(180deg, rgba(5,8,12,1), rgba(3,5,10,1))",
};

const clampProgress = (value: number) => Math.max(0, Math.min(1, value));

const FeaturesStoryBackdrop = ({
  chapter,
  chapters,
  progress,
  className,
}: FeaturesStoryBackdropProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const accent = chapter.accent ?? "lavender";
  const wash = washMap[accent];
  const stageProgress = clampProgress(progress);

  const backdrop = (
    <div
      aria-hidden="true"
      className={cn(
        "feature-story-backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
      style={{ background: "var(--feature-void)" }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: wash, opacity: prefersReducedMotion ? 0.6 : 1 }}
      />

      <div
        className="feature-story-backdrop__grid"
        style={{ opacity: prefersReducedMotion ? 0.06 : 0.1 + stageProgress * 0.08 }}
      />

      <div className="feature-story-backdrop__constellation-lite">
        {chapters.map((item, index) => (
          <span
            className={cn(
              "feature-story-backdrop__node",
              item.id === chapter.id && "is-active",
            )}
            data-accent={item.accent ?? "lavender"}
            key={item.id}
            style={
              {
                "--feature-backdrop-node-x": `${
                  chapters.length <= 1
                    ? 50
                    : 14 + (index / (chapters.length - 1)) * 72
                }%`,
                "--feature-backdrop-node-y": `${index % 2 === 0 ? 28 : 68}%`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <span
        className="feature-story-backdrop__ghost feature-story-backdrop__ghost--primary absolute left-[8%] top-[18%] aspect-[16/10]"
        style={{ opacity: prefersReducedMotion ? 0.08 : 0.08 + stageProgress * 0.04 }}
      />
      <span
        className="feature-story-backdrop__ghost feature-story-backdrop__ghost--secondary absolute bottom-[12%] right-[10%] aspect-[4/3]"
        style={{ opacity: prefersReducedMotion ? 0.06 : 0.06 + stageProgress * 0.03 }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
          opacity: prefersReducedMotion ? 0.08 : 0.1 + stageProgress * 0.08,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
          opacity: prefersReducedMotion ? 0.12 : 0.22,
        }}
      />
    </div>
  );

  if (typeof document === "undefined") {
    return backdrop;
  }

  return createPortal(backdrop, document.body);
};

export default FeaturesStoryBackdrop;
