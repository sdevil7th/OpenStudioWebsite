// Choreography for the arrangement stage's three variants. Every variant is
// a StageTimelineSpec; the stage picks one by name. Timings are seconds from
// t0, and the whole loop derives from the timeline position alone.
import type { LaneClip, LaneDef } from "../ArrangementLanes";
import { beatIndex, beatPhase, dbToLinear, hit, noise } from "../sessionScript";
import type { StageTimelineSpec } from "../stage/useStageTimeline";
import type { TrackType } from "../TrackHeaderLite";
import type { Transport } from "../types";

export type ArrangementVariant = "default" | "recording" | "stems";

export interface ArrangementState {
  time: number;
  transport: Transport;
  loop: boolean;
  lanes: LaneDef[];
  selectedTrack: number;
  /** Chip drawn over the lanes ("BS Roformer · separating 42 %"). */
  status?: string;
  /** Razor line position in seconds, while a split is being made. */
  razorAt?: number;
  /** Snap-ghost for the clip being dragged, in seconds. */
  dragGhost?: { lane: number; start: number; duration: number };
}

export const TEMPO = 120;
export const TIME_SIGNATURE = { numerator: 4, denominator: 4 } as const;
/** Seconds of arrangement that fit the lane width. */
export const SESSION_LENGTH = 12.5;
export const LOOP_RANGE: readonly [number, number] = [2, 6];

const bar = (n: number) => (n - 1) * 2; // seconds at 120 bpm, 4/4

interface TrackSeed {
  name: string;
  color: string;
  type: TrackType;
  input?: string;
  hasFx?: boolean;
  volumeDb?: number;
  pan?: number;
  clips: LaneClip[];
  seed: number;
}

const DEFAULT_TRACKS: TrackSeed[] = [
  {
    name: "Vocal",
    color: "#f472b6",
    type: "audio",
    input: "In 1-2",
    hasFx: true,
    volumeDb: -2.4,
    seed: 1,
    clips: [
      { start: bar(2), duration: 4.4, label: "Verse", kind: "audio", profile: "vocal", seed: 1 },
      { start: bar(4) + 0.6, duration: 5.2, label: "Chorus", kind: "audio", profile: "vocal", seed: 2 },
    ],
  },
  { name: "Guitar", color: "#f59e0b", type: "audio", input: "In 3-4", hasFx: true, volumeDb: -6, pan: 0.25, seed: 3, clips: [{ start: 0, duration: 12.5, label: "JVM · 4×12", kind: "audio", profile: "guitar", seed: 3 }] },
  { name: "Bass", color: "#34d399", type: "audio", input: "In 5-6", hasFx: true, volumeDb: -3.5, seed: 4, clips: [{ start: 0, duration: 12.5, label: "Bass DI", kind: "audio", profile: "bass", seed: 4 }] },
  {
    name: "Keys",
    color: "#a78bfa",
    type: "instrument",
    hasFx: true,
    volumeDb: -7.5,
    pan: -0.15,
    seed: 6,
    clips: [
      { start: bar(1), duration: 6, label: "Rhodes", kind: "midi", profile: "keys", seed: 6 },
      { start: bar(4), duration: 6.5, label: "Rhodes (out)", kind: "midi", profile: "keys", seed: 9 },
    ],
  },
  {
    name: "Drums",
    color: "#60a5fa",
    type: "instrument",
    hasFx: true,
    volumeDb: -1.2,
    seed: 5,
    clips: [
      { start: 0, duration: 6, label: "Kit A", kind: "midi", profile: "drums", seed: 5 },
      { start: 6, duration: 6.5, label: "Kit A (fill)", kind: "midi", profile: "drums", seed: 8 },
    ],
  },
  { name: "FX", color: "#22d3ee", type: "audio", input: "In 7-8", volumeDb: -12, seed: 7, clips: [{ start: bar(5), duration: 2.2, label: "Riser", kind: "audio", profile: "fx", seed: 7 }] },
];

const STEM_SEEDS: Array<Pick<TrackSeed, "name" | "color" | "seed"> & { profile: LaneClip["profile"] }> = [
  { name: "Vocals", color: "#ec4899", seed: 1, profile: "vocal" },
  { name: "Drums", color: "#f97316", seed: 5, profile: "drums" },
  { name: "Bass", color: "#3b82f6", seed: 4, profile: "bass" },
  { name: "Guitar", color: "#8b5cf6", seed: 3, profile: "guitar" },
  { name: "Piano", color: "#06b6d4", seed: 6, profile: "keys" },
  { name: "Other", color: "#22c55e", seed: 7, profile: "other" },
];

