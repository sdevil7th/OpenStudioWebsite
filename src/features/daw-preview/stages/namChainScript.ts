// The NAM Rack signal chain rail: bypass a pedal, move the delay earlier,
// lock the order, watch the gate breathe, put it back.
import type { StageTimelineSpec } from "../stage/useStageTimeline";

export type PostId = "eq" | "mod" | "delay" | "reverb";

export interface NamChainState {
  pedalOn: boolean;
  postOrder: PostId[];
  locked: boolean;
  gateOpen: boolean;
  /** Input level 0..1 for the amp caption meter. */
  input: number;
  /** Which node the cursor is "on", for the highlight. */
  focus?: string;
}

const REST_ORDER: PostId[] = ["eq", "mod", "delay", "reverb"];
const MOVED_ORDER: PostId[] = ["eq", "delay", "mod", "reverb"];

const frame = (edits: Omit<NamChainState, "input"> & { input?: number }): NamChainState => ({
  input: 0.62,
  ...edits,
});

export const SPEC: StageTimelineSpec<NamChainState> = {
  length: 11,
  initial: () => frame({ pedalOn: true, postOrder: REST_ORDER, locked: false, gateOpen: true }),
  static: () => frame({ pedalOn: true, postOrder: MOVED_ORDER, locked: true, gateOpen: true, focus: "delay" }),
  build: (tl, t0) => {
    const proxy = { input: 0.62 };
    const flags: Omit<NamChainState, "input"> = { pedalOn: true, postOrder: REST_ORDER, locked: false, gateOpen: true };

    tl.to(proxy, { input: 0.82, duration: 0.9, yoyo: true, repeat: 9, ease: "sine.inOut" }, t0)
      .call(() => {
        flags.focus = "pedal";
      }, [], t0 + 0.9)
      .call(() => {
        flags.pedalOn = false;
      }, [], t0 + 1.3)
      .call(() => {
        flags.pedalOn = true;
        flags.focus = undefined;
      }, [], t0 + 2.7)
      .call(() => {
        flags.focus = "delay";
      }, [], t0 + 3.4)
      .call(() => {
        flags.postOrder = MOVED_ORDER;
      }, [], t0 + 3.9)
      .call(() => {
        flags.focus = "lock";
      }, [], t0 + 5.0)
      .call(() => {
        flags.locked = true;
        flags.focus = undefined;
      }, [], t0 + 5.4)
      .call(() => {
        flags.gateOpen = false;
      }, [], t0 + 6.2)
      .call(() => {
        flags.gateOpen = true;
      }, [], t0 + 6.9)
      .call(() => {
        flags.gateOpen = false;
      }, [], t0 + 7.3)
      .call(() => {
        flags.gateOpen = true;
      }, [], t0 + 7.8)
      .call(() => {
        flags.focus = "reset";
      }, [], t0 + 8.6)
      .call(() => {
        flags.locked = false;
        flags.postOrder = REST_ORDER;
        flags.focus = undefined;
      }, [], t0 + 9.1);

    return () => frame({ ...flags, input: proxy.input });
  },
};
