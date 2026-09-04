import { useRef } from "react";
import { AudioWaveform, MoveVertical, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { DawButton } from "../DawButton";
import { MIN_ANIMATED_SCALE, StageFrame, useStageScale } from "../stage/StageFrame";
import type { StageProps } from "../stage/LiveStage";
import { useStageTimeline } from "../stage/useStageTimeline";
import { TransportLite } from "../TransportLite";
import { BEATS, LOW_NOTE, ROWS, SPEC, contourCents } from "./pitchEditorScript";

export const STAGE_WIDTH = 640;
export const STAGE_HEIGHT = 360;
const TRANSPORT_HEIGHT = 40;
const TOOLBAR_HEIGHT = 28;
const KEYS_WIDTH = 44;
const INSPECTOR_WIDTH = 120;
const GRID_HEIGHT = STAGE_HEIGHT - TRANSPORT_HEIGHT - TOOLBAR_HEIGHT;
const ROW_HEIGHT = GRID_HEIGHT / ROWS;
const GRID_WIDTH = STAGE_WIDTH - KEYS_WIDTH - INSPECTOR_WIDTH;
const BEAT_WIDTH = GRID_WIDTH / BEATS;
const CENT_PX = ROW_HEIGHT / 100;

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const isBlack = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12);
const inScale = (midi: number) => [0, 2, 4, 5, 7, 9, 11].includes(midi % 12);
const rowCenterY = (row: number) => GRID_HEIGHT - (row + 0.5) * ROW_HEIGHT;