const STEM_TRACKS: TrackSeed[] = STEM_SEEDS.map((stem, index) => ({
  name: stem.name,
  color: stem.color,
  type: "audio",
  input: "In 1-2",
  hasFx: false,
  seed: stem.seed,
  clips: [{ start: 0, duration: 12.5, label: `${stem.name}.wav`, kind: "audio", profile: stem.profile, seed: 20 + index }],
}));

const clipActive = (clips: readonly LaneClip[], time: number) =>
  clips.some((clip) => time >= clip.start && time < clip.start + clip.duration);

/** Beat-shaped, deterministic level for any lane; `seed` picks the flavour. */
export const laneLevel = (seed: number, clips: readonly LaneClip[], time: number, transport: Transport) => {
  if (transport === "stopped" || !clipActive(clips, time)) return 0;
  const phase = beatPhase(time, TEMPO);
  const beat = beatIndex(time, TEMPO) % 4;
  switch (seed) {
    case 1:
      return dbToLinear(-9 + 6 * noise(time, 6, 1) + 4 * (0.55 + 0.45 * Math.sin((time - 2) * 1.35)));
    case 4:
      return dbToLinear(-7 + 3 * noise(time, 4, 4) + 7 * hit(phase, 4) * (beat === 0 || beat === 2 ? 1 : 0.35));
    case 5:
      return dbToLinear(-4 + 2 * noise(time, 9, 5) + 8 * hit(phase, 5) * (beat === 0 ? 1 : beat % 2 ? 0.9 : 0.7));
    case 6:
      return dbToLinear(-12 + 5 * noise(time, 3, 6) + 4 * hit(phase, 2));
    case 7:
      return dbToLinear(-14 + 8 * noise(time, 2, 7));
    default:
      return dbToLinear(-5 + 5 * noise(time, 7, 3) + 5 * hit((phase * 2) % 1, 3));
  }
};

const lanesFrom = (tracks: readonly TrackSeed[], time: number, transport: Transport, overrides: Partial<LaneDef>[] = []): LaneDef[] =>
  tracks.map((track, index) => ({
    name: track.name,
    color: track.color,
    type: track.type,
    input: track.input,
    hasFx: track.hasFx,
    volumeDb: track.volumeDb ?? 0,
    pan: track.pan ?? 0,
    clips: track.clips,
    level: laneLevel(track.seed, track.clips, time, transport),
    ...overrides[index],
  }));

/* ---------------- default: edit a clip ---------------- */

const KEYS = 3;

const defaultStatic = (): ArrangementState => ({
  time: 8.2,
  transport: "playing",
  loop: true,
  lanes: lanesFrom(DEFAULT_TRACKS, 8.2, "playing"),
  selectedTrack: KEYS,
});

export const DEFAULT_SPEC: StageTimelineSpec<ArrangementState> = {
  length: 13,
  initial: () => ({ time: 0, transport: "stopped", loop: false, lanes: lanesFrom(DEFAULT_TRACKS, 0, "stopped"), selectedTrack: 1 }),
  static: defaultStatic,
  build: (tl, t0) => {
    const proxy = { time: 0, razor: 0, drag: 0 };
    const flags = { transport: "stopped" as Transport, loop: false, selected: 1, razor: false, split: false };
    const splitAt = bar(3);
    const stopAt = t0 + 10.5;

    tl.call(() => {
      flags.transport = "playing";
    }, [], t0)
      .to(proxy, { time: SESSION_LENGTH, duration: SESSION_LENGTH, ease: "none" }, t0)
      .call(() => {
        flags.selected = KEYS;
      }, [], t0 + 1.6)
      // Razor line sweeps to bar 3 and cuts the Rhodes clip.
      .call(() => {
        flags.razor = true;
        proxy.razor = bar(2) + 0.4;
      }, [], t0 + 2.2)
      .to(proxy, { razor: splitAt, duration: 0.7, ease: "power2.out" }, t0 + 2.2)
      .call(() => {
        flags.split = true;
        flags.razor = false;
      }, [], t0 + 3.1)
      // Drag the right half half a bar later, snapping to the grid.
      .to(proxy, { drag: 1, duration: 0.9, ease: "power2.inOut" }, t0 + 3.8)
      // Loop the section.
      .call(() => {
        flags.loop = true;
      }, [], t0 + 6.2)
      .call(() => {
        flags.transport = "stopped";
      }, [], stopAt)
      .call(() => {
        flags.loop = false;
        flags.split = false;
        flags.selected = 1;
      }, [], stopAt + 0.8)
      .to(proxy, { time: 0, drag: 0, duration: 0.8, ease: "power3.inOut" }, stopAt + 0.8);

    return () => {
      const { time } = proxy;
      const lanes = lanesFrom(DEFAULT_TRACKS, time, flags.transport);
      if (flags.split) {
        const [first, ...rest] = DEFAULT_TRACKS[KEYS].clips;
        const shift = proxy.drag * 1; // half a bar
        const cut = splitAt - first.start;
        lanes[KEYS] = {
          ...lanes[KEYS],
          clips: [
            { ...first, duration: cut },
            { ...first, start: splitAt + shift, duration: first.duration - cut, offset: cut, label: "Rhodes (2)", selected: proxy.drag > 0 },
            ...rest,
          ],
        };
      }
      return {
        time,
        transport: flags.transport,
        loop: flags.loop,
        lanes,
        selectedTrack: flags.selected,
        razorAt: flags.razor ? proxy.razor : undefined,
        dragGhost:
          proxy.drag > 0 && proxy.drag < 1 ? { lane: KEYS, start: splitAt + 1, duration: DEFAULT_TRACKS[KEYS].clips[0].duration - (splitAt - DEFAULT_TRACKS[KEYS].clips[0].start) } : undefined,
      };
    };
  },
};

