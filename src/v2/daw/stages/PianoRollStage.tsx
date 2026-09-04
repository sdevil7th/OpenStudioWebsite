import { useRef } from "react";
import { Eraser, MousePointer2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { DawButton } from "../DawButton";
import { MIN_ANIMATED_SCALE, StageFrame, useStageScale } from "../stage/StageFrame";
import type { StageProps } from "../stage/LiveStage";
import { useStageTimeline } from "../stage/useStageTimeline";
import { TransportLite } from "../TransportLite";
import { BEATS, LOW_NOTE, ROWS, SPEC } from "./pianoRollScript";

export const STAGE_WIDTH = 640;
export const STAGE_HEIGHT = 360;
const TRANSPORT_HEIGHT = 40;
const TOOLBAR_HEIGHT = 26;
const KEYS_WIDTH = 44;
const VELOCITY_HEIGHT = 46;
const GRID_HEIGHT = STAGE_HEIGHT - TRANSPORT_HEIGHT - TOOLBAR_HEIGHT - VELOCITY_HEIGHT;
const ROW_HEIGHT = GRID_HEIGHT / ROWS;
const GRID_WIDTH = STAGE_WIDTH - KEYS_WIDTH;
const BEAT_WIDTH = GRID_WIDTH / BEATS;

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const isBlack = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12);
const inScale = (midi: number) => [0, 2, 4, 5, 7, 9, 11].includes(midi % 12); // C major highlight

/** Velocity colours as the app's piano roll: blue quiet → green → yellow → red loud. */
const velocityColor = (velocity: number) =>
  velocity < 50 ? "#4a9eff" : velocity < 80 ? "#34d399" : velocity < 100 ? "#fbbf24" : "#f87171";

const rowY = (row: number) => GRID_HEIGHT - (row + 1) * ROW_HEIGHT;

