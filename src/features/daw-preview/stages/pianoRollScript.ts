// A two-bar Rhodes pattern in the piano roll: playback, a nudge, quantize,
// velocity edits, loop. All positions are in beats (120 bpm, 4/4).
import type { StageTimelineSpec } from "../stage/useStageTimeline";
import type { Transport } from "../types";

export interface RollNote {
  id: string;
  /** Semitones above the lowest visible row (0 = bottom row). */
  row: number;
  start: number;
  length: number;
  velocity: number;
}

export interface PianoRollState {
  /** Playhead in beats. */
  beat: number;
  transport: Transport;
  loop: boolean;
  notes: RollNote[];
  selected: string[];
  tool: "draw" | "select" | "erase";
  status?: string;
}

export const BEATS = 8;
export const ROWS = 14;
/** Row 0 is C3; rows climb chromatically. */
export const LOW_NOTE = 48;

const NOTES: RollNote[] = [
  { id: "c1", row: 0, start: 0, length: 1.5, velocity: 92 },
  { id: "e1", row: 4, start: 0, length: 1.5, velocity: 78 },
  { id: "g1", row: 7, start: 0, length: 1.5, velocity: 84 },
  { id: "b1", row: 11, start: 1.5, length: 0.5, velocity: 60 },
  { id: "a1", row: 9, start: 2, length: 2, velocity: 70 },
  { id: "f1", row: 5, start: 2, length: 2, velocity: 74 },
  { id: "c2", row: 12, start: 2.5, length: 0.5, velocity: 52 },
  { id: "d2", row: 2, start: 4, length: 1, velocity: 88 },
  { id: "f2", row: 5, start: 4, length: 1, velocity: 80 },
  { id: "a2", row: 9, start: 4, length: 1, velocity: 76 },
  { id: "g2", row: 7, start: 5.42, length: 0.5, velocity: 58 },
  { id: "e2", row: 4, start: 6.08, length: 1.75, velocity: 86 },
  { id: "g3", row: 7, start: 6.13, length: 1.75, velocity: 82 },
  { id: "c3", row: 12, start: 6, length: 2, velocity: 90 },
];

const quantized = (start: number) => Math.round(start * 4) / 4;

const frame = (beat: number, transport: Transport, edits: { quantize: number; nudge: number; velocity: number; loop: boolean; selected: string[]; tool: PianoRollState["tool"]; status?: string }): PianoRollState => ({
  beat,
  transport,
  loop: edits.loop,
  tool: edits.tool,
  selected: edits.selected,
  status: edits.status,
  notes: NOTES.map((note) => {
    let start = note.start;
    if (note.id === "g2") start = note.start + (5.5 - note.start) * edits.nudge;
    if (note.id === "e2" || note.id === "g3") start = note.start + (quantized(note.start) - note.start) * edits.quantize;
    const velocity =
      note.id === "b1" || note.id === "c2" ? Math.round(note.velocity + (note.velocity + 34 - note.velocity) * edits.velocity) : note.velocity;
    return { ...note, start, velocity };
  }),
});

export const SPEC: StageTimelineSpec<PianoRollState> = {
  length: 13,
  initial: () => frame(0, "stopped", { quantize: 0, nudge: 0, velocity: 0, loop: false, selected: [], tool: "select" }),
  static: () => frame(5.3, "playing", { quantize: 1, nudge: 1, velocity: 1, loop: true, selected: ["e2", "g3"], tool: "select", status: "Quantized 2 notes · 1/16" }),
  build: (tl, t0) => {
    const proxy = { beat: 0, quantize: 0, nudge: 0, velocity: 0 };
    const flags = { transport: "stopped" as Transport, loop: false, selected: [] as string[], tool: "select" as PianoRollState["tool"], status: undefined as string | undefined };
    const stopAt = t0 + 10.6;

    tl.call(() => {
      flags.transport = "playing";
    }, [], t0)
      .to(proxy, { beat: BEATS, duration: 4, ease: "none" }, t0)
      .call(() => {
        flags.selected = ["g2"];
      }, [], t0 + 4.2)
      .to(proxy, { nudge: 1, duration: 0.7 }, t0 + 4.5)
      .call(() => {
        flags.selected = ["e2", "g3"];
      }, [], t0 + 5.5)
      .call(() => {
        flags.status = "Quantize · 1/16 · 100 %";
      }, [], t0 + 6.0)
      .to(proxy, { quantize: 1, duration: 0.45, ease: "power3.out" }, t0 + 6.3)
      .call(() => {
        flags.status = undefined;
        flags.selected = ["b1", "c2"];
      }, [], t0 + 7.4)
      .to(proxy, { velocity: 1, duration: 0.8 }, t0 + 7.7)
      .call(() => {
        flags.loop = true;
        flags.selected = [];
      }, [], t0 + 8.8)
      .to(proxy, { beat: BEATS, duration: 1.8, ease: "none" }, t0 + 8.8)
      .call(() => {
        flags.transport = "stopped";
      }, [], stopAt)
      .call(() => {
        flags.loop = false;
      }, [], stopAt + 0.8)
      .to(proxy, { beat: 0, quantize: 0, nudge: 0, velocity: 0, duration: 0.8, ease: "power3.inOut" }, stopAt + 0.8);

    return () => frame(proxy.beat, flags.transport, { quantize: proxy.quantize, nudge: proxy.nudge, velocity: proxy.velocity, ...flags });
  },
};