/* ---------------- recording: punch in a take ---------------- */

const RECORDING_TRACKS: TrackSeed[] = DEFAULT_TRACKS.map((track, index) =>
  index === 0 ? { ...track, name: "Vocal", clips: [{ start: bar(4) + 0.6, duration: 5.2, label: "Take 2", kind: "audio", profile: "vocal", seed: 2 }] } : track,
);
const PUNCH_IN = bar(2);
const PUNCH_OUT = bar(4);
const takeClip = (end: number, recording: boolean): LaneClip => ({ start: PUNCH_IN, duration: end - PUNCH_IN, label: "Take 3", kind: "audio", profile: "vocal", seed: 11, recording });

export const RECORDING_SPEC: StageTimelineSpec<ArrangementState> = {
  length: 13,
  initial: () => ({
    time: 0,
    transport: "stopped",
    loop: false,
    lanes: lanesFrom(RECORDING_TRACKS, 0, "stopped", [{ armed: true }]),
    selectedTrack: 0,
  }),
  static: () => ({
    time: 5.4,
    transport: "recording",
    loop: false,
    lanes: lanesFrom(RECORDING_TRACKS, 5.4, "recording", [{ armed: true, clips: [takeClip(5.4, true), ...RECORDING_TRACKS[0].clips] }]),
    selectedTrack: 0,
  }),
  build: (tl, t0) => {
    const proxy = { time: 0 };
    const flags = { transport: "stopped" as Transport, done: false };
    const stopAt = t0 + 10.2;

    tl.call(() => {
      flags.transport = "recording";
    }, [], t0)
      .to(proxy, { time: SESSION_LENGTH, duration: SESSION_LENGTH, ease: "none" }, t0)
      .call(() => {
        flags.transport = "playing";
        flags.done = true;
      }, [], t0 + PUNCH_OUT)
      .call(() => {
        flags.transport = "stopped";
      }, [], stopAt)
      .call(() => {
        flags.done = false;
      }, [], stopAt + 0.9)
      .to(proxy, { time: 0, duration: 0.8, ease: "power3.inOut" }, stopAt + 0.8);

    return () => {
      const { time } = proxy;
      const recording = flags.transport === "recording" && time >= PUNCH_IN;
      const takeEnd = flags.done ? PUNCH_OUT : Math.max(PUNCH_IN, time);
      const take: LaneClip[] = recording || flags.done ? [takeClip(takeEnd, recording)] : [];
      const lanes = lanesFrom(RECORDING_TRACKS, time, flags.transport, [{ armed: true, clips: [...take, ...RECORDING_TRACKS[0].clips] }]);
      lanes[0].level = flags.transport === "stopped" ? 0 : laneLevel(1, [{ start: 0, duration: SESSION_LENGTH, label: "", kind: "audio" }], time, flags.transport);
      return {
        time,
        transport: flags.transport,
        loop: false,
        lanes,
        selectedTrack: 0,
        status: recording ? `Recording · Vocal · In 1-2` : flags.done ? "Take 3 · 4 bars" : undefined,
      };
    };
  },
};

