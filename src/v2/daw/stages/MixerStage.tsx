import { useRef } from "react";
import { Camera } from "lucide-react";
import { ChannelStripLite } from "../ChannelStripLite";
import { DawButton } from "../DawButton";
import { MIN_ANIMATED_SCALE, StageFrame, useStageScale } from "../stage/StageFrame";
import type { StageProps } from "../stage/LiveStage";
import { useStageTimeline } from "../stage/useStageTimeline";
import { TransportLite } from "../TransportLite";
import { MIXER_TRACKS, SPEC } from "./mixerScript";

export const STAGE_WIDTH = 640;
export const STAGE_HEIGHT = 360;
const TRANSPORT_HEIGHT = 40;
const SNAPSHOT_BAR = 24;

const MixerStage = ({ priority, className }: StageProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(outerRef, STAGE_WIDTH);
  const state = useStageTimeline(SPEC, { scope: outerRef, enabled: scale >= MIN_ANIMATED_SCALE, priority, startDelay: 0.6 });

  return (
    <StageFrame
      className={className}
      data={{ transport: state.transport }}
      height={STAGE_HEIGHT}
      label="OpenStudio mixer: meters run on seven strips, a fader is ridden, a track is muted and another soloed, a snapshot is saved."
      outerRef={outerRef}
      scale={scale}
      width={STAGE_WIDTH}
    >
      <TransportLite loopEnabled={false} snapEnabled transport={state.transport} />
      {/* Mixer snapshots toolbar, as in the app's mixer panel header. */}
      <div className="flex items-center gap-1.5 px-2 bg-neutral-900 border-b border-neutral-800 shrink-0" style={{ height: SNAPSHOT_BAR }}>
        <span className="text-[8px] uppercase tracking-wider text-neutral-500 mr-1">Mixer</span>
        {["Mix A", "Mix B"].map((name) => (
          <DawButton key={name} active={state.snapshot === name} className="px-1.5 text-[8px] h-4" size="xs" variant="default">
            {name}
          </DawButton>
        ))}
        <DawButton className="ml-auto px-1.5 text-[8px] h-4" size="xs" variant="default">
          <Camera size={9} /> Save
        </DawButton>
      </div>
      <div className="flex shrink-0 bg-neutral-900" style={{ height: STAGE_HEIGHT - TRANSPORT_HEIGHT - SNAPSHOT_BAR }}>
        {MIXER_TRACKS.map((track, index) => {
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
              sendCount={track.sendCount ?? 0}
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
          trackIndex={MIXER_TRACKS.length}
          volumeDb={state.master.volumeDb}
        />
      </div>
    </StageFrame>
  );
};

export default MixerStage;
