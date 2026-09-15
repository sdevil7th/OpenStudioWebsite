// Deterministic clip artwork for the arrangement stages: the row metrics the
// app uses to place a clip in its lane, stereo waveform peaks that read as a
// vocal / drum / bass / guitar take, and MIDI note thumbnails. Everything is a
// pure function of (seed, pixel) so a recording clip can grow frame by frame
// without its earlier pixels changing.
import { fract, noise } from "./sessionScript";

export type AudioProfile = "vocal" | "drums" | "bass" | "guitar" | "keys" | "mix" | "fx" | "other";
export type MidiProfile = "keys" | "drums" | "lead" | "pad";

/* ------------------------------------------------------------------------- */
/* Row metrics — OpenStudio store/useDAWStore getTimelineRowMetrics().        */
/* ------------------------------------------------------------------------- */

const clipBodyHeight = (kind: "audio" | "midi", trackHeight: number) => Math.max(kind === "midi" ? 56 : 32, trackHeight - 10);

export const rowMetrics = (kind: "audio" | "midi", trackHeight: number) => {
  const clipHeight = Math.min(trackHeight - 2, clipBodyHeight(kind, trackHeight));
  const clipInsetY = Math.max(2, Math.floor((trackHeight - clipHeight) / 2));
  return { clipHeight, clipInsetY };
};

/* ------------------------------------------------------------------------- */
/* Audio peaks.                                                              */
/* ------------------------------------------------------------------------- */

const hash = (value: number) => fract(Math.sin(value * 12.9898 + 78.233) * 43758.5453);

/** Envelope in 0..1 for `profile` at `t` seconds into a clip lasting `duration`. */
const envelope = (profile: AudioProfile, t: number, duration: number, seed: number, tempo: number) => {
  const beat = t * (tempo / 60);
  const phase = fract(beat);
  const beatIndex = Math.floor(beat) % 4;
  switch (profile) {
    case "vocal": {
      // Phrases with breaths in between: a slow gate shaped by a faster contour.
      const gate = Math.pow(Math.max(0, noise(t, 0.85, seed) * 1.45 - 0.35), 1.3);
      const contour = 0.45 + 0.55 * noise(t, 4.5, seed + 1);
      return Math.min(1, gate * contour * 1.25);
    }
    case "drums": {
      const kick = beatIndex === 0 || beatIndex === 2 ? Math.pow(1 - phase, 7) : 0.35 * Math.pow(1 - phase, 7);
      const snare = beatIndex === 1 || beatIndex === 3 ? Math.pow(1 - phase, 5) : 0;
      const hat = 0.18 * Math.pow(1 - fract(beat * 2), 4);
      return Math.min(1, 0.06 + kick * 0.95 + snare * 0.85 + hat);
    }
    case "bass": {
      const note = fract(beat / 2) < 0.82 ? 1 : 0.25;
      return Math.min(1, note * (0.42 + 0.3 * noise(t, 2.2, seed) + 0.18 * Math.pow(1 - fract(beat / 2), 3)));
    }
    case "guitar":
      return Math.min(1, 0.4 + 0.32 * noise(t, 5, seed) + 0.2 * Math.pow(1 - fract(beat * 2), 3));
    case "keys":
      return Math.min(1, 0.28 + 0.3 * noise(t, 1.6, seed) + 0.25 * Math.pow(1 - phase, 3));
    case "fx":
      return Math.min(1, 0.12 + 0.88 * Math.pow(t / Math.max(0.1, duration), 2.2));
    case "other":
      return Math.min(1, 0.22 + 0.35 * noise(t, 3, seed));
    default:
      return Math.min(1, 0.55 + 0.32 * noise(t, 3.5, seed) + 0.12 * Math.pow(1 - phase, 4));
  }
};

export interface PeakColumn {
  /** Per channel, -1..1. */
  max: [number, number];
  min: [number, number];
}

/**
 * One column of stereo peaks per pixel. `pixelsPerSecond` maps pixel → time so
 * the beat-shaped profiles line up with the ruler; `offset` is the seconds of
 * clip before the first pixel (a split clip's right half keeps its texture).
 */
