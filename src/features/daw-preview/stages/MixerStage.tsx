import { useRef } from "react";
import { MixerPanelLite } from "../MixerPanelLite";
import { MIN_ANIMATED_SCALE, StageFrame, useStageScale } from "../stage/StageFrame";
import type { StageProps } from "../stage/LiveStage";
import { useStageTimeline } from "../stage/useStageTimeline";
import { TransportLite } from "../TransportLite";
import { MIXER_TRACKS, SPEC } from "./mixerScript";

export const STAGE_WIDTH = 640;
export const STAGE_HEIGHT = 360;
const TRANSPORT_HEIGHT = 40;

const MixerStage = ({ priority, className }: StageProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(outerRef, STAGE_WIDTH);
  const state = useStageTimeline(SPEC, { scope: outerRef, enabled: scale >= MIN_ANIMATED_SCALE, priority, startDelay: 0.6 });

  return (
    <StageFrame
      className={className}
      data={{ transport: state.transport }}
      height={STAGE_HEIGHT}
      label="OpenStudio mixer: meters run on six strips, a fader is ridden, a track is muted and another soloed, a snapshot is recalled."
      outerRef={outerRef}
      scale={scale}
      width={STAGE_WIDTH}
    >
      <TransportLite loopEnabled={false} snapEnabled transport={state.transport} />
      <MixerPanelLite
        activeSnapshot={state.snapshot}
        height={STAGE_HEIGHT - TRANSPORT_HEIGHT}
        master={{ volumeDb: state.master.volumeDb, level: state.master.level, clipping: state.master.clipping }}
        snapshots={["Mix A", "Mix B"]}
        strips={MIXER_TRACKS.map((track, index) => {
          const live = state.tracks[index];
          return {
            armed: live.armed,
            color: track.color,
            hasFx: track.hasFx,
            input: track.input,
            isSelected: index === state.selectedTrack,
            level: live.level,
            muted: live.muted,
            name: track.name,
            pan: live.pan,
            sendCount: track.sendCount ?? 0,
            soloed: live.soloed,
            trackIndex: index,
            volumeDb: live.volumeDb,
          };
        })}
      />
    </StageFrame>
  );
};

export default MixerStage;
