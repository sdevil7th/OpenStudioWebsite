// The arrangement view shared by the hero session and the arrangement stages:
// a track-header column, the ruler, clip lanes, and the playhead. Everything
// is props; the caller decides what a lane contains on each commit.
import { memo } from "react";
import { cn } from "@/lib/utils";
import { PlayheadLine, RulerLite, TIMELINE_RULER_HEIGHT } from "./RulerLite";
import type { Transport } from "./types";

export interface LaneClip {
  start: number;
  duration: number;
  label: string;
  kind: "audio" | "midi";
  /** Draws the red take-in-progress border. */
  recording?: boolean;
}

export interface LaneDef {
  name: string;
  color: string;
  clips: readonly LaneClip[];
  soloed?: boolean;
  armed?: boolean;
  muted?: boolean;
  /** Linear level; used only to dim silenced clips while playing. */
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
  /** Optional overlay drawn over the lanes (e.g. a razor line). */
  overlay?: React.ReactNode;
}

export const clipPattern = (kind: "audio" | "midi", color: string) =>
  kind === "audio"
    ? `repeating-linear-gradient(90deg, ${color}66 0 1px, transparent 1px 3px)`
    : `repeating-linear-gradient(90deg, ${color}aa 0 6px, transparent 6px 9px)`;

export const arrangementHeight = (laneCount: number, laneHeight = 30) => TIMELINE_RULER_HEIGHT + laneHeight * laneCount;

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
  headerWidth = 112,
  laneHeight = 30,
  overlay,
}: ArrangementLanesProps) {
  const lanesWidth = width - headerWidth;
  const pixelsPerSecond = lanesWidth / sessionLength;
  const height = arrangementHeight(lanes.length, laneHeight);
  const playheadX = Math.min(lanesWidth, Math.max(0, time * pixelsPerSecond));

  return (
    <div className="relative flex shrink-0 bg-daw-dark" style={{ height }}>
      <div className="shrink-0 flex flex-col border-r border-neutral-800" style={{ width: headerWidth }}>
        <div
          className="flex items-end px-2 pb-1 text-[8px] uppercase tracking-wider text-neutral-500 bg-neutral-900 border-b border-neutral-800"
          style={{ height: TIMELINE_RULER_HEIGHT }}
        >
          Bars
        </div>
        {lanes.map((lane, index) => {
          const selected = index === selectedTrack;
          return (
            <div
              key={lane.name}
              className={cn(
                "flex items-center gap-1.5 px-1.5 border-b border-neutral-800 transition-opacity duration-500",
                selected ? "bg-neutral-700" : "bg-neutral-800",
                lane.entering && "opacity-0",
              )}
              style={{ height: laneHeight }}
            >
              <span className="h-full w-[3px] shrink-0 rounded-sm" style={{ background: lane.color }} />
              <span className="flex-1 truncate text-[9px] font-bold text-neutral-200" title={lane.name}>
                {lane.name}
              </span>
              <span
                className={cn(
                  "w-3 h-3 rounded-[2px] text-[7px] font-bold flex items-center justify-center border",
                  lane.muted
                    ? "bg-neutral-500 text-black border-neutral-400"
                    : lane.soloed
                      ? "bg-yellow-500 text-black border-yellow-600"
                      : "bg-neutral-900 text-neutral-500 border-neutral-700",
                )}
              >
                {lane.muted ? "M" : "S"}
              </span>
              <span
                className={cn(
                  "w-3 h-3 rounded-full text-[7px] flex items-center justify-center border",
                  lane.armed
                    ? "bg-red-600 border-red-500 shadow-[0_0_6px_rgba(229,57,53,0.6)]"
                    : "bg-neutral-900 border-neutral-700",
                )}
              />
            </div>
          );
        })}
      </div>

      <div className="relative flex-1 min-w-0 overflow-hidden">
        <RulerLite
          loopEnabled={loop}
          loopRange={loopRange}
          pixelsPerSecond={pixelsPerSecond}
          playheadSeconds={time}
          tempo={tempo}
          timeSignature={timeSignature}
          width={lanesWidth}
        />
        {lanes.map((lane, index) => {
          const selected = index === selectedTrack;
          const silenced = (lane.level ?? 1) === 0 && transport !== "stopped";
          return (
            <div
              key={lane.name}
              className={cn(
                "relative border-b border-neutral-800 transition-opacity duration-500",
                selected ? "bg-neutral-800/60" : "bg-[#151515]",
                lane.entering && "opacity-0",
              )}
              style={{
                height: laneHeight,
                backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px ${
                  (pixelsPerSecond * 60) / tempo
                }px)`,
              }}
            >
              {lane.clips.map((clip) => (
                <div
                  key={clip.label}
                  className={cn(
                    "absolute top-[3px] bottom-[3px] rounded-[3px] border overflow-hidden transition-opacity duration-300",
                    clip.recording && "border-red-500 shadow-[0_0_8px_rgba(229,57,53,0.5)]",
                  )}
                  style={{
                    left: clip.start * pixelsPerSecond,
                    width: Math.max(0, clip.duration * pixelsPerSecond - 1),
                    borderColor: clip.recording ? undefined : `${lane.color}99`,
                    background: clip.recording
                      ? "linear-gradient(180deg, rgba(229,57,53,0.45), rgba(229,57,53,0.25))"
                      : `linear-gradient(180deg, ${lane.color}55, ${lane.color}33)`,
                    opacity: silenced && transport === "playing" ? 0.45 : 1,
                  }}
                >
                  <div
                    className="absolute inset-x-0 bottom-0 top-[11px] opacity-70"
                    style={{ backgroundImage: clipPattern(clip.kind, clip.recording ? "#ff8a80" : lane.color) }}
                  />
                  <span className="relative z-[1] block px-1 text-[8px] font-semibold leading-[11px] text-white/90 truncate">
                    {clip.label}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
        {overlay}
        <PlayheadLine height={height} x={playheadX} />
      </div>
    </div>
  );
});
