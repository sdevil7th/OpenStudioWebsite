import "@/styles/daw.css";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BigClockLite } from "./BigClockLite";
import { ChannelStripLite } from "./ChannelStripLite";
import { RackModuleLite } from "./RackModuleLite";
import { PlayheadLine, RulerLite, TIMELINE_RULER_HEIGHT } from "./RulerLite";
import { LOOP_RANGE, SESSION_LENGTH, TEMPO, TIME_SIGNATURE, TRACKS } from "./sessionScript";
import { TransportLite } from "./TransportLite";
import { useSessionTimeline } from "./useSessionTimeline";

/** Design size of the stage; it is CSS-scaled to the column it sits in. */
export const STAGE_WIDTH = 640;
const TRANSPORT_HEIGHT = 48;
const HEADER_WIDTH = 112;
const LANE_HEIGHT = 30;
const MIXER_HEIGHT = 252;
const LANES_WIDTH = STAGE_WIDTH - HEADER_WIDTH;
const PIXELS_PER_SECOND = LANES_WIDTH / SESSION_LENGTH;
const ARRANGEMENT_HEIGHT = TIMELINE_RULER_HEIGHT + LANE_HEIGHT * TRACKS.length;
export const STAGE_HEIGHT = TRANSPORT_HEIGHT + ARRANGEMENT_HEIGHT + 1 + MIXER_HEIGHT;
/** Below this scale the 7–9 px labels stop being legible; show the static frame. */
const MIN_ANIMATED_SCALE = 0.6;

interface LiveSessionProps {
  className?: string;
  /** Pauses the choreography and renders the static frame (e.g. off-screen tabs). */
  paused?: boolean;
}

const clipPattern = (kind: "audio" | "midi", color: string) =>
  kind === "audio"
    ? `repeating-linear-gradient(90deg, ${color}66 0 1px, transparent 1px 3px)`
    : `repeating-linear-gradient(90deg, ${color}aa 0 6px, transparent 6px 9px)`;

