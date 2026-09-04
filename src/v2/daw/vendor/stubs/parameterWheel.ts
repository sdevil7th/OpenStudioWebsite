// Minimal stand-in for OpenStudio frontend/src/utils/parameterWheel.ts
// (@ d2056151222fefcede123ef614ec38c6893cbfd5). Upstream resolves the wheel
// gesture through the user's mouse-behaviour profile in the Zustand store; the
// website has no store, so every wheel is a plain "adjust" gesture. Shift/Ctrl/
// Meta still selects fine precision, matching the upstream default profile.
// `getParameterWheelStepCount` is copied verbatim.

export interface ResolvedWheelGesture {
  operation: "adjust" | "ignore";
  amount: number;
  precision: "normal" | "fine";
  preventDefault: boolean;
  stopPropagation: boolean;
}

export interface ParameterWheelStepCountOptions {
  normal?: number;
  fine?: number;
}

export function resolveProfiledParameterWheel(
  event: WheelEvent,
  _subtarget: "control" | "console_fader" | "graph" = "control",
): ResolvedWheelGesture {
  const amount = event.deltaMode === 1 ? event.deltaY * 100 : event.deltaY;
  return {
    operation: Number.isFinite(amount) && amount !== 0 ? "adjust" : "ignore",
    amount,
    precision: event.shiftKey || event.ctrlKey || event.metaKey ? "fine" : "normal",
    preventDefault: true,
    stopPropagation: true,
  };
}

export function getParameterWheelStepCount(
  gesture: Pick<ResolvedWheelGesture, "amount" | "precision" | "operation">,
  options: ParameterWheelStepCountOptions = {},
): number {
  if (
    gesture.operation !== "adjust"
    || !Number.isFinite(gesture.amount)
    || gesture.amount === 0
  ) return 0;

  const configuredStepCount = gesture.precision === "fine"
    ? options.fine ?? 1
    : options.normal ?? 4;
  if (!Number.isFinite(configuredStepCount) || configuredStepCount <= 0) return 0;

  const wheelSteps = Math.abs(gesture.amount) / 100;
  return (gesture.amount < 0 ? 1 : -1) * configuredStepCount * wheelSteps;
}
