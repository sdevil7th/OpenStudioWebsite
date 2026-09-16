// The arrangement view shared by the hero session and the arrangement stages:
// the track control panel (headers), the ruler, clip lanes, and the playhead.
// Lane chrome follows OpenStudio's Timeline.tsx static layer (alternating
// #1a1a1a / #171717 rows, emerald dashed snap grid) and the clips are drawn
// by ClipLite. Everything is props; the caller decides what a lane contains.
import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AudioProfile, MidiProfile } from "./clipArt";
import { rowMetrics } from "./clipArt";
import { AudioClipLite, MidiClipLite } from "./ClipLite";
import { PlayheadLine, RulerLite, TIMELINE_RULER_HEIGHT } from "./RulerLite";
import { AddTrackBar, MASTER_HEADER_HEIGHT, MasterHeaderLite, TRACK_HEADER_WIDTH, TrackHeaderLite, type TrackType } from "./TrackHeaderLite";
import type { Transport } from "./types";

export interface LaneClip {
  start: number;
  duration: number;
  label: string;
  kind: "audio" | "midi";
  /** Which generated artwork the clip shows; defaults follow `kind`. */
  profile?: AudioProfile | MidiProfile;
  seed?: number;
  /** Seconds of source before the clip's first pixel (a split's right half). */
  offset?: number;
  /** Draws the take-in-progress look (REC badge, live waveform). */
  recording?: boolean;
  selected?: boolean;
}

export interface LaneDef {
  name: string;
  color: string;
  clips: readonly LaneClip[];
  type?: TrackType;
  input?: string;
  hasFx?: boolean;
  volumeDb?: number;
  pan?: number;
  soloed?: boolean;
  armed?: boolean;
  muted?: boolean;
  /** Linear level; feeds the header meter and dims silenced clips while playing. */
  level?: number;
  /** Lane is being added (stems arriving): fades in. */
  entering?: boolean;
}

export interface ArrangementLanesProps {
  lanes: readonly LaneDef[];
  time: number;
  transport: Transport;
  loop: boolean;
  loopRange: readonly [number, number];
  tempo: number;
  timeSignature: { numerator: number; denominator: number };
  selectedTrack: number;
  /** Seconds of arrangement that fit the lane width. */
  sessionLength: number;
  width: number;
  headerWidth?: number;
  laneHeight?: number;
  /** Renders the master row under the headers (the hero session). */
  master?: { volumeDb: number; muted?: boolean };
  /** Optional overlay drawn over the lanes (e.g. a razor line). */
  overlay?: ReactNode;
}

export const arrangementHeight = (laneCount: number, laneHeight = 48, withMaster = false) =>
  TIMELINE_RULER_HEIGHT + laneHeight * laneCount + (withMaster ? MASTER_HEADER_HEIGHT : 0);

/** Upstream renderSnapGridLines(): emerald dashes, bars fainter than beats. */
const GridLines = memo(function GridLines({ width, height, pixelsPerSecond, tempo, beatsPerBar }: { width: number; height: number; pixelsPerSecond: number; tempo: number; beatsPerBar: number }) {
  const secondsPerBeat = 60 / tempo;
  const beats = Math.ceil(width / pixelsPerSecond / secondsPerBeat) + 1;
  const lines = [];
  for (let beat = 0; beat < beats; beat += 1) {
    const x = Math.round(beat * secondsPerBeat * pixelsPerSecond) + 0.5;
    const isBar = beat % beatsPerBar === 0;
    lines.push(<line key={beat} opacity={isBar ? 0.12 : 0.2} stroke="#10b981" strokeDasharray={isBar ? "5 5" : "4 4"} strokeWidth={isBar ? 0.75 : 0.5} x1={x} x2={x} y1={0} y2={height} />);
  }
  return (
    <svg aria-hidden="true" className="absolute left-0 pointer-events-none" height={height} style={{ top: TIMELINE_RULER_HEIGHT }} width={width}>
      {lines}
    </svg>
  );
});