const LiveSession = ({ className, paused = false }: LiveSessionProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const measure = () => setScale(Math.min(1, outer.clientWidth / STAGE_WIDTH));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);

  const state = useSessionTimeline({ scope: outerRef, enabled: !paused && scale >= MIN_ANIMATED_SCALE });
  const playheadX = Math.min(LANES_WIDTH, Math.max(0, state.time * PIXELS_PER_SECOND));

  return (
    <div
      ref={outerRef}
      className={cn("daw-session daw-session--showcase relative w-full overflow-hidden", className)}
      style={{ height: Math.round(STAGE_HEIGHT * scale) }}
      role="img"
      aria-label="OpenStudio session: the transport is playing, meters move in the mixer, and the NAM Rack knobs are being dialled in."
      data-transport={state.transport}
    >
      <div
        className="daw-session__stage absolute top-0 left-0 flex flex-col bg-daw-dark text-daw-text"
        style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <TransportLite
          transport={state.transport}
          loopEnabled={state.loop}
          snapEnabled={state.snap}
          trailing={
            <BigClockLite
              size="docked"
              tempo={TEMPO}
              timeSeconds={state.time}
              timeSignature={TIME_SIGNATURE}
              transport={state.transport}
            />
          }
        />

        {/* Arrangement */}
        <div className="relative flex shrink-0 bg-daw-dark" style={{ height: ARRANGEMENT_HEIGHT }}>
          <div className="shrink-0 flex flex-col border-r border-neutral-800" style={{ width: HEADER_WIDTH }}>
            <div
              className="flex items-end px-2 pb-1 text-[8px] uppercase tracking-wider text-neutral-500 bg-neutral-900 border-b border-neutral-800"
              style={{ height: TIMELINE_RULER_HEIGHT }}
            >
              Bars
            </div>
            {TRACKS.map((track, index) => {
              const live = state.tracks[index];
              const selected = index === state.selectedTrack;
              return (
                <div
                  key={track.name}
                  className={cn(
                    "flex items-center gap-1.5 px-1.5 border-b border-neutral-800",
                    selected ? "bg-neutral-700" : "bg-neutral-800",
                  )}
                  style={{ height: LANE_HEIGHT }}
                >
                  <span className="h-full w-[3px] shrink-0 rounded-sm" style={{ background: track.color }} />
                  <span className="flex-1 truncate text-[9px] font-bold text-neutral-200" title={track.name}>{track.name}</span>
                  <span
                    className={cn(
                      "w-3 h-3 rounded-[2px] text-[7px] font-bold flex items-center justify-center border",
                      live.soloed
                        ? "bg-yellow-500 text-black border-yellow-600"
                        : "bg-neutral-900 text-neutral-500 border-neutral-700",
                    )}
                  >
                    S
                  </span>
                  <span
                    className={cn(
                      "w-3 h-3 rounded-full text-[7px] flex items-center justify-center border",
                      live.armed
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
              loopEnabled={state.loop}
              loopRange={LOOP_RANGE}
              pixelsPerSecond={PIXELS_PER_SECOND}
              playheadSeconds={state.time}
              tempo={TEMPO}
              timeSignature={TIME_SIGNATURE}
              width={LANES_WIDTH}
            />
            {TRACKS.map((track, index) => {
              const selected = index === state.selectedTrack;
              const silenced = state.tracks[index].level === 0 && state.transport !== "stopped";
              return (
                <div
                  key={track.name}
                  className={cn("relative border-b border-neutral-800", selected ? "bg-neutral-800/60" : "bg-[#151515]")}
                  style={{
                    height: LANE_HEIGHT,
                    backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px ${
                      (PIXELS_PER_SECOND * 60) / TEMPO
                    }px)`,
                  }}
                >
                  {track.clips.map((clip) => (
                    <div
                      key={clip.label}
                      className="absolute top-[3px] bottom-[3px] rounded-[3px] border overflow-hidden transition-opacity duration-300"
                      style={{
                        left: clip.start * PIXELS_PER_SECOND,
                        width: clip.duration * PIXELS_PER_SECOND - 1,
                        borderColor: `${track.color}99`,
                        background: `linear-gradient(180deg, ${track.color}55, ${track.color}33)`,
                        opacity: silenced && state.transport === "playing" ? 0.45 : 1,
                      }}
                    >
                      <div
                        className="absolute inset-x-0 bottom-0 top-[11px] opacity-70"
                        style={{ backgroundImage: clipPattern(clip.kind, track.color) }}
                      />
                      <span className="relative z-[1] block px-1 text-[8px] font-semibold leading-[11px] text-white/90 truncate">
                        {clip.label}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
            <PlayheadLine height={ARRANGEMENT_HEIGHT} x={playheadX} />
          </div>
        </div>

        <div className="h-px shrink-0 bg-neutral-950" />

        {/* Mixer */}
        <div className="flex shrink-0 bg-neutral-900" style={{ height: MIXER_HEIGHT }}>
          <div className="flex h-full">
            {TRACKS.map((track, index) => {
              const live = state.tracks[index];
              return (
                <ChannelStripLite
                  key={track.name}
                  armed={live.armed}
                  color={track.color}
                  hasFx={track.hasFx}
                  input={track.input}
                  isSelected={index === state.selectedTrack}
                  level={live.level}
                  muted={live.muted}
                  name={track.name}
                  pan={live.pan}
                  sendCount={index === 0 ? 1 : 0}
                  soloed={live.soloed}
                  trackIndex={index}
                  volumeDb={live.volumeDb}
                />
              );
            })}
            <ChannelStripLite
              clipping={state.master.clipping}
              hasFx
              isMaster
              level={state.master.level}
              name="Master"
              pan={0}
              trackIndex={TRACKS.length}
              volumeDb={state.master.volumeDb}
            />
          </div>
          <div className="flex-1 min-w-0 h-full">
            <RackModuleLite power={state.rackPower} values={state.knobs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
