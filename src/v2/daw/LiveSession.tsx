import { useRef } from "react";
import { ArrangementLanes, arrangementHeight } from "./ArrangementLanes";
import { BigClockLite } from "./BigClockLite";
import { ChannelStripLite } from "./ChannelStripLite";
import { RackModuleLite } from "./RackModuleLite";
import { LOOP_RANGE, SESSION_LENGTH, TEMPO, TIME_SIGNATURE, TRACKS } from "./sessionScript";
import { MIN_ANIMATED_SCALE, StageFrame, useStageScale } from "./stage/StageFrame";
import { TransportLite } from "./TransportLite";
import { useSessionTimeline } from "./useSessionTimeline";

/** Design size of the stage; it is CSS-scaled to the column it sits in. */
export const STAGE_WIDTH = 640;
const TRANSPORT_HEIGHT = 40;
const LANE_HEIGHT = 30;
const MIXER_HEIGHT = 252;
const ARRANGEMENT_HEIGHT = arrangementHeight(TRACKS.length, LANE_HEIGHT);
export const STAGE_HEIGHT = TRANSPORT_HEIGHT + ARRANGEMENT_HEIGHT + 1 + MIXER_HEIGHT;

interface LiveSessionProps {
  className?: string;
  /** Pauses the choreography and renders the static frame (e.g. off-screen tabs). */
  paused?: boolean;
}

const LiveSession = ({ className, paused = false }: LiveSessionProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(outerRef, STAGE_WIDTH);
  const state = useSessionTimeline({ scope: outerRef, enabled: !paused && scale >= MIN_ANIMATED_SCALE });

  const lanes = TRACKS.map((track, index) => ({
    name: track.name,
    color: track.color,
    clips: track.clips,
    soloed: state.tracks[index].soloed,
    armed: state.tracks[index].armed,
    level: state.tracks[index].level,
  }));

  return (
    <StageFrame
      className={className}
      data={{ transport: state.transport }}
      height={STAGE_HEIGHT}
      label="OpenStudio session: the transport is playing, meters move in the mixer, and the NAM Rack knobs are being dialled in."
      outerRef={outerRef}
      scale={scale}
      width={STAGE_WIDTH}
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

      <ArrangementLanes
        lanes={lanes}
        laneHeight={LANE_HEIGHT}
        loop={state.loop}
        loopRange={LOOP_RANGE}
        selectedTrack={state.selectedTrack}
        sessionLength={SESSION_LENGTH}
        tempo={TEMPO}
        time={state.time}
        timeSignature={TIME_SIGNATURE}
        transport={state.transport}
        width={STAGE_WIDTH}
      />

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
    </StageFrame>
  );
};

export default LiveSession;
