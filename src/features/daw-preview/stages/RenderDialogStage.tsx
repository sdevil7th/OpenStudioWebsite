import { useRef } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrangementLanes } from "../ArrangementLanes";
import { DawButton } from "../DawButton";
import { MIN_ANIMATED_SCALE, StageFrame, useStageScale } from "../stage/StageFrame";
import type { StageProps } from "../stage/LiveStage";
import { useStageTimeline } from "../stage/useStageTimeline";
import { TransportLite } from "../TransportLite";
import { DEFAULT_SPEC, LOOP_RANGE, SESSION_LENGTH, TEMPO, TIME_SIGNATURE } from "./arrangementScript";
import { SPEC, type RenderDialogState } from "./renderDialogScript";

export const STAGE_WIDTH = 640;
export const STAGE_HEIGHT = 360;
const DIALOG_WIDTH = 396;

const backdrop = DEFAULT_SPEC.static();

const Field = ({ label, value, focused, select = true }: { label: string; value: string; focused?: boolean; select?: boolean }) => (
  <label className="flex flex-col gap-0.5 min-w-0">
    <span className="text-[7.5px] uppercase tracking-wider text-neutral-500">{label}</span>
    <span
      className={cn(
        "flex items-center justify-between h-5 px-1.5 rounded border bg-neutral-900 text-[9px] text-neutral-200 transition-colors",
        focused ? "border-daw-accent shadow-[0_0_0_2px_rgba(0,120,212,0.35)]" : "border-neutral-700",
      )}
    >
      <span className="truncate">{value}</span>
      {select ? <ChevronDown className="text-neutral-500 shrink-0" size={9} /> : null}
    </span>
  </label>
);

const Checkbox = ({ label, checked, focused }: { label: string; checked: boolean; focused?: boolean }) => (
  <span className="flex items-center gap-1.5 text-[9px] text-neutral-300">
    <span
      className={cn(
        "w-3 h-3 rounded-[2px] border flex items-center justify-center transition-colors",
        checked ? "bg-daw-accent border-daw-accent text-white" : "bg-neutral-900 border-neutral-600",
        focused && "shadow-[0_0_0_2px_rgba(0,120,212,0.35)]",
      )}
    >
      {checked ? <Check size={8} strokeWidth={3} /> : null}
    </span>
    {label}
  </span>
);

const Dialog = ({ state }: { state: RenderDialogState }) => (
  <div
    className={cn(
      "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border border-neutral-700 bg-daw-panel shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-300",
      state.open ? "opacity-100 scale-100" : "opacity-0 scale-95",
    )}
    style={{ width: DIALOG_WIDTH }}
  >
    <div className="flex items-center justify-between h-7 px-3 border-b border-neutral-800">
      <span className="text-[10px] font-semibold text-neutral-100">Render to File</span>
      <span className={cn("text-neutral-500 rounded p-0.5", state.focus === "close" && "bg-neutral-700 text-neutral-100")}>
        <X size={10} />
      </span>
    </div>
    <div className="p-3 grid grid-cols-2 gap-x-3 gap-y-2">
      <Field label="Source" value="Master mix + all stems" />
      <Field focused={state.focus === "bounds"} label="Bounds" value={state.bounds} />
      <Field label="Directory" select={false} value="~/Music/OpenStudio/Renders" />
      <Field label="File name" select={false} value="$project-$track" />
      <Field focused={state.focus === "format"} label="Format" value={state.format} />
      <Field label="Sample rate · bit depth" value={state.format === "FLAC" ? "48000 Hz · 24-bit" : "44100 Hz · 24-bit"} />
      <div className="col-span-2 flex items-center gap-4 pt-1">
        <Checkbox checked={state.stems} focused={state.focus === "stems"} label="Render stems" />
        <Checkbox checked label="Normalize" />
        <Checkbox checked={state.format === "FLAC"} label="Dither" />
        <Checkbox checked label="Add to project" />
      </div>
      {/* Queue */}
      <div className="col-span-2 rounded border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="flex items-center justify-between px-2 h-4 border-b border-neutral-800 text-[7.5px] uppercase tracking-wider text-neutral-500">
          <span>Queue · {state.jobs.length}</span>
          <span className={cn("normal-case tracking-normal", state.status?.startsWith("Done") ? "text-green-400" : "text-cyan-300")}>{state.status}</span>
        </div>
        {state.jobs.map((job) => (
          <div key={job.name} className="relative flex items-center justify-between px-2 h-[15px] text-[8.5px] text-neutral-300 border-b border-neutral-800/60 last:border-b-0">
            <span className="absolute inset-y-0 left-0 bg-daw-accent/25 transition-[width] duration-150" style={{ width: `${job.progress * 100}%` }} />
            <span className="relative">{job.name}</span>
            <span className={cn("relative tabular-nums", job.done ? "text-green-400" : "text-neutral-500")}>
              {job.done ? <Check size={9} /> : job.progress > 0 ? `${Math.round(job.progress * 100)} %` : "queued"}
            </span>
          </div>
        ))}
      </div>
      <div className="col-span-2 flex items-center justify-end gap-1.5 pt-1">
        <DawButton className="px-2 h-5 text-[9px]" size="xs" variant="default">
          Cancel
        </DawButton>
        <DawButton className="px-2 h-5 text-[9px]" size="xs" variant="default">
          Add to Queue
        </DawButton>
        <DawButton
          active={state.focus === "render" || state.rendering}
          className="px-2 h-5 text-[9px] font-semibold"
          size="xs"
          variant="primary"
        >
          {state.rendering ? `Rendering ${Math.round(state.progress * 100)} %` : `Render ${state.jobs.length} file${state.jobs.length === 1 ? "" : "s"}`}
        </DawButton>
      </div>
    </div>
  </div>
);

const RenderDialogStage = ({ priority, className }: StageProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(outerRef, STAGE_WIDTH);
  const state = useStageTimeline(SPEC, { scope: outerRef, enabled: scale >= MIN_ANIMATED_SCALE, priority, startDelay: 0.5, fps: 24 });

  return (
    <StageFrame
      className={className}
      data={{ rendering: state.rendering }}
      height={STAGE_HEIGHT}
      label="OpenStudio render dialog: format and bounds are chosen, stems are enabled, and six files render through the queue."
      outerRef={outerRef}
      scale={scale}
      width={STAGE_WIDTH}
    >
      <div className="opacity-40 pointer-events-none">
        <TransportLite loopEnabled snapEnabled transport="stopped" />
        <ArrangementLanes
          laneHeight={32}
          lanes={backdrop.lanes}
          loop
          loopRange={LOOP_RANGE}
          selectedTrack={-1}
          sessionLength={SESSION_LENGTH}
          tempo={TEMPO}
          time={0}
          timeSignature={TIME_SIGNATURE}
          transport="stopped"
          width={STAGE_WIDTH}
        />
      </div>
      <div className="absolute inset-0 bg-black/45" />
      <Dialog state={state} />
    </StageFrame>
  );
};

export default RenderDialogStage;