const PianoRollStage = ({ priority, className }: StageProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(outerRef, STAGE_WIDTH);
  const state = useStageTimeline(SPEC, { scope: outerRef, enabled: scale >= MIN_ANIMATED_SCALE, priority, startDelay: 0.6 });
  const playheadX = state.beat * BEAT_WIDTH;

  return (
    <StageFrame
      className={className}
      data={{ transport: state.transport }}
      height={STAGE_HEIGHT}
      label="OpenStudio piano roll: a two-bar Rhodes part plays back, a late note is nudged and quantized to the grid, and velocities are raised."
      outerRef={outerRef}
      scale={scale}
      width={STAGE_WIDTH}
    >
      <TransportLite loopEnabled={state.loop} snapEnabled transport={state.transport} />
      {/* Piano roll toolbar */}
      <div className="flex items-center gap-1 px-2 bg-neutral-900 border-b border-neutral-800 shrink-0" style={{ height: TOOLBAR_HEIGHT }}>
        <span className="text-[8px] uppercase tracking-wider text-neutral-500 mr-1">Piano roll · Rhodes</span>
        {(
          [
            ["draw", Pencil],
            ["select", MousePointer2],
            ["erase", Eraser],
          ] as const
        ).map(([tool, Icon]) => (
          <DawButton key={tool} active={state.tool === tool} className="w-5 h-4" size="icon-xs" title={tool} variant="default">
            <Icon size={9} />
          </DawButton>
        ))}
        <span className="w-px h-3 bg-neutral-700 mx-1" />
        <DawButton className="px-1.5 text-[8px] h-4" size="xs" variant="default">
          Snap 1/16
        </DawButton>
        <DawButton active={Boolean(state.status)} className="px-1.5 text-[8px] h-4" size="xs" variant="default">
          Quantize
        </DawButton>
        <span className="ml-auto text-[8px] text-neutral-400">
          Scale <span className="text-neutral-200">C major</span>
        </span>
        {state.status ? (
          <span className="rounded bg-neutral-950 border border-cyan-500/40 px-1.5 py-0.5 text-[8px] font-semibold text-cyan-200">{state.status}</span>
        ) : null}
      </div>

      <svg className="block shrink-0" height={GRID_HEIGHT + VELOCITY_HEIGHT} width={STAGE_WIDTH}>
        {/* Keys */}
        {Array.from({ length: ROWS }, (_, row) => {
          const midi = LOW_NOTE + row;
          const black = isBlack(midi);
          return (
            <g key={row}>
              <rect fill={black ? "#1c1c1c" : "#e8e8e8"} height={ROW_HEIGHT - 1} width={KEYS_WIDTH - 1} x={0} y={rowY(row)} />
              {midi % 12 === 0 ? (
                <text fill="#555" fontSize={7} x={KEYS_WIDTH - 5} y={rowY(row) + ROW_HEIGHT - 4} textAnchor="end">
                  {NOTE_NAMES[midi % 12]}
                  {Math.floor(midi / 12) - 1}
                </text>
              ) : null}
              {/* Grid row */}
              <rect
                fill={inScale(midi) ? (black ? "#161616" : "#1b1b1b") : "#101010"}
                height={ROW_HEIGHT}
                width={GRID_WIDTH}
                x={KEYS_WIDTH}
                y={rowY(row)}
              />
              <line stroke="#262626" strokeWidth={1} x1={KEYS_WIDTH} x2={STAGE_WIDTH} y1={rowY(row)} y2={rowY(row)} />
            </g>
          );
        })}
        {/* Beat / subdivision lines */}
        {Array.from({ length: BEATS * 4 + 1 }, (_, index) => {
          const x = KEYS_WIDTH + (index / 4) * BEAT_WIDTH;
          const isBar = index % 16 === 0;
          const isBeat = index % 4 === 0;
          return <line key={index} stroke={isBar ? "#4a4a4a" : isBeat ? "#333" : "#222"} x1={x} x2={x} y1={0} y2={GRID_HEIGHT + VELOCITY_HEIGHT} />;
        })}
        {/* Loop range */}
        {state.loop ? <rect fill="rgba(245,158,11,0.08)" height={GRID_HEIGHT} width={GRID_WIDTH} x={KEYS_WIDTH} y={0} /> : null}
        {/* Notes */}
        {state.notes.map((note) => {
          const x = KEYS_WIDTH + note.start * BEAT_WIDTH;
          const width = Math.max(4, note.length * BEAT_WIDTH - 2);
          const sounding = state.transport !== "stopped" && state.beat >= note.start && state.beat < note.start + note.length;
          const selected = state.selected.includes(note.id);
          const color = velocityColor(note.velocity);
          return (
            <g key={note.id}>
              <rect
                fill={color}
                fillOpacity={sounding ? 1 : 0.78}
                height={ROW_HEIGHT - 3}
                rx={2}
                stroke={selected ? "#fff" : "rgba(0,0,0,0.5)"}
                strokeWidth={selected ? 1.5 : 1}
                width={width}
                x={x + 1}
                y={rowY(note.row) + 1.5}
                style={{ filter: sounding ? `drop-shadow(0 0 4px ${color})` : undefined }}
              />
              <rect fill={color} height={(note.velocity / 127) * (VELOCITY_HEIGHT - 8)} width={3} x={x + 1} y={GRID_HEIGHT + VELOCITY_HEIGHT - 4 - (note.velocity / 127) * (VELOCITY_HEIGHT - 8)} opacity={selected ? 1 : 0.7} />
            </g>
          );
        })}
        {/* Velocity lane chrome */}
        <line stroke="#3a3a3a" x1={0} x2={STAGE_WIDTH} y1={GRID_HEIGHT + 0.5} y2={GRID_HEIGHT + 0.5} />
        <text fill="#666" fontSize={7} x={4} y={GRID_HEIGHT + 11}>
          VEL
        </text>
        {/* Playhead */}
        <g style={{ transform: `translateX(${KEYS_WIDTH + playheadX}px)`, willChange: "transform" }}>
          <line stroke="#4cc9f0" strokeWidth={1.5} x1={0} x2={0} y1={0} y2={GRID_HEIGHT + VELOCITY_HEIGHT} />
          <polygon fill="#4cc9f0" points="-4,0 4,0 0,5" />
        </g>
      </svg>
    </StageFrame>
  );
};

export { cn };
export default PianoRollStage;
