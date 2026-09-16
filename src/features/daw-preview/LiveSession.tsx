import { useRef } from "react";
import { ArrangementLanes, arrangementHeight } from "./ArrangementLanes";
import { BigClockLite } from "./BigClockLite";
import { MixerPanelLite } from "./MixerPanelLite";
import { LOOP_RANGE, SESSION_LENGTH, TEMPO, TIME_SIGNATURE, TRACKS } from "./sessionScript";
import { StageFrame, useStageFit } from "./stage/StageFrame";
import { TransportLite } from "./TransportLite";
import { useSessionTimeline } from "./useSessionTimeline";

/**
 * Narrowest layout of the stage. Wider columns widen the timeline and mixer
 * at 1:1 instead of scaling everything up; narrower ones scale this down.
 */
export const MIN_STAGE_WIDTH = 640;
const TRANSPORT_HEIGHT = 40;
const LANE_HEIGHT = 48;
const MIXER_HEIGHT = 290;
const ARRANGEMENT_HEIGHT = arrangementHeight(TRACKS.length, LANE_HEIGHT, true);
export const STAGE_HEIGHT = TRANSPORT_HEIGHT + ARRANGEMENT_HEIGHT + MIXER_HEIGHT;

interface LiveSessionProps {
  className?: string;
  /** Pauses the choreography and renders the static frame (e.g. off-screen tabs). */
  paused?: boolean;
}

const LiveSession = ({ className, paused = false }: LiveSessionProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const { width: stageWidth, scale } = useStageFit(outerRef, MIN_STAGE_WIDTH);
  const state = useSessionTimeline({ scope: outerRef, enabled: !paused });

  const lanes = TRACKS.map((track, index) => ({
    name: track.name,
    color: track.color,
    type: track.type,
    input: track.input,
    hasFx: track.hasFx,
    clips: track.clips,
    volumeDb: state.tracks[index].volumeDb,
    pan: state.tracks[index].pan,
    soloed: state.tracks[index].soloed,
    armed: state.tracks[index].armed,
    level: state.tracks[index].level,
  }));

  return (
    <StageFrame
      className={className}
      data={{ transport: state.transport }}
      height={STAGE_HEIGHT}
      label="OpenStudio session: the transport is playing, a fader is ridden and the vocal is soloed while meters move in the mixer."
      outerRef={outerRef}
      scale={scale}
      width={stageWidth}
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
        master={{ volumeDb: state.master.volumeDb }}
        selectedTrack={state.selectedTrack}
        sessionLength={SESSION_LENGTH}
        tempo={TEMPO}
        time={state.time}
        timeSignature={TIME_SIGNATURE}
        transport={state.transport}
        width={stageWidth}
      />

      <MixerPanelLite
        height={MIXER_HEIGHT}
        master={{ volumeDb: state.master.volumeDb, level: state.master.level, clipping: state.master.clipping }}
        snapshots={["Mix A"]}
        activeSnapshot="Mix A"
        strips={TRACKS.map((track, index) => {
          const live = state.tracks[index];
          return {
            armed: live.armed,
            color: track.color,
            hasFx: track.hasFx,
            input: track.stripInput,
            isSelected: index === state.selectedTrack,
            level: live.level,
            muted: live.muted,
            name: track.name,
            pan: live.pan,
            sendCount: index === 0 ? 1 : 0,
            soloed: live.soloed,
            trackIndex: index,
            volumeDb: live.volumeDb,
          };
        })}
      />
    </StageFrame>
  );
};

export default LiveSession;
