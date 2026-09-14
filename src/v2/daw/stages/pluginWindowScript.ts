// A hosted built-in EQ in its own window: sweep a band, push its gain,
// narrow it, bypass, compare A/B, back to A.
import type { StageTimelineSpec } from "../stage/useStageTimeline";

export interface EqBandState {
  enabled: boolean;
  /** eqResponseCurve FilterType: 0 low shelf, 1 peak, 2 high shelf, 3 LP, 4 HP, 5 notch */
  type: number;
  freq: number;
  gainDB: number;
  q: number;
}

export interface PluginWindowState {
  bands: EqBandState[];
  bypass: boolean;
  slot: "A" | "B";
  preset: string;
  /** Band index the cursor is on. */
  focusBand?: number;
  focus?: "bypass" | "ab" | "preset";
}

const A: EqBandState[] = [
  { enabled: true, type: 4, freq: 90, gainDB: 0, q: 0.7 },
  { enabled: true, type: 1, freq: 240, gainDB: -2.5, q: 1.2 },
  { enabled: true, type: 1, freq: 400, gainDB: 0, q: 1.0 },
  { enabled: true, type: 1, freq: 3200, gainDB: 1.5, q: 1.4 },
  { enabled: true, type: 2, freq: 9000, gainDB: 2.2, q: 0.7 },
  { enabled: false, type: 1, freq: 800, gainDB: 0, q: 1 },
  { enabled: false, type: 1, freq: 1600, gainDB: 0, q: 1 },
  { enabled: false, type: 3, freq: 16000, gainDB: 0, q: 0.7 },
];

const B: EqBandState[] = [
  { enabled: true, type: 4, freq: 120, gainDB: 0, q: 0.7 },
  { enabled: true, type: 1, freq: 300, gainDB: -4, q: 1.6 },
  { enabled: true, type: 1, freq: 1800, gainDB: 2.8, q: 1.8 },
  { enabled: true, type: 1, freq: 5000, gainDB: -1.5, q: 2.2 },
  { enabled: true, type: 2, freq: 12000, gainDB: 3.5, q: 0.7 },
  { enabled: false, type: 1, freq: 800, gainDB: 0, q: 1 },
  { enabled: false, type: 1, freq: 1600, gainDB: 0, q: 1 },
  { enabled: false, type: 3, freq: 16000, gainDB: 0, q: 0.7 },
];

const SWEEP = 2;

export const SPEC: StageTimelineSpec<PluginWindowState> = {
  length: 12,
  initial: () => ({ bands: A, bypass: false, slot: "A", preset: "Vocal air" }),
  static: () => ({
    bands: A.map((band, index) => (index === SWEEP ? { ...band, freq: 1200, gainDB: 4, q: 2.4 } : band)),
    bypass: false,
    slot: "A",
    preset: "Vocal air",
    focusBand: SWEEP,
  }),
  build: (tl, t0) => {
    const proxy = { freq: A[SWEEP].freq, gain: A[SWEEP].gainDB, q: A[SWEEP].q };
    const flags: Omit<PluginWindowState, "bands"> = { bypass: false, slot: "A", preset: "Vocal air" };
    const stopAt = t0 + 10.2;

    tl.call(() => {
      flags.focusBand = SWEEP;
    }, [], t0 + 0.4)
      .to(proxy, { freq: 1200, duration: 1.6, ease: "power2.inOut" }, t0 + 0.6)
      .to(proxy, { gain: 4, duration: 1.1 }, t0 + 2.4)
      .to(proxy, { q: 2.4, duration: 0.8 }, t0 + 3.7)
      .call(() => {
        flags.focusBand = undefined;
        flags.focus = "bypass";
      }, [], t0 + 4.9)
      .call(() => {
        flags.bypass = true;
      }, [], t0 + 5.2)
      .call(() => {
        flags.bypass = false;
        flags.focus = undefined;
      }, [], t0 + 6.3)
      .call(() => {
        flags.focus = "ab";
      }, [], t0 + 7.0)
      .call(() => {
        flags.slot = "B";
        flags.preset = "Vocal air (B)";
      }, [], t0 + 7.3)
      .call(() => {
        flags.slot = "A";
        flags.preset = "Vocal air";
        flags.focus = undefined;
      }, [], t0 + 8.8)
      .to(proxy, { freq: A[SWEEP].freq, gain: A[SWEEP].gainDB, q: A[SWEEP].q, duration: 0.9, ease: "power3.inOut" }, stopAt);

    return () => {
      const base = flags.slot === "B" ? B : A;
      return {
        ...flags,
        bands: base.map((band, index) =>
          index === SWEEP && flags.slot === "A" ? { ...band, freq: proxy.freq, gainDB: proxy.gain, q: proxy.q } : band,
        ),
      };
    };
  },
};
