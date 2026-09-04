import { LOOP_RANGE, SCRIPT_LENGTH, SESSION_SPEC, TRACKS } from "./sessionScript";
import { useStageTimeline, type StageTimelineOptions } from "./stage/useStageTimeline";
import type { SessionState } from "./types";

/**
 * The hero session: `SESSION_SPEC` (sessionScript.ts) run by the shared
 * stage driver, which handles GSAP loading, off-screen and hidden-tab
 * pausing, the scheduler slot, and the reduced-motion static frame.
 */
export const useSessionTimeline = (options: StageTimelineOptions): SessionState =>
  useStageTimeline(SESSION_SPEC, { priority: 1, ...options });

export { LOOP_RANGE, SCRIPT_LENGTH, TRACKS };
