import { useMemo, useRef } from "react";
import { MIN_ANIMATED_SCALE, StageFrame, useStageScale } from "../stage/StageFrame";
import type { StageProps } from "../stage/LiveStage";
import { useStageTimeline } from "../stage/useStageTimeline";
import { NAMRackDesignPort } from "../vendor/NAMRackDesignPort";
import { LIBRARY, RIG, RUNTIME, withValues } from "./namRackProps";
import { parseVariant, specFor } from "./namRackScript";

// The design port lays itself out with container units against its host, so
// the host is a fixed 960×540 that StageFrame scales into the column.
export const STAGE_WIDTH = 960;
export const STAGE_HEIGHT = 540;

const noop = () => undefined;

const LABELS = {
  pre: "OpenStudio NAM Rack, pedals page: Precision Drive is dialled in ahead of the amp.",
  amp: "OpenStudio NAM Rack, amp page: a Neural Amp Modeler capture with its gain being set.",
  cab: "OpenStudio NAM Rack, cabinet page: a 4×12 cabinet IR with Cabinet Space room being raised.",
  eq: "OpenStudio NAM Rack, EQ page: the nine-band graphic EQ with a band lifted.",
  post: "OpenStudio NAM Rack, post effects page: reverb mix is raised on the delay and reverb stages.",
  tuner: "OpenStudio NAM Rack tuner: the needle settles from flat to in tune on a low E.",
  tour: "OpenStudio NAM Rack: the tour dials in the amp, pedals, cabinet, EQ, post effects, and the tuner.",
};

/**
 * `variant` is "<section>[+tuner][+tour]", e.g. "amp+tour" for the page hero
 * or "cab" for a tile. Tiles below the legibility scale show a static frame.
 */
const NamRackStage = ({ variant, priority, className }: StageProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(outerRef, STAGE_WIDTH);
  const parsed = useMemo(() => parseVariant(variant), [variant]);
  const spec = useMemo(() => specFor(parsed), [parsed]);
  const state = useStageTimeline(spec, {
    scope: outerRef,
    enabled: scale >= MIN_ANIMATED_SCALE,
    priority,
    startDelay: 0.8,
    // The port is a large tree; 20 commits a second is plenty for knobs and meters.
    fps: 20,
  });
  const parameters = useMemo(() => withValues(state.values), [state.values]);
  const runtime = useMemo(
    () => ({ ...RUNTIME, inputLevelDb: state.inputLevelDb, outputLevelDb: state.outputLevelDb }),
    [state.inputLevelDb, state.outputLevelDb],
  );
  const label = parsed.tour ? LABELS.tour : parsed.tunerOpen ? LABELS.tuner : LABELS[parsed.section];
  const crop = parsed.tour ? undefined : "hardware";

  return (
    <StageFrame
      className={className}
      data={{ section: state.section, tuner: state.tunerOpen, crop }}
      height={STAGE_HEIGHT}
      label={label}
      outerRef={outerRef}
      scale={scale}
      width={STAGE_WIDTH}
    >
      <div className="daw-nam-stage" data-crop={crop}>
        <NAMRackDesignPort
          compareSlot={state.compareSlot}
          libraryItems={LIBRARY}
          onCycleSize={noop}
          onEnterSection={noop}
          onMaxSize={noop}
          onOpenAdvancedStage={noop}
          onOpenLibrary={noop}
          onOpenTuner={noop}
          onSaveTone={noop}
          parameters={parameters}
          rackSizePercent={crop ? 220 : 140}
          rig={RIG}
          runtime={runtime}
          sectionId={state.section}
          tuner={state.tuner}
          tunerOpen={state.tunerOpen}
        />
      </div>
    </StageFrame>
  );
};

export default NamRackStage;