/* ---------------- stems: BS Roformer separates a mix ---------------- */

const MIX_TRACK: TrackSeed = { name: "Full mix", color: "#ef4444", type: "audio", input: "In 1-2", hasFx: false, seed: 2, clips: [{ start: 0, duration: 12.5, label: "Full mix.wav", kind: "audio", profile: "mix", seed: 2 }] };
const STEM_GAP = 0.45;

export const STEMS_SPEC: StageTimelineSpec<ArrangementState> = {
  length: 12,
  initial: () => ({ time: 0, transport: "stopped", loop: false, lanes: lanesFrom([MIX_TRACK], 0, "stopped"), selectedTrack: 0 }),
  static: () => ({
    time: 4.2,
    transport: "playing",
    loop: false,
    lanes: lanesFrom([MIX_TRACK, ...STEM_TRACKS], 4.2, "playing", [{ muted: true, level: 0 }]),
    selectedTrack: 1,
  }),
  build: (tl, t0) => {
    const proxy = { time: 0, progress: 0, arrived: 0 };
    const flags = { transport: "stopped" as Transport, separating: false, solo: false, muteMix: false, resetting: false };
    const playAt = t0 + 3.2 + STEM_TRACKS.length * STEM_GAP;
    const stopAt = playAt + 5.2;

    tl.call(() => {
      flags.separating = true;
      flags.resetting = false;
    }, [], t0)
      .to(proxy, { progress: 100, duration: 2.6, ease: "power1.inOut" }, t0 + 0.2)
      .call(() => {
        flags.separating = false;
        flags.muteMix = true;
      }, [], t0 + 3.0)
      .to(proxy, { arrived: STEM_TRACKS.length, duration: STEM_TRACKS.length * STEM_GAP, ease: "none" }, t0 + 3.1)
      .call(() => {
        flags.transport = "playing";
      }, [], playAt)
      .to(proxy, { time: 5.6, duration: 5.6, ease: "none" }, playAt)
      .call(() => {
        flags.solo = true;
      }, [], playAt + 1.6)
      .call(() => {
        flags.solo = false;
      }, [], playAt + 3.4)
      .call(() => {
        flags.transport = "stopped";
      }, [], stopAt)
      .call(() => {
        flags.muteMix = false;
      }, [], stopAt + 0.9)
      // Rewind for the next pass; the import chip stays hidden while `arrived` unwinds.
      .call(() => {
        flags.resetting = true;
      }, [], stopAt + 0.7)
      .to(proxy, { time: 0, arrived: 0, progress: 0, duration: 0.6, ease: "power3.inOut" }, stopAt + 0.7);

    return () => {
      const { time, transport } = { time: proxy.time, transport: flags.transport };
      const arrived = Math.floor(proxy.arrived + 1e-6);
      const stems = STEM_TRACKS.map((track, index) => ({
        ...track,
        entering: index >= arrived,
      }));
      const lanes = lanesFrom([MIX_TRACK, ...stems], time, transport, [
        { muted: flags.muteMix, level: 0 },
        ...stems.map((stem, index) => ({
          entering: stem.entering,
          soloed: flags.solo && index === 0,
          // Only override the computed level when the stem is silent; an
          // explicit `level: undefined` would spread over it and mute the meter.
          ...(stem.entering || (flags.solo && index !== 0) ? { level: 0 } : {}),
        })),
      ]);
      return {
        time,
        transport,
        loop: false,
        lanes,
        selectedTrack: arrived > 0 ? 1 : 0,
        status: flags.separating
          ? `BS Roformer · separating ${Math.round(proxy.progress)} %`
          : !flags.resetting && arrived > 0 && arrived < STEM_TRACKS.length
            ? `Importing stem ${arrived} of ${STEM_TRACKS.length}`
            : undefined,
      };
    };
  },
};

export const SPECS: Record<ArrangementVariant, StageTimelineSpec<ArrangementState>> = {
  default: DEFAULT_SPEC,
  recording: RECORDING_SPEC,
  stems: STEMS_SPEC,
};

export const SPEC = DEFAULT_SPEC;

/** Every lane the variant can show, so the stage reserves a fixed height. */
export const laneCapacity = (variant: ArrangementVariant) => (variant === "stems" ? 1 + STEM_TRACKS.length : DEFAULT_TRACKS.length);
