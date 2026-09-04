// Choreography for the mixer stage: seven strips plus master, one mix pass.
import { beatIndex, beatPhase, dbToLinear, hit, noise } from "../sessionScript";
import type { StageTimelineSpec } from "../stage/useStageTimeline";
import type { TrackState, Transport } from "../types";

export interface MixerTrackDef {
  name: string;
  color: string;
  input: string;
  hasFx: boolean;
  seed: number;
  sendCount?: number;
}

export interface MixerState {
  time: number;
  transport: Transport;
  tracks: TrackState[];
  master: { volumeDb: number; level: number; clipping: boolean };
  selectedTrack: number;
  snapshot: string;
}

export const MIXER_TRACKS: readonly MixerTrackDef[] = [
  { name: "Vocal", color: "#f472b6", input: "In 1", hasFx: true, seed: 1, sendCount: 2 },
  { name: "Guitar DI", color: "#fbbf24", input: "In 2", hasFx: false, seed: 2 },
  { name: "NAM Gtr", color: "#f59e0b", input: "In 2", hasFx: true, seed: 3, sendCount: 1 },
  { name: "Bass", color: "#34d399", input: "In 3", hasFx: true, seed: 4 },
  { name: "Keys", color: "#a78bfa", input: "MIDI", hasFx: true, seed: 6, sendCount: 1 },
  { name: "Drums", color: "#60a5fa", input: "1-2", hasFx: true, seed: 5 },
  { name: "Reverb", color: "#22d3ee", input: "Bus", hasFx: true, seed: 7 },
];

const REST_VOLUMES = [-2.4, -9.0, -6.0, -3.5, -7.5, -1.2, -12.0];
const REST_PANS = [0, -0.2, 0.25, 0, 0.15, 0, 0];

const TEMPO = 120;

export const mixerLevel = (seed: number, time: number, transport: Transport) => {
  if (transport === "stopped") return 0;
  const phase = beatPhase(time, TEMPO);
  const beat = beatIndex(time, TEMPO) % 4;
  switch (seed) {
    case 1:
      return dbToLinear(-9 + 6 * noise(time, 6, 1) + 4 * (0.55 + 0.45 * Math.sin((time - 2) * 1.35)));
    case 2:
      return dbToLinear(-16 + 5 * noise(time, 5, 2) + 3 * hit(phase, 2) * (beat % 2));
    case 3:
      return dbToLinear(-5 + 5 * noise(time, 7, 3) + 5 * hit((phase * 2) % 1, 3));
    case 4:
      return dbToLinear(-7 + 3 * noise(time, 4, 4) + 7 * hit(phase, 4) * (beat === 0 || beat === 2 ? 1 : 0.35));
    case 5:
      return dbToLinear(-4 + 2 * noise(time, 9, 5) + 8 * hit(phase, 5) * (beat === 0 ? 1 : beat % 2 ? 0.9 : 0.7));
    case 6:
      return dbToLinear(-12 + 5 * noise(time, 3, 6) + 4 * hit(phase, 2));
    default:
      return dbToLinear(-18 + 8 * noise(time, 2, 7));
  }
};

const rest = (): TrackState[] =>
  MIXER_TRACKS.map((_, index) => ({
    volumeDb: REST_VOLUMES[index],
    pan: REST_PANS[index],
    muted: false,
    soloed: false,
    armed: index === 0,
    level: 0,
  }));

const masterFrom = (tracks: TrackState[]) =>
  Math.min(1.35, Math.sqrt(tracks.reduce((total, track) => total + track.level ** 2, 0)) * 0.55);

const frame = (
  time: number,
  transport: Transport,
  edits: { vocalFader: number; drumsPan: number; muteDi: boolean; soloNam: boolean; clip: boolean; snapshot: string },
): MixerState => {
  const tracks = rest().map((track, index) => {
    const silenced = (edits.soloNam && index !== 2) || (edits.muteDi && index === 1);
    return {
      ...track,
      volumeDb: index === 0 ? edits.vocalFader : track.volumeDb,
      pan: index === 5 ? edits.drumsPan : track.pan,
      muted: edits.muteDi && index === 1,
      soloed: edits.soloNam && index === 2,
      level: silenced ? 0 : mixerLevel(MIXER_TRACKS[index].seed, time, transport),
    };
  });
  const master = masterFrom(tracks) * (edits.clip ? 1.25 : 1);
  return {
    time,
    transport,
    tracks,
    master: { volumeDb: edits.clip ? 2.5 : 0, level: master, clipping: edits.clip },
    selectedTrack: edits.soloNam ? 2 : edits.muteDi ? 1 : 0,
    snapshot: edits.snapshot,
  };
};

export const SPEC: StageTimelineSpec<MixerState> = {
  length: 14,
  initial: () => frame(0, "stopped", { vocalFader: REST_VOLUMES[0], drumsPan: 0, muteDi: false, soloNam: false, clip: false, snapshot: "Mix A" }),
  static: () => frame(6.3, "playing", { vocalFader: 0.6, drumsPan: 0, muteDi: true, soloNam: false, clip: false, snapshot: "Mix B" }),
  build: (tl, t0) => {
    const proxy = { time: 0, vocalFader: REST_VOLUMES[0], drumsPan: 0 };
    const flags = { transport: "stopped" as Transport, muteDi: false, soloNam: false, clip: false, snapshot: "Mix A" };
    const stopAt = t0 + 11.4;

    tl.call(() => {
      flags.transport = "playing";
    }, [], t0)
      .to(proxy, { time: 12, duration: 12, ease: "none" }, t0)
      .to(proxy, { vocalFader: 0.6, duration: 2.0 }, t0 + 1.2)
      .call(() => {
        flags.muteDi = true;
      }, [], t0 + 3.4)
      .call(() => {
        flags.soloNam = true;
      }, [], t0 + 4.6)
      .call(() => {
        flags.soloNam = false;
      }, [], t0 + 6.2)
      .to(proxy, { drumsPan: -0.5, duration: 0.9 }, t0 + 6.6)
      .to(proxy, { drumsPan: 0.35, duration: 1.1 }, t0 + 7.6)
      .call(() => {
        flags.snapshot = "Mix B";
      }, [], t0 + 8.9)
      .call(() => {
        flags.clip = true;
      }, [], t0 + 9.6)
      .call(() => {
        flags.clip = false;
      }, [], t0 + 10.3)
      .call(() => {
        flags.transport = "stopped";
      }, [], stopAt)
      .call(() => {
        flags.muteDi = false;
        flags.snapshot = "Mix A";
      }, [], stopAt + 0.8)
      .to(proxy, { time: 0, vocalFader: REST_VOLUMES[0], drumsPan: 0, duration: 0.9, ease: "power3.inOut" }, stopAt + 0.8);

    return () => frame(proxy.time, flags.transport, { vocalFader: proxy.vocalFader, drumsPan: proxy.drumsPan, ...flags });
  },
};
