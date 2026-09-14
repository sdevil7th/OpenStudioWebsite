import { type RefObject, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { loadGsap } from "@/lib/gsap";
import { scheduleAfterInitialLoad } from "@/lib/initialLoad";
import { isStageAllowed, registerStage, updateStageRatio, type StageEntry } from "./stageScheduler";

/** GSAP declares its namespace globally, so no runtime import is needed for the type. */
export type StageTimeline = gsap.core.Timeline;

/**
 * What a stage teaches the driver. Numeric values tween on a proxy the stage
 * owns, discrete ones flip with `tl.call()`, and `derive()` turns them into a
 * fresh state snapshot on every commit — so a whole loop is reproducible from
 * the timeline position alone.
 */
export interface StageTimelineSpec<TState> {
  /** Seconds for one loop pass; the timeline is padded to this length. */
  length: number;
  /** Rest frame shown while GSAP loads. */
  initial: () => TState;
  /** Frame for reduced motion or `enabled: false`. */
  static: () => TState;
  /**
   * Add the choreography to `tl` starting at `t0` and return `derive`, which
   * builds the state from whatever the tweens mutated.
   */
  build: (tl: StageTimeline, t0: number) => () => TState;
}

export interface StageTimelineOptions {
  /** Element whose visibility gates playback. */
  scope: RefObject<HTMLElement>;
  /** False on stages too small to read; renders the static frame instead. */
  enabled?: boolean;
  /** Delay before the first beat, so the reveal has landed. */
  startDelay?: number;
  /** React commits per second while the timeline runs (PeakMeter redraws at 20). */
  fps?: number;
  /** Ranks the stage when more are visible than may play at once. */
  priority?: number;
}

/**
 * Drives one state snapshot from a looping GSAP timeline.
 *
 * GSAP is imported only after the initial load settles; the timeline pauses
 * while the stage is off screen, the tab is hidden, or the scheduler has
 * given its slot to a more visible stage. Reduced motion (or `enabled:
 * false`) skips GSAP entirely and returns the static frame.
 */
export const useStageTimeline = <TState,>(
  spec: StageTimelineSpec<TState>,
  { scope, enabled = true, startDelay = 0.8, fps = 30, priority = 0 }: StageTimelineOptions,
): TState => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const animate = enabled && !prefersReducedMotion;
  const [state, setState] = useState<TState>(() => (animate ? spec.initial() : spec.static()));

  useEffect(() => {
    if (!animate) {
      setState(spec.static());
      return;
    }

    const element = scope.current;
    if (!element) return;

    let active = true;
    let timeline: StageTimeline | undefined;
    let derive: (() => TState) | undefined;
    let pageVisible = document.visibilityState !== "hidden";
    let lastCommit = 0;

    const commit = (force = false) => {
      if (!derive) return;
      const now = performance.now();
      if (!force && now - lastCommit < 1000 / fps) return;
      lastCommit = now;
      setState(derive());
    };

    const entry: StageEntry = {
      ratio: 0,
      priority,
      onAllowed: () => syncPlayback(),
    };

    const syncPlayback = () => {
      if (!timeline) return;
      const shouldPlay = pageVisible && isStageAllowed(entry);
      if (shouldPlay && timeline.paused()) timeline.play();
      else if (!shouldPlay && !timeline.paused()) timeline.pause();
    };

    const unregister = registerStage(entry);

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              const visible = entries.find((item) => item.target === element);
              if (visible) updateStageRatio(entry, visible.isIntersecting ? Math.max(visible.intersectionRatio, 0.01) : 0);
            },
            { threshold: [0, 0.05, 0.25, 0.5, 0.75, 1] },
          )
        : undefined;
    observer?.observe(element);
    // No observer: assume visible so the stage still runs.
    if (!observer) updateStageRatio(entry, 1);

    const onVisibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      syncPlayback();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const cancelSchedule = scheduleAfterInitialLoad(
      () => {
        void loadGsap().then(({ gsap }) => {
          if (!active) return;

          const tl = gsap.timeline({
            repeat: -1,
            paused: true,
            defaults: { ease: "power2.inOut" },
            onUpdate: () => commit(),
            onRepeat: () => commit(true),
          });
          derive = spec.build(tl, startDelay);
          tl.set({}, {}, spec.length);

          timeline = tl;
          commit(true);
          syncPlayback();
        });
      },
      { delay: 400, timeout: 2000 },
    );

    return () => {
      active = false;
      cancelSchedule();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      unregister();
      timeline?.kill();
    };
  }, [animate, scope, spec, startDelay, fps, priority]);

  return state;
};