export const ArrangementLanes = memo(function ArrangementLanes({
  lanes,
  time,
  transport,
  loop,
  loopRange,
  tempo,
  timeSignature,
  selectedTrack,
  sessionLength,
  width,
  headerWidth = TRACK_HEADER_WIDTH,
  laneHeight = 48,
  master,
  overlay,
}: ArrangementLanesProps) {
  const lanesWidth = width - headerWidth;
  const pixelsPerSecond = lanesWidth / sessionLength;
  const lanesHeight = laneHeight * lanes.length;
  const height = arrangementHeight(lanes.length, laneHeight, Boolean(master));
  const playheadX = Math.min(lanesWidth, Math.max(0, time * pixelsPerSecond));

  return (
    <div className="relative flex shrink-0 bg-daw-dark" style={{ height }}>
      {/* Track control panel */}
      <div className="shrink-0 flex flex-col bg-[#1a1a1a] border-r border-neutral-800" style={{ width: headerWidth }}>
        <AddTrackBar height={TIMELINE_RULER_HEIGHT} />
        {lanes.map((lane, index) => (
          <TrackHeaderLite
            key={lane.name}
            armed={lane.armed}
            color={lane.color}
            entering={lane.entering}
            hasFx={lane.hasFx}
            height={laneHeight}
            input={lane.input}
            level={lane.level ?? 0}
            muted={lane.muted}
            name={lane.name}
            pan={lane.pan}
            selected={index === selectedTrack}
            soloed={lane.soloed}
            type={lane.type}
            volumeDb={lane.volumeDb}
          />
        ))}
        {master ? (
          <div className="mt-auto">
            <MasterHeaderLite muted={master.muted} volumeDb={master.volumeDb} />
          </div>
        ) : null}
      </div>

      {/* Lanes */}
      <div className="relative flex-1 min-w-0 overflow-hidden">
        <RulerLite loopEnabled={loop} loopRange={loopRange} pixelsPerSecond={pixelsPerSecond} playheadSeconds={time} tempo={tempo} timeSignature={timeSignature} width={lanesWidth} />
        {lanes.map((lane, index) => {
          const silenced = (lane.level ?? 1) === 0 && transport !== "stopped";
          const kind = lane.type === "audio" || lane.type === undefined ? "audio" : "midi";
          return (
            <div
              key={lane.name}
              className={cn("relative transition-opacity duration-500", lane.entering && "opacity-0")}
              data-lane={lane.name}
              style={{ height: laneHeight, background: index % 2 === 0 ? "#1a1a1a" : "#171717" }}
            >
              {lane.clips.map((clip) => {
                const metrics = rowMetrics(clip.kind === "midi" ? "midi" : kind, laneHeight);
                const clipWidth = Math.max(0, clip.duration * pixelsPerSecond);
                if (clipWidth < 1) return null;
                const common = {
                  color: lane.color,
                  duration: clip.duration,
                  height: metrics.clipHeight,
                  muted: lane.muted,
                  name: clip.label,
                  offset: clip.offset,
                  pixelsPerSecond,
                  recording: clip.recording,
                  seed: clip.seed ?? index + 1,
                  tempo,
                  width: clipWidth,
                };
                return (
                  <div
                    key={clip.label}
                    className="absolute z-[1] transition-opacity duration-300"
                    style={{ left: clip.start * pixelsPerSecond, top: metrics.clipInsetY, width: clipWidth, height: metrics.clipHeight, opacity: silenced && transport === "playing" ? 0.45 : 1 }}
                  >
                    {clip.kind === "midi" ? (
                      <MidiClipLite {...common} profile={(clip.profile as MidiProfile) ?? "keys"} selected={clip.selected} />
                    ) : (
                      <AudioClipLite {...common} profile={(clip.profile as AudioProfile) ?? "mix"} />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        <GridLines beatsPerBar={timeSignature.numerator} height={lanesHeight} pixelsPerSecond={pixelsPerSecond} tempo={tempo} width={lanesWidth} />
        {overlay}
        <PlayheadLine height={height} x={playheadX} />
      </div>
    </div>
  );
});
