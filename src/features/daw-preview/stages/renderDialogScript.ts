// The Render dialog over a dimmed arrangement: pick a format and bounds,
// enable stems, render, watch the queue fill, done.
import type { StageTimelineSpec } from "../stage/useStageTimeline";

export interface RenderJob {
  name: string;
  /** 0..1 */
  progress: number;
  done: boolean;
}

export interface RenderDialogState {
  open: boolean;
  format: "WAV" | "FLAC";
  bounds: "Entire project" | "Project regions";
  stems: boolean;
  rendering: boolean;
  progress: number;
  jobs: RenderJob[];
  status?: string;
  /** Which control is being "pressed" for the highlight. */
  focus?: "format" | "bounds" | "stems" | "render" | "close";
}

const STEM_NAMES = ["Vocal", "Guitar", "Bass", "Keys", "Drums", "Master"];

const jobsFor = (stems: boolean, progress: number): RenderJob[] => {
  const names = stems ? STEM_NAMES : ["Master"];
  return names.map((name, index) => {
    const slot = (progress * names.length - index) / 1;
    const own = Math.max(0, Math.min(1, slot));
    return { name: `${name}.${progress > 0 ? "flac" : "wav"}`, progress: own, done: own >= 1 };
  });
};

const frame = (edits: Omit<RenderDialogState, "jobs">): RenderDialogState => ({
  ...edits,
  jobs: jobsFor(edits.stems, edits.rendering || edits.progress > 0 ? edits.progress : 0),
});

const REST: Omit<RenderDialogState, "jobs"> = { open: true, format: "WAV", bounds: "Entire project", stems: false, rendering: false, progress: 0 };

export const SPEC: StageTimelineSpec<RenderDialogState> = {
  length: 13,
  initial: () => frame(REST),
  static: () => frame({ open: true, format: "FLAC", bounds: "Project regions", stems: true, rendering: true, progress: 0.62, status: "Rendering 4 of 6…" }),
  build: (tl, t0) => {
    const proxy = { progress: 0 };
    const flags: Omit<RenderDialogState, "jobs" | "progress"> = { ...REST };

    tl.call(() => {
      flags.focus = "format";
    }, [], t0 + 0.6)
      .call(() => {
        flags.format = "FLAC";
        flags.focus = undefined;
      }, [], t0 + 1.2)
      .call(() => {
        flags.focus = "bounds";
      }, [], t0 + 1.9)
      .call(() => {
        flags.bounds = "Project regions";
        flags.focus = undefined;
      }, [], t0 + 2.5)
      .call(() => {
        flags.focus = "stems";
      }, [], t0 + 3.1)
      .call(() => {
        flags.stems = true;
        flags.focus = undefined;
      }, [], t0 + 3.6)
      .call(() => {
        flags.focus = "render";
      }, [], t0 + 4.4)
      .call(() => {
        flags.rendering = true;
        flags.focus = undefined;
        flags.status = "Rendering…";
      }, [], t0 + 4.8)
      .to(proxy, { progress: 1, duration: 4.2, ease: "power1.inOut" }, t0 + 4.9)
      .call(() => {
        flags.rendering = false;
        flags.status = "Done · 6 files · 0:41";
      }, [], t0 + 9.2)
      .call(() => {
        flags.focus = "close";
      }, [], t0 + 10.2)
      .call(() => {
        flags.open = false;
        flags.focus = undefined;
      }, [], t0 + 10.6)
      .call(() => {
        Object.assign(flags, REST, { open: false });
        proxy.progress = 0;
      }, [], t0 + 11.3)
      .call(() => {
        flags.open = true;
      }, [], t0 + 11.8);

    return () =>
      frame({
        ...flags,
        progress: proxy.progress,
        status: flags.rendering ? `Rendering ${Math.min(6, Math.floor(proxy.progress * 6) + 1)} of ${flags.stems ? 6 : 1}…` : flags.status,
      });
  },
};
