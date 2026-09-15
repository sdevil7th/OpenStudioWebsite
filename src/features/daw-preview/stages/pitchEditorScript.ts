// A vocal phrase in the graphical pitch editor: playback, a flat note
// dragged onto the scale, the correct-pitch macro flattening drift while
// vibrato stays, then a second pass.
import { noise } from "../sessionScript";
import type { StageTimelineSpec } from "../stage/useStageTimeline";
import type { Transport } from "../types";

export interface PitchBlob {
  id: string;
  /** Semitones above the lowest visible row (0 = bottom). */
  row: number;
  /** Beats. */
  start: number;
  length: number;
  /** Cents off the row's centre; the blob draws offset by this. */
  cents: number;
  /** Drift amount 0..1 that the contour wobble is scaled by. */
  drift: number;
  vibrato: number;
}

export interface PitchEditorState {
  beat: number;
  transport: Transport;
  blobs: PitchBlob[];
  selected?: string;
  /** 0..1: how far the correct-pitch macro has been applied. */
  correction: number;
  tool: "pitch" | "drift" | "vibrato";
  status?: string;
  keyLabel: string;
}

export const BEATS = 8;
export const ROWS = 12;
/** Row 0 is G3 (MIDI 55); the phrase sits in a tenor range. */
export const LOW_NOTE = 55;

const PHRASE: PitchBlob[] = [
  { id: "n1", row: 2, start: 0.2, length: 1.1, cents: 4, drift: 0.6, vibrato: 0.2 },
  { id: "n2", row: 4, start: 1.4, length: 0.8, cents: -6, drift: 0.5, vibrato: 0.2 },
  { id: "n3", row: 5, start: 2.3, length: 1.6, cents: -38, drift: 0.9, vibrato: 0.5 },
  { id: "n4", row: 7, start: 4.1, length: 0.7, cents: 9, drift: 0.7, vibrato: 0.1 },
  { id: "n5", row: 9, start: 4.9, length: 1.9, cents: 12, drift: 0.8, vibrato: 0.9 },
  { id: "n6", row: 7, start: 7.0, length: 0.9, cents: -5, drift: 0.4, vibrato: 0.3 },
];

/** Contour offset in cents for a blob at a local time (beats into the note). */
export const contourCents = (blob: PitchBlob, local: number, correction: number) => {
  const driftAmount = blob.drift * (1 - correction);
  const wobble = (noise(local * 2.2 + blob.row, 3, blob.row) - 0.5) * 60 * driftAmount;
  const scoop = local < 0.25 ? -40 * (0.25 - local) * 4 * driftAmount : 0;
  const vib = Math.sin(local * 2 * Math.PI * 5.5) * 14 * blob.vibrato * Math.min(1, local * 2);
  return blob.cents + wobble + scoop + vib;
};

const frame = (beat: number, transport: Transport, edits: { snap: number; correction: number; selected?: string; tool: PitchEditorState["tool"]; status?: string }): PitchEditorState => ({
  beat,
  transport,
  correction: edits.correction,
  selected: edits.selected,
  tool: edits.tool,
  status: edits.status,
  keyLabel: "C major",
  blobs: PHRASE.map((blob) =>
    blob.id === "n3"
      ? { ...blob, cents: blob.cents + (0 - blob.cents) * edits.snap }
      : { ...blob, cents: blob.cents * (1 - edits.correction * 0.85) },
  ),
});

export const SPEC: StageTimelineSpec<PitchEditorState> = {
  length: 14,
  initial: () => frame(0, "stopped", { snap: 0, correction: 0, tool: "pitch" }),
  static: () => frame(5.2, "playing", { snap: 1, correction: 1, tool: "pitch", selected: "n5", status: "Correct pitch · 85 %" }),
  build: (tl, t0) => {
    const proxy = { beat: 0, snapTo: 0, correction: 0 };
    const flags = { transport: "stopped" as Transport, selected: undefined as string | undefined, tool: "pitch" as PitchEditorState["tool"], status: undefined as string | undefined };
    const stopAt = t0 + 11.6;

    tl.call(() => {
      flags.transport = "playing";
    }, [], t0)
      .to(proxy, { beat: BEATS, duration: 4, ease: "none" }, t0)
      .call(() => {
        flags.transport = "stopped";
        flags.selected = "n3";
      }, [], t0 + 4.2)
      // Drag the flat note up onto the scale.
      .to(proxy, { snapTo: 1, duration: 0.9, ease: "power2.inOut" }, t0 + 4.8)
      .call(() => {
        flags.selected = undefined;
        flags.tool = "drift";
        flags.status = "Correct pitch · 85 %";
      }, [], t0 + 6.0)
      .to(proxy, { correction: 1, duration: 1.2, ease: "power2.out" }, t0 + 6.4)
      .call(() => {
        flags.tool = "pitch";
        flags.status = undefined;
        flags.transport = "playing";
      }, [], t0 + 8.0)
      .to(proxy, { beat: 0, duration: 0.01 }, t0 + 8.0)
      .to(proxy, { beat: BEATS, duration: 3.4, ease: "none" }, t0 + 8.05)
      .call(() => {
        flags.transport = "stopped";
      }, [], stopAt)
      .to(proxy, { beat: 0, snapTo: 0, correction: 0, duration: 0.9, ease: "power3.inOut" }, stopAt + 0.7);

    return () => frame(proxy.beat, flags.transport, { snap: proxy.snapTo, correction: proxy.correction, ...flags });
  },
};
