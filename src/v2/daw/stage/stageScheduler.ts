/**
 * Caps how many live stages animate at once. A features grid can have four
 * stages in view; letting them all tween and commit at 30 fps is wasteful, so
 * only the most visible (then highest priority) `MAX_PLAYING` run and the rest
 * hold their last frame.
 */
export interface StageEntry {
  /** Visible fraction reported by the stage's IntersectionObserver. */
  ratio: number;
  /** Ties on ratio go to the higher priority (hero/carousel pass 1). */
  priority: number;
  /** Called whenever the stage's allowance changes. */
  onAllowed: (allowed: boolean) => void;
}

const MAX_PLAYING = 2;
const entries = new Set<StageEntry>();
const allowed = new Set<StageEntry>();

const rebalance = () => {
  const ranked = [...entries]
    .filter((entry) => entry.ratio > 0)
    .sort((left, right) => right.priority - left.priority || right.ratio - left.ratio)
    .slice(0, MAX_PLAYING);
  const next = new Set(ranked);

  for (const entry of entries) {
    const was = allowed.has(entry);
    const is = next.has(entry);
    if (was !== is) {
      if (is) allowed.add(entry);
      else allowed.delete(entry);
      entry.onAllowed(is);
    }
  }
};

export const registerStage = (entry: StageEntry) => {
  entries.add(entry);
  rebalance();
  return () => {
    entries.delete(entry);
    allowed.delete(entry);
    rebalance();
  };
};

export const updateStageRatio = (entry: StageEntry, ratio: number) => {
  if (entry.ratio === ratio) return;
  entry.ratio = ratio;
  rebalance();
};

export const isStageAllowed = (entry: StageEntry) => allowed.has(entry);

if (import.meta.env.DEV && typeof window !== "undefined") {
  // Inspectable from the console while developing stages.
  (window as unknown as { __spStages?: unknown }).__spStages = { entries, allowed };
}
