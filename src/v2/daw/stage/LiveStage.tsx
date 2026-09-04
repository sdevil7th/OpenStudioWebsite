import { type ComponentType, lazy, Suspense, useEffect, useRef, useState } from "react";
import { scheduleAfterInitialLoad } from "@/lib/initialLoad";
import { preloadModuleOnce } from "@/lib/runtimePreloadRegistry";

/** Props every stage accepts. `variant` is stage-specific and passed through. */
export interface StageProps {
  variant?: string;
  /** Ranks the stage in the scheduler; the hero and carousel pass 1. */
  priority?: number;
  className?: string;
}

export type StageId = "arrangement" | "mixer" | "piano-roll" | "render-dialog" | "nam-chain" | "plugin-window" | "nam-rack";

// One lazy chunk per stage. The test walks this map, so every entry must
// point at an existing src/v2/daw/stages/<Name>.tsx default export.
const STAGE_LOADERS: Record<StageId, () => Promise<{ default: ComponentType<StageProps> }>> = {
  "arrangement": () => import("../stages/ArrangementStage"),
  "mixer": () => import("../stages/MixerStage"),
  "piano-roll": () => import("../stages/PianoRollStage"),
  "render-dialog": () => import("../stages/RenderDialogStage"),
  "nam-chain": () => import("../stages/NamChainStage"),
  "plugin-window": () => import("../stages/PluginWindowStage"),
  "nam-rack": () => import("../stages/NamRackStage"),
};

const STAGES = Object.fromEntries(
  (Object.keys(STAGE_LOADERS) as StageId[]).map((id) => [id, lazy(() => preloadModuleOnce(`stage:${id}`, STAGE_LOADERS[id]))]),
) as unknown as Record<StageId, ComponentType<StageProps>>;

/** Warms a stage chunk (e.g. the carousel's next slide) without rendering it. */
export const preloadStage = (id: StageId) => preloadModuleOnce(`stage:${id}`, STAGE_LOADERS[id]);

interface LiveStageProps {
  id: StageId;
  variant?: string;
  /** The screenshot shown until the stage has mounted (and if it never does). */
  poster: string;
  alt: string;
  /** Skip the near-viewport gate (the initial-load gate always applies). */
  eager?: boolean;
  priority?: number;
  className?: string;
  /** Design aspect of the stage; reserves the box so the swap causes no layout shift. */
  ratio?: string;
}

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
export const LiveStage = ({ id, variant, poster, alt, eager = false, priority, className = "", ratio = "16 / 9" }: LiveStageProps) => {
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
    <div ref={ref} className={`sp-live-stage ${className}`.trim()} data-live={live} data-stage={id} style={{ aspectRatio: ratio }}>
      {ready ? (
        <Suspense fallback={null}>
          <Stage priority={priority} variant={variant} />
          <Mounted onMount={() => setLive(true)} />
        </Suspense>
      ) : null}
      <img alt={alt} className="sp-live-stage__poster" loading="lazy" src={poster} />
    </div>
  );
};
