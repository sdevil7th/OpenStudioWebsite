import type { StageTimelineSpec } from "./stage/useStageTimeline";
import type { BuiltInParamDescriptor } from "./vendor/stubs/nativeBridgeTypes";
import type { SessionState, TrackState, Transport } from "./types";

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

export const fract = (value: number) => value - Math.floor(value);
const hash = (value: number) => fract(Math.sin(value * 12.9898 + 78.233) * 43758.5453);
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Smooth value noise in 0..1, `rate` samples per second, `seed` per track. */
export const noise = (time: number, rate: number, seed: number) => {
  const x = time * rate + seed * 17.31;
  const i = Math.floor(x);
  const a = hash(i);
  const b = hash(i + 1);
  return a + (b - a) * smooth(x - i);
};

export const beatPhase = (time: number, tempo = TEMPO) => fract(time * (tempo / 60));
export const beatIndex = (time: number, tempo = TEMPO) => Math.floor(time * (tempo / 60));
export const hit = (phase: number, decay: number) => Math.pow(1 - phase, decay);

const clipActive = (index: number, time: number) =>
  TRACKS[index].clips.some((clip) => time >= clip.start && time < clip.start + clip.duration);

export const dbToLinear = (db: number) => Math.pow(10, db / 20);

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

/* ---------------------------------------------------------------------------
 * The hero choreography, expressed for `useStageTimeline`.
 * ------------------------------------------------------------------------- */

/** Total length of one pass of the choreography, in seconds. */
export const SCRIPT_LENGTH = 16;

export const SESSION_SPEC: StageTimelineSpec<SessionState> = {
  length: SCRIPT_LENGTH,
  initial: initialState,
  static: staticState,
  build: (tl, t0) => {
    const rest = initialState();
    const proxy = {
      time: 0,
      namFader: rest.tracks[2].volumeDb,
      guitarPan: rest.tracks[1].pan,
      drive: RACK_PARAMS[1].value,
      tone: RACK_PARAMS[2].value,
      gain: RACK_PARAMS[0].value,
    };
    const flags = { transport: "stopped" as Transport, loop: false, vocalSolo: false };
    const stopAt = t0 + SESSION_LENGTH;

    tl.call(() => {
      flags.transport = "playing";
    }, [], t0)
      .to(proxy, { time: SESSION_LENGTH, duration: SESSION_LENGTH, ease: "none" }, t0)
      // Ride the NAM Guitar fader up for the chorus.
      .to(proxy, { namFader: 1.8, duration: 2.2 }, t0 + 1.8)
      // Dial in the rig.
      .to(proxy, { drive: 6.8, duration: 1.8 }, t0 + 3.4)
      .to(proxy, { tone: 6.4, duration: 1.2 }, t0 + 4.8)
      // Solo the vocal to check the take, then release.
      .call(() => {
        flags.vocalSolo = true;
      }, [], t0 + 6.1)
      .call(() => {
        flags.vocalSolo = false;
      }, [], t0 + 7.9)
      // Pan the DI a little wider.
      .to(proxy, { guitarPan: -0.45, duration: 1.4 }, t0 + 8.4)
      // Loop the chorus.
      .call(() => {
        flags.loop = true;
      }, [], t0 + 9.3)
      // Stop.
      .call(() => {
        flags.transport = "stopped";
      }, [], stopAt)
      // Return to top and reset the session for the next pass.
      .call(() => {
        flags.loop = false;
      }, [], stopAt + 0.8)
      .to(
        proxy,
        {
          time: 0,
          namFader: rest.tracks[2].volumeDb,
          guitarPan: rest.tracks[1].pan,
          drive: RACK_PARAMS[1].value,
          tone: RACK_PARAMS[2].value,
          duration: 0.9,
          ease: "power3.inOut",
        },
        stopAt + 0.8,
      );

    return () => {
      const { transport } = flags;
      const time = proxy.time;
      const tracks = rest.tracks.map((track, index) => {
        const soloed = index === 0 && flags.vocalSolo;
        const silenced = flags.vocalSolo && index !== 0;
        return {
          ...track,
          volumeDb: index === 2 ? proxy.namFader : track.volumeDb,
          pan: index === 1 ? proxy.guitarPan : track.pan,
          soloed,
          level: silenced ? 0 : trackLevel(index, time, transport),
        };
      });
      const master = flags.vocalSolo ? tracks[0].level * 0.7 : masterLevel(time, transport);
      return {
        ...rest,
        time,
        transport,
        loop: flags.loop,
        tracks,
        master: { volumeDb: 0, level: master, clipping: false },
        knobs: { ...rest.knobs, inputGain: proxy.gain, drive: proxy.drive, tone: proxy.tone },
      };
    };
  },
};
