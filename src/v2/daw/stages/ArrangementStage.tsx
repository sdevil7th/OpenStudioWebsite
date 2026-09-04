import { useRef } from "react";
import { ArrangementLanes, arrangementHeight, clipPattern } from "../ArrangementLanes";
import { BigClockLite } from "../BigClockLite";
import { MIN_ANIMATED_SCALE, StageFrame, useStageScale } from "../stage/StageFrame";
import type { StageProps } from "../stage/LiveStage";
import { useStageTimeline } from "../stage/useStageTimeline";
import { TransportLite } from "../TransportLite";
import { LOOP_RANGE, SESSION_LENGTH, SPECS, TEMPO, TIME_SIGNATURE, laneCapacity, type ArrangementVariant } from "./arrangementScript";

export const STAGE_WIDTH = 640;
export const STAGE_HEIGHT = 360;
const TRANSPORT_HEIGHT = 40;
const HEADER_WIDTH = 112;

const LABELS: Record<ArrangementVariant, string> = {
  default: "OpenStudio arrangement: a clip is split with the razor, dragged to the grid, and the section is looped.",
  recording: "OpenStudio arrangement: a vocal take is punched in over four bars while the band plays.",
  stems: "OpenStudio arrangement: BS Roformer separates a full mix and six stems arrive as new tracks.",
};

const ArrangementStage = ({ variant = "default", priority, className }: StageProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(outerRef, STAGE_WIDTH);
  const kind = (variant in SPECS ? variant : "default") as ArrangementVariant;
  const state = useStageTimeline(SPECS[kind], { scope: outerRef, enabled: scale >= MIN_ANIMATED_SCALE, priority, startDelay: 0.6 });

  const capacity = laneCapacity(kind);
  const laneHeight = Math.floor((STAGE_HEIGHT - TRANSPORT_HEIGHT - 30) / capacity);
  const lanes = [...state.lanes];
  // Keep the stage height fixed while stems are still arriving.
  while (lanes.length < capacity) lanes.push({ name: `placeholder-${lanes.length}`, color: "transparent", clips: [], entering: true });
  const lanesWidth = STAGE_WIDTH - HEADER_WIDTH;
  const pixelsPerSecond = lanesWidth / SESSION_LENGTH;
  const height = arrangementHeight(capacity, laneHeight);

  return (
    <StageFrame
      className={className}
      data={{ transport: state.transport, variant: kind }}
      height={STAGE_HEIGHT}
      label={LABELS[kind]}
      outerRef={outerRef}
      scale={scale}
      width={STAGE_WIDTH}
    >
      <TransportLite
        loopEnabled={state.loop}
        snapEnabled
        transport={state.transport}
        trailing={<BigClockLite size="docked" tempo={TEMPO} timeSeconds={state.time} timeSignature={TIME_SIGNATURE} transport={state.transport} />}
      />
      <ArrangementLanes
        headerWidth={HEADER_WIDTH}
        laneHeight={laneHeight}
        lanes={lanes}
        loop={state.loop}
        loopRange={LOOP_RANGE}
        overlay={
          <>
            {state.razorAt !== undefined ? (
              <div
                className="absolute top-0 bottom-0 w-px bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.9)] z-[2]"
                style={{ left: state.razorAt * pixelsPerSecond }}
              />
            ) : null}
            {state.dragGhost ? (
              <div
                className="absolute rounded-[3px] border border-dashed border-white/60 z-[2]"
                style={{
                  left: state.dragGhost.start * pixelsPerSecond,
                  width: state.dragGhost.duration * pixelsPerSecond,
                  top: 30 + state.dragGhost.lane * laneHeight + 3,
                  height: laneHeight - 6,
                  backgroundImage: clipPattern("midi", "#a78bfa"),
                  opacity: 0.5,
                }}
              />
            ) : null}
            {state.status ? (
              <div className="absolute right-2 bottom-2 z-[3] rounded bg-neutral-950/90 border border-cyan-500/40 px-2 py-1 text-[9px] font-semibold text-cyan-200 shadow-lg">
                {state.transport === "recording" ? <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 align-middle recording-dot" /> : null}
                {state.status}
              </div>
            ) : null}
          </>
        }
        selectedTrack={state.selectedTrack}
        sessionLength={SESSION_LENGTH}
        tempo={TEMPO}
        time={state.time}
        timeSignature={TIME_SIGNATURE}
        transport={state.transport}
        width={STAGE_WIDTH}
      />
      <div className="flex-1 bg-neutral-900" style={{ minHeight: STAGE_HEIGHT - TRANSPORT_HEIGHT - height }} />
    </StageFrame>
  );
};

export default ArrangementStage;