export const audioPeaks = (
  profile: AudioProfile,
  seed: number,
  widthPx: number,
  pixelsPerSecond: number,
  duration: number,
  tempo: number,
  offset = 0,
): PeakColumn[] => {
  const columns: PeakColumn[] = [];
  const width = Math.max(0, Math.floor(widthPx));
  for (let i = 0; i < width; i += 1) {
    const t = offset + i / pixelsPerSecond;
    const env = envelope(profile, t, duration, seed, tempo);
    const grain = hash(i * 3.1 + seed * 91);
    const grainR = hash(i * 7.7 + seed * 53);
    const l = env * (0.62 + 0.38 * grain);
    const r = env * (0.62 + 0.38 * grainR) * 0.94;
    columns.push({
      max: [Math.min(1, l * 1.05), Math.min(1, r * 1.05)],
      min: [-Math.min(1, l * (0.8 + 0.25 * hash(i * 5.3 + seed))), -Math.min(1, r * (0.8 + 0.25 * hash(i * 9.1 + seed)))],
    });
  }
  return columns;
};

/**
 * SVG polygon points for one channel, drawn the way Timeline.tsx builds its
 * Konva Line: max values left→right, then min values right→left, closed.
 */
export const waveformPolygon = (peaks: PeakColumn[], channel: 0 | 1, centerY: number, halfHeight: number, gain = 1) => {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i < peaks.length; i += 1) {
    const column = peaks[i];
    const max = Math.max(-1, Math.min(1, column.max[channel] * gain));
    const min = Math.max(-1, Math.min(1, column.min[channel] * gain));
    top.push(`${i},${(centerY - max * halfHeight).toFixed(1)}`);
    bottom.push(`${i},${(centerY - min * halfHeight).toFixed(1)}`);
  }
  bottom.reverse();
  return `${top.join(" ")} ${bottom.join(" ")}`;
};

/* ------------------------------------------------------------------------- */
/* MIDI thumbnails.                                                          */
/* ------------------------------------------------------------------------- */

export interface MidiNote {
  /** Seconds from clip start. */
  start: number;
  duration: number;
  note: number;
}

const SCALE = [0, 2, 4, 7, 9, 12, 14, 16];

/** A deterministic note pattern that reads as the named part, `duration` seconds long. */
export const midiNotes = (profile: MidiProfile, seed: number, duration: number, tempo: number): MidiNote[] => {
  const beat = 60 / tempo;
  const notes: MidiNote[] = [];
  const bars = Math.ceil(duration / (beat * 4)) + 1;
  for (let bar = 0; bar < bars; bar += 1) {
    const barStart = bar * beat * 4;
    if (barStart >= duration) break;
    const root = 48 + SCALE[Math.floor(hash(seed + bar * 3.7) * 4)];
    switch (profile) {
      case "drums":
        for (let step = 0; step < 8; step += 1) {
          const t = barStart + step * beat * 0.5;
          if (t >= duration) break;
          notes.push({ start: t, duration: beat * 0.22, note: 42 });
          if (step === 0 || step === 4 || (step === 6 && hash(seed + bar) > 0.5)) notes.push({ start: t, duration: beat * 0.3, note: 36 });
          if (step === 2 || step === 6) notes.push({ start: t, duration: beat * 0.3, note: 38 });
        }
        break;
      case "pad":
        [0, 4, 7].forEach((interval) => notes.push({ start: barStart, duration: beat * 3.9, note: root + interval }));
        break;
      case "lead":
        for (let step = 0; step < 8; step += 1) {
          const t = barStart + step * beat * 0.5;
          if (t >= duration) break;
          if (hash(seed * 1.3 + bar * 8 + step) < 0.3) continue;
          const degree = Math.floor(hash(seed + bar * 11 + step * 2.1) * SCALE.length);
          notes.push({ start: t, duration: beat * (hash(seed + step) > 0.6 ? 0.95 : 0.45), note: 60 + SCALE[degree] });
        }
        break;
      default:
        // Keys: a chord on 1 and 3, a moving top line on the 8ths.
        [0, 2].forEach((b) => {
          const t = barStart + b * beat;
          if (t >= duration) return;
          [0, 4, 7].forEach((interval) => notes.push({ start: t, duration: beat * 1.8, note: root + interval }));
        });
        for (let step = 0; step < 8; step += 1) {
          const t = barStart + step * beat * 0.5;
          if (t >= duration) break;
          if (hash(seed * 2.1 + bar * 5 + step) < 0.45) continue;
          notes.push({ start: t, duration: beat * 0.45, note: root + 12 + SCALE[Math.floor(hash(seed + bar + step * 3.3) * 5)] });
        }
    }
  }
  return notes.filter((note) => note.start < duration).map((note) => ({ ...note, duration: Math.min(note.duration, duration - note.start) }));
};
