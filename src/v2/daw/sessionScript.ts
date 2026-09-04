import type { BuiltInParamDescriptor } from "./vendor/stubs/nativeBridgeTypes";
import type { SessionState, TrackState } from "./types";

/* ---------------------------------------------------------------------------
 * Static session data: what the hero "project" contains.
 * ------------------------------------------------------------------------- */

export const TEMPO = 120;
export const TIME_SIGNATURE = { numerator: 4, denominator: 4 } as const;
/** Seconds of arrangement that fit the lane width. */
export const SESSION_LENGTH = 12.5;
export const LOOP_RANGE: readonly [number, number] = [4, 8];

export interface TrackDef {
  name: string;
  color: string;
  input: string;
  hasFx: boolean;
  clips: Array<{ start: number; duration: number; label: string; kind: "audio" | "midi" }>;
}

export const TRACKS: readonly TrackDef[] = [
  {
    name: "Vocal",
    color: "#f472b6",
    input: "In 1",
    hasFx: true,
    clips: [
      { start: 2.0, duration: 4.4, label: "Verse", kind: "audio" },
      { start: 7.0, duration: 5.2, label: "Chorus", kind: "audio" },
    ],
  },
  {
    name: "Guitar DI",
    color: "#fbbf24",
    input: "In 2",
    hasFx: false,
    clips: [{ start: 0, duration: 12.5, label: "DI take 3", kind: "audio" }],
  },
  {
    name: "NAM Guitar",
    color: "#f59e0b",
    input: "In 2",
    hasFx: true,
    clips: [{ start: 0, duration: 12.5, label: "JVM · 4×12", kind: "audio" }],
  },
  {
    name: "Bass",
    color: "#34d399",
    input: "In 3",
    hasFx: true,
    clips: [{ start: 0, duration: 12.5, label: "Bass", kind: "audio" }],
  },
  {
    name: "Drums",
    color: "#60a5fa",
    input: "1-2",
    hasFx: true,
    clips: [
      { start: 0, duration: 6, label: "Kit A", kind: "midi" },
      { start: 6, duration: 6.5, label: "Kit A (fill)", kind: "midi" },
    ],
  },
];

/** NAM Rack knob descriptors, same shape the app's native bridge reports. */
export const RACK_PARAMS: readonly BuiltInParamDescriptor[] = [
  { id: "inputGain", label: "Gain", type: "continuous", value: 5, min: 0, max: 10, defaultValue: 5 },
  { id: "drive", label: "Drive", type: "continuous", value: 3.4, min: 0, max: 10, defaultValue: 5 },
  { id: "tone", label: "Tone", type: "continuous", value: 5.2, min: 0, max: 10, defaultValue: 5 },
  { id: "outputLevel", label: "Level", type: "continuous", value: 0, min: -20, max: 20, defaultValue: 0, unit: "dB" },
];

/* ---------------------------------------------------------------------------
 * State factories.
 * ------------------------------------------------------------------------- */

const REST_VOLUMES = [-2.4, -9.0, -6.0, -3.5, -1.2];
const REST_PANS = [0, -0.2, 0.25, 0, 0];

const track = (index: number, overrides: Partial<TrackState> = {}): TrackState => ({
  volumeDb: REST_VOLUMES[index] ?? 0,
  pan: REST_PANS[index] ?? 0,
  muted: false,
  soloed: false,
  armed: index === 0,
  level: 0,
  ...overrides,
});

export const initialState = (): SessionState => ({
  time: 0,
  transport: "stopped",
  loop: false,
  tracks: TRACKS.map((_, index) => track(index)),
  master: { volumeDb: 0, level: 0, clipping: false },
  knobs: Object.fromEntries(RACK_PARAMS.map((param) => [param.id, param.value])),
  rackPower: true,
  selectedTrack: 2,
  snap: true,
});

/** The frame shown when motion is reduced: mid-chorus, everything lit. */
export const staticState = (): SessionState => {
  const state = initialState();
  const time = 8.35;
  return {
    ...state,
    time,
    transport: "playing",
    loop: true,
    tracks: state.tracks.map((entry, index) => ({ ...entry, level: trackLevel(index, time, "playing") })),
    master: { ...state.master, level: masterLevel(time, "playing") },
    knobs: { ...state.knobs, drive: 6.8, tone: 6.4 },
  };
};

/* ---------------------------------------------------------------------------
 * Meter envelopes. Deterministic in `time` so the loop is identical every
 * pass, and shaped by the beat so drums and bass read as rhythm rather than
 * noise.
 * ------------------------------------------------------------------------- */

const fract = (value: number) => value - Math.floor(value);
const hash = (value: number) => fract(Math.sin(value * 12.9898 + 78.233) * 43758.5453);
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Smooth value noise in 0..1, `rate` samples per second, `seed` per track. */
const noise = (time: number, rate: number, seed: number) => {
  const x = time * rate + seed * 17.31;
  const i = Math.floor(x);
  const a = hash(i);
  const b = hash(i + 1);
  return a + (b - a) * smooth(x - i);
};

const beatPhase = (time: number) => fract(time * (TEMPO / 60));
const beatIndex = (time: number) => Math.floor(time * (TEMPO / 60));
const hit = (phase: number, decay: number) => Math.pow(1 - phase, decay);

const clipActive = (index: number, time: number) =>
  TRACKS[index].clips.some((clip) => time >= clip.start && time < clip.start + clip.duration);

const dbToLinear = (db: number) => Math.pow(10, db / 20);

export const trackLevel = (index: number, time: number, transport: SessionState["transport"]): number => {
  if (transport === "stopped" || !clipActive(index, time)) return 0;
  const phase = beatPhase(time);
  const beat = beatIndex(time) % 4;
  switch (index) {
    case 0: {
      // Vocal: phrase-shaped swell with breathy movement.
      const phrase = 0.55 + 0.45 * Math.sin((time - 2) * 1.35);
      return dbToLinear(-9 + 6 * noise(time, 6, 1) + 4 * phrase);
    }
    case 1:
      // Guitar DI: quiet, steady.
      return dbToLinear(-16 + 5 * noise(time, 5, 2) + 3 * hit(phase, 2) * (beat % 2));
    case 2:
      // NAM Guitar: chugs on the 8ths.
      return dbToLinear(-5 + 5 * noise(time, 7, 3) + 5 * hit(fract(phase * 2), 3));
    case 3:
      // Bass: beats 1 and 3.
      return dbToLinear(-7 + 3 * noise(time, 4, 4) + 7 * hit(phase, 4) * (beat === 0 || beat === 2 ? 1 : 0.35));
    default:
      // Drums: kick on every beat, accent on 1, snare on 2 & 4.
      return dbToLinear(-4 + 2 * noise(time, 9, 5) + 8 * hit(phase, 5) * (beat === 0 ? 1 : beat % 2 ? 0.9 : 0.7));
  }
};

export const masterLevel = (time: number, transport: SessionState["transport"]): number => {
  if (transport === "stopped") return 0;
  const sum = TRACKS.reduce((total, _, index) => total + trackLevel(index, time, transport) ** 2, 0);
  return Math.min(1.35, Math.sqrt(sum) * 0.62);
};
