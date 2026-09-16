import type { ArrangementVariant } from "../stages/arrangementScript";
import type { NamRackSection } from "../stages/namRackScript";
import { type ComponentType, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/** Props every stage accepts. `variant` is stage-specific and passed through. */
export interface StageProps {
  variant?: ArrangementVariant | NamRackVariantName;
  /** Ranks the stage in the scheduler; the hero and carousel pass 1. */
  priority?: number;
  className?: string;
}

export type NamRackVariantName =
  | NamRackSection
  | `${NamRackSection}+tuner`
  | `${NamRackSection}+tour`
  | `${NamRackSection}+tuner+tour`;
export type StageSelection = (
  | { id: "arrangement"; variant?: ArrangementVariant }
  | { id: "nam-rack"; variant?: NamRackVariantName }
  | { id: Exclude<StageId, "arrangement" | "nam-rack">; variant?: never }
) & { component: ComponentType<StageProps> };

export type StageId =
  | "arrangement"
  | "mixer"
  | "piano-roll"
  | "render-dialog"
  | "nam-chain"
  | "plugin-window"
  | "nam-rack"
  | "pitch-editor";

type LiveStageProps = StageSelection & {
  alt: string;
  priority?: number;
  className?: string;
  /** Design aspect of the stage, shared by its rest frame and animation. */
  ratio?: string;
};

/**
 * The real illustration renders its rest frame immediately, including in HTML
 * prerendering. Its existing timeline driver loads GSAP later and animates these
 * same elements. Each lazy page imports only the renderers it actually uses.
 */
export const LiveStage = ({
  id,
  variant,
  component: Stage,
  alt,
  priority,
  className = "",
  ratio = "16 / 9",
}: LiveStageProps) => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`sp-live-stage ${className}`.trim()}
      data-live={!failed}
      data-stage={id}
      style={{ aspectRatio: ratio }}
    >
      <ErrorBoundary
        onError={() => setFailed(true)}
        fallback={<div role="img" aria-label={alt} className="absolute inset-0 grid place-items-center text-sm text-slate-300">Illustration unavailable</div>}
      >
        <Stage priority={priority} variant={variant} />
      </ErrorBoundary>
    </div>
  );
};
