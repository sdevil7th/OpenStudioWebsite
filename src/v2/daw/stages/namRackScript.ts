// Choreography for the photoreal NAM Rack. The hero "tour" walks through the
// sections; a section variant stays put and only breathes (meters, a knob,
// an LED), or shows a static frame in a tile too small to animate.
import { noise } from "../sessionScript";
import type { StageTimelineSpec } from "../stage/useStageTimeline";
import type { RackSectionId } from "../vendor/NAMSignalChainTypes";
import { TUNER_REST } from "./namRackProps";

export type NamRackSection = "pre" | "amp" | "cab" | "eq" | "post";

export interface NamRackVariant {
  section: NamRackSection;
  tunerOpen?: boolean;
  /** Walk through every section (the NAM page hero). */
  tour?: boolean;
}

export interface NamRackState {
  section: RackSectionId;
  tunerOpen: boolean;
  values: Record<string, number>;
  inputLevelDb: number;
  outputLevelDb: number;
  tuner: typeof TUNER_REST;
  compareSlot: "A" | "B";
}

export const parseVariant = (variant: string | undefined): NamRackVariant => {
  const [section = "amp", ...flags] = (variant ?? "amp").split("+");
  const valid: NamRackSection = ["pre", "amp", "cab", "eq", "post"].includes(section) ? (section as NamRackSection) : "amp";
  return { section: valid, tunerOpen: flags.includes("tuner"), tour: flags.includes("tour") };
};

const level = (time: number, seed: number, base: number, swing: number) => base + swing * (noise(time, 5, seed) - 0.5) * 2;

const tunerAt = (cents: number, signal: boolean) => ({
  ...TUNER_REST,
  signalPresent: signal,
  pitchLocked: signal && Math.abs(cents) < 3,
  noteLabel: signal ? "E2" : "—",
  statusLabel: !signal ? "Listening" : Math.abs(cents) < 3 ? "In tune" : cents < 0 ? "Flat" : "Sharp",
  // 0..100 with 50 in tune; cents span ±50.
  centsPct: 50 + cents,
  frequencyLabel: signal ? `${(82.41 * Math.pow(2, cents / 1200)).toFixed(2)} Hz` : "— Hz",
  inputLevelLabel: signal ? "−14.2 dB" : "−∞ dB",
  confidenceLabel: signal ? "96 %" : "0 %",
});

const frame = (
  time: number,
  section: RackSectionId,
  tunerOpen: boolean,
  values: Record<string, number>,
  tunerCents: number,
  compareSlot: "A" | "B" = "A",
): NamRackState => ({
  section,
  tunerOpen,
  values,
  inputLevelDb: level(time, 11, -16, 6),
  outputLevelDb: level(time, 12, -9, 5),
  tuner: tunerAt(tunerCents, tunerOpen),
  compareSlot,
});

const TOUR_LENGTH = 19;

const tourSpec: StageTimelineSpec<NamRackState> = {
  length: TOUR_LENGTH,
  initial: () => frame(0, "amp", false, {}, 0),
  static: () => frame(6.2, "amp", false, { ampGainDb: 4.5, precisionDriveDrive: 0.62 }, 0),
  build: (tl, t0) => {
    const proxy = { time: 0, ampGain: 0, drive: 0.35, roomAmount: 0.22, eq4k: 2, reverbMix: 0.28, cents: -18 };
    const flags = { section: "amp" as RackSectionId, tunerOpen: false, compareSlot: "A" as const };
    const go = (section: RackSectionId, at: number) => tl.call(() => {
      flags.section = section;
      flags.tunerOpen = false;
    }, [], at);

    tl.to(proxy, { time: TOUR_LENGTH, duration: TOUR_LENGTH, ease: "none" }, 0)
      // Amp: dial the gain in.
      .to(proxy, { ampGain: 4.5, duration: 1.8 }, t0 + 0.4);
    go("pre", t0 + 3.2);
    tl.to(proxy, { drive: 0.62, duration: 1.4 }, t0 + 3.9);
    go("cab", t0 + 6.2);
    tl.to(proxy, { roomAmount: 0.48, duration: 1.3 }, t0 + 6.9);
    go("eq", t0 + 9.0);
    tl.to(proxy, { eq4k: 4.5, duration: 1.1 }, t0 + 9.7);
    go("post", t0 + 11.6);
    tl.to(proxy, { reverbMix: 0.44, duration: 1.2 }, t0 + 12.3);
    tl.call(() => {
      flags.section = "amp";
      flags.tunerOpen = true;
    }, [], t0 + 14.4)
      .to(proxy, { cents: 0, duration: 1.6, ease: "power3.out" }, t0 + 14.9);
    go("amp", t0 + 17.4);
    tl.to(proxy, { ampGain: 0, drive: 0.35, roomAmount: 0.22, eq4k: 2, reverbMix: 0.28, cents: -18, duration: 0.8, ease: "power3.inOut" }, t0 + 17.6);

    return () =>
      frame(
        proxy.time,
        flags.section,
        flags.tunerOpen,
        { ampGainDb: proxy.ampGain, precisionDriveDrive: proxy.drive, cabRoomAmount: proxy.roomAmount, eq4kDb: proxy.eq4k, reverbMix: proxy.reverbMix },
        proxy.cents,
        flags.compareSlot,
      );
  },
};

/** One section, one small gesture, looping. */
const sectionSpec = (section: NamRackSection, tunerOpen: boolean): StageTimelineSpec<NamRackState> => {
  const key = { pre: "precisionDriveDrive", amp: "ampGainDb", cab: "cabRoomAmount", eq: "eq4kDb", post: "reverbMix" }[section];
  const [from, to] = { pre: [0.35, 0.62], amp: [0, 4.5], cab: [0.22, 0.48], eq: [2, 4.5], post: [0.28, 0.44] }[section];
  return {
    length: 8,
    initial: () => frame(0, section, tunerOpen, { [key]: from }, tunerOpen ? -18 : 0),
    static: () => frame(3, section, tunerOpen, { [key]: to }, 0),
    build: (tl, t0) => {
      const proxy = { time: 0, value: from, cents: -18 };
      tl.to(proxy, { time: 8, duration: 8, ease: "none" }, 0)
        .to(proxy, { value: to, duration: 1.6 }, t0 + 0.6)
        .to(proxy, { cents: 0, duration: 1.8, ease: "power3.out" }, t0 + 0.6)
        .to(proxy, { value: from, cents: -18, duration: 1.2, ease: "power3.inOut" }, t0 + 5.4);
      return () => frame(proxy.time, section, tunerOpen, { [key]: proxy.value }, proxy.cents);
    },
  };
};

const cache = new Map<string, StageTimelineSpec<NamRackState>>();

/** Specs are cached so a stage gets a stable identity per variant. */
export const specFor = (variant: NamRackVariant): StageTimelineSpec<NamRackState> => {
  const id = variant.tour ? "tour" : `${variant.section}${variant.tunerOpen ? "+tuner" : ""}`;
  let spec = cache.get(id);
  if (!spec) {
    spec = variant.tour ? tourSpec : sectionSpec(variant.section, Boolean(variant.tunerOpen));
    cache.set(id, spec);
  }
  return spec;
};

export const SPEC = tourSpec;