const PitchEditorStage = ({ priority, className }: StageProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(outerRef, STAGE_WIDTH);
  const state = useStageTimeline(SPEC, { scope: outerRef, enabled: scale >= MIN_ANIMATED_SCALE, priority, startDelay: 0.6, fps: 24 });
  const playheadX = KEYS_WIDTH + state.beat * BEAT_WIDTH;

  return (
    <StageFrame
      className={className}
      data={{ transport: state.transport, tool: state.tool }}
      height={STAGE_HEIGHT}
      label="OpenStudio pitch editor: a vocal phrase plays, a flat note is dragged onto the scale, and the correct-pitch macro flattens drift while vibrato stays."
      outerRef={outerRef}
      scale={scale}
      width={STAGE_WIDTH}
    >
      <TransportLite loopEnabled={false} snapEnabled transport={state.transport} />
      <div className="flex items-center gap-1 px-2 bg-neutral-900 border-b border-neutral-800 shrink-0" style={{ height: TOOLBAR_HEIGHT }}>
        <span className="text-[8px] uppercase tracking-wider text-neutral-500 mr-1">Pitch editor · Vocal</span>
        {(
          [
            ["pitch", MoveVertical, "Pitch"],
            ["drift", AudioWaveform, "Drift"],
            ["vibrato", Waves, "Vibrato"],
          ] as const
        ).map(([tool, Icon, label]) => (
          <DawButton key={tool} active={state.tool === tool} className="px-1.5 h-4 text-[8px] gap-1" size="xs" variant="default">
            <Icon size={9} /> {label}
          </DawButton>
        ))}
        <span className="w-px h-3 bg-neutral-700 mx-1" />
        <DawButton className="px-1.5 text-[8px] h-4" size="xs" variant="default">
          Snap · scale
        </DawButton>
        <DawButton active={Boolean(state.status)} className="px-1.5 text-[8px] h-4" size="xs" variant="default">
          Correct pitch
        </DawButton>
        <span className="ml-auto text-[8px] text-neutral-400">
          Key <span className="text-neutral-200">{state.keyLabel}</span>
        </span>
      </div>

      <div className="flex shrink-0" style={{ height: GRID_HEIGHT }}>
        <svg className="block shrink-0" height={GRID_HEIGHT} width={KEYS_WIDTH + GRID_WIDTH}>
          {Array.from({ length: ROWS }, (_, row) => {
            const midi = LOW_NOTE + row;
            const black = isBlack(midi);
            const y = GRID_HEIGHT - (row + 1) * ROW_HEIGHT;
            return (
              <g key={row}>
                <rect fill={black ? "#1c1c1c" : "#e8e8e8"} height={ROW_HEIGHT - 1} width={KEYS_WIDTH - 1} x={0} y={y} />
                {!black ? (
                  <text fill="#555" fontSize={7} textAnchor="end" x={KEYS_WIDTH - 5} y={y + ROW_HEIGHT - 5}>
                    {NOTE_NAMES[midi % 12]}
                    {Math.floor(midi / 12) - 1}
                  </text>
                ) : null}
                <rect fill={inScale(midi) ? "#171717" : "#0f0f0f"} height={ROW_HEIGHT} width={GRID_WIDTH} x={KEYS_WIDTH} y={y} />
                <line stroke={inScale(midi) ? "#2a2a2a" : "#1d1d1d"} x1={KEYS_WIDTH} x2={KEYS_WIDTH + GRID_WIDTH} y1={y + 0.5} y2={y + 0.5} />
                {/* scale centre line */}
                {inScale(midi) ? <line stroke="#2f3f4a" strokeDasharray="2 3" x1={KEYS_WIDTH} x2={KEYS_WIDTH + GRID_WIDTH} y1={rowCenterY(row)} y2={rowCenterY(row)} /> : null}
              </g>
            );
          })}
          {Array.from({ length: BEATS + 1 }, (_, beat) => (
            <line key={beat} stroke={beat % 4 === 0 ? "#3a3a3a" : "#262626"} x1={KEYS_WIDTH + beat * BEAT_WIDTH} x2={KEYS_WIDTH + beat * BEAT_WIDTH} y1={0} y2={GRID_HEIGHT} />
          ))}
          {/* Blobs and contours */}
          {state.blobs.map((blob) => {
            const x = KEYS_WIDTH + blob.start * BEAT_WIDTH;
            const width = blob.length * BEAT_WIDTH;
            const centerY = rowCenterY(blob.row) - blob.cents * CENT_PX;
            const selected = state.selected === blob.id;
            const sounding = state.transport !== "stopped" && state.beat >= blob.start && state.beat < blob.start + blob.length;
            const points = Array.from({ length: 24 }, (_, index) => {
              const local = (index / 23) * blob.length;
              const cents = contourCents(blob, local, state.correction);
              return `${x + local * BEAT_WIDTH},${rowCenterY(blob.row) - cents * CENT_PX}`;
            }).join(" ");
            const offKey = Math.abs(blob.cents) > 20;
            const fill = offKey ? "#f59e0b" : "#34d399";
            return (
              <g key={blob.id}>
                <rect
                  fill={fill}
                  fillOpacity={sounding ? 0.55 : 0.32}
                  height={ROW_HEIGHT - 4}
                  rx={ROW_HEIGHT / 2}
                  stroke={selected ? "#fff" : fill}
                  strokeOpacity={selected ? 1 : 0.7}
                  strokeWidth={selected ? 1.5 : 1}
                  width={width}
                  x={x}
                  y={centerY - (ROW_HEIGHT - 4) / 2}
                />
                <polyline fill="none" points={points} stroke={sounding ? "#fff" : "#e5e7eb"} strokeOpacity={0.9} strokeWidth={1.4} />
              </g>
            );
          })}
          {/* Playhead */}
          <g style={{ transform: `translateX(${playheadX}px)`, willChange: "transform" }}>
            <line stroke="#4cc9f0" strokeWidth={1.5} x1={0} x2={0} y1={0} y2={GRID_HEIGHT} />
            <polygon fill="#4cc9f0" points="-4,0 4,0 0,5" />
          </g>
        </svg>
        {/* Inspector */}
        <div className="flex flex-col gap-2 p-2 bg-neutral-900 border-l border-neutral-800 text-[8px] text-neutral-400" style={{ width: INSPECTOR_WIDTH }}>
          <span className="text-[7.5px] uppercase tracking-wider text-neutral-500">Note</span>
          <span className="text-[10px] text-neutral-100 font-semibold">
            {state.selected ? `${NOTE_NAMES[(LOW_NOTE + (state.blobs.find((b) => b.id === state.selected)?.row ?? 0)) % 12]} · ${Math.round(state.blobs.find((b) => b.id === state.selected)?.cents ?? 0)} ct` : "Phrase · 6 notes"}
          </span>
          {(
            [
              ["Pitch drift", 1 - state.correction * 0.85],
              ["Vibrato", 0.62],
              ["Transition", 0.4],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="flex justify-between">
                <span>{label}</span>
                <span className="text-neutral-200 tabular-nums">{Math.round(value * 100)} %</span>
              </span>
              <span className="h-1 rounded bg-neutral-800 overflow-hidden">
                <span className={cn("block h-full rounded bg-daw-accent transition-[width] duration-150")} style={{ width: `${value * 100}%` }} />
              </span>
            </div>
          ))}
          <span className="mt-auto rounded border border-neutral-700 px-1.5 py-1 text-center text-neutral-300">{state.status ?? "Snap to C major"}</span>
        </div>
      </div>
    </StageFrame>
  );
};

export default PitchEditorStage;
