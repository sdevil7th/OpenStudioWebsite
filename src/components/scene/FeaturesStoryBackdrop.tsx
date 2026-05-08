import { createPortal } from "react-dom";
import StarField from "@/components/scene/StarField";
import ConstellationField from "@/components/scene/ConstellationField";
import type { FeatureSceneCompositorState } from "@/components/scene/FeatureSceneCompositor";
import type { AccentTone, FeatureChapter } from "@/data/marketing";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

interface FeaturesStoryBackdropProps {
  chapter: FeatureChapter;
  chapters: FeatureChapter[];
  stateRef: React.MutableRefObject<FeatureSceneCompositorState>;
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
  stateRef,
  progress,
  className,
}: FeaturesStoryBackdropProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const accent = chapter.accent ?? "lavender";
  const wash = washMap[accent];
  const stageProgress = clampProgress(progress);
  const accentByIndex = chapters.map(
    (item) => item.accent ?? ("lavender" as AccentTone),
  );

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

      <StarField
        accentByIndex={accentByIndex}
        className="feature-story-backdrop__stars"
        stateRef={stateRef}
      />

      <ConstellationField
        chapters={chapters}
        className="feature-story-backdrop__constellation"
        stateRef={stateRef}
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
