import type { ArrangementVariant } from "../stages/arrangementScript";
import type { NamRackSection } from "../stages/namRackScript";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { type ComponentType, lazy, Suspense, useEffect, useRef, useState } from "react";
import { scheduleAfterInitialLoad } from "@/lib/initialLoad";
import { preloadModuleOnce } from "@/lib/runtimePreloadRegistry";
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
export type StageSelection =
  | { id: "arrangement"; variant?: ArrangementVariant }
  | { id: "nam-rack"; variant?: NamRackVariantName }
  | { id: Exclude<StageId, "arrangement" | "nam-rack">; variant?: never };

export type StageId =
  | "arrangement"
  | "mixer"
  | "piano-roll"
  | "render-dialog"
  | "nam-chain"
  | "plugin-window"
  | "nam-rack"
  | "pitch-editor";

// One lazy chunk per stage. The test walks this map, so every entry must
// point at an existing src/features/daw-preview/stages/<Name>.tsx default export.
const STAGE_LOADERS: Record<StageId, () => Promise<{ default: ComponentType<StageProps> }>> = {
  arrangement: () => import("../stages/ArrangementStage"),
  mixer: () => import("../stages/MixerStage"),
  "piano-roll": () => import("../stages/PianoRollStage"),
  "render-dialog": () => import("../stages/RenderDialogStage"),
  "nam-chain": () => import("../stages/NamChainStage"),
  "plugin-window": () => import("../stages/PluginWindowStage"),
  "nam-rack": () => import("../stages/NamRackStage"),
  "pitch-editor": () => import("../stages/PitchEditorStage"),
};

const lazyStage = (id: StageId) => lazy(() => preloadModuleOnce(`stage:${id}`, STAGE_LOADERS[id]));
const STAGES = {
  arrangement: lazyStage("arrangement"),
  mixer: lazyStage("mixer"),
  "piano-roll": lazyStage("piano-roll"),
  "render-dialog": lazyStage("render-dialog"),
  "nam-chain": lazyStage("nam-chain"),
  "plugin-window": lazyStage("plugin-window"),
  "nam-rack": lazyStage("nam-rack"),
  "pitch-editor": lazyStage("pitch-editor"),
} satisfies Record<StageId, ComponentType<StageProps>>;

/** Warms a stage chunk (e.g. the carousel's next slide) without rendering it. */
export const preloadStage = (id: StageId) => preloadModuleOnce(`stage:${id}`, STAGE_LOADERS[id]);

type LiveStageProps = StageSelection & {
  /** The screenshot shown until the stage has mounted (and if it never does). */
  poster: string;
  alt: string;
  /** Skip the near-viewport gate (the initial-load gate always applies). */
  eager?: boolean;
  priority?: number;
  className?: string;
  /** Design aspect of the stage; reserves the box so the swap causes no layout shift. */
  ratio?: string;
};

/** Fires once the lazy stage next to it has committed. */
const Mounted = ({ onMount }: { onMount: () => void }) => {
  useEffect(onMount, [onMount]);
  return null;
};

/**
 * A screenshot that becomes a live stage. The chunk is imported only after
 * the initial load has settled and the box is near the viewport, so stages
 * never join the first request waterfall; the poster stays as the Suspense
 * fallback and as the no-JS state.
 */
export const LiveStage = ({
  id,
  variant,
  poster,
  alt,
  eager = false,
  priority,
  className = "",
  ratio = "16 / 9",
}: LiveStageProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(false);
  const [near, setNear] = useState(eager);
  const [live, setLive] = useState(false);

  useEffect(() => scheduleAfterInitialLoad(() => setSettled(true), { delay: 400, timeout: 2000 }), []);

  useEffect(() => {
    if (near) return;
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [near]);

  const Stage = STAGES[id];
  const ready = settled && near;

  return (
    <div
      ref={ref}
      className={`sp-live-stage ${className}`.trim()}
      data-live={live}
      data-stage={id}
      style={{ aspectRatio: ratio }}
    >
      {ready ? (
        <ErrorBoundary fallback={null} onError={() => setLive(false)}>
          <Suspense fallback={null}>
            <Stage priority={priority} variant={variant} />
            <Mounted onMount={() => setLive(true)} />
          </Suspense>
        </ErrorBoundary>
      ) : null}
      <ResponsiveImage
        alt={live ? "" : alt}
        aria-hidden={live || undefined}
        className="sp-live-stage__poster"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        src={poster}
      />
    </div>
  );
};
