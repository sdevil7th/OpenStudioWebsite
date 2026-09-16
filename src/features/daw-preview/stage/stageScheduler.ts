/**
 * Caps how many live stages animate at once. A features grid can have four
 * stages in view; letting them all tween and commit at 30 fps is wasteful, so
 * only the highest-priority visible stages (then most visible) run and the rest
 * hold their last frame.
 */
export interface StageEntry {
  /** Visible fraction reported by the stage's IntersectionObserver. */
  ratio: number;
  /** Heroes/carousels pass 1 to rank ahead of other visible stages. */
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
  // A subpixel container clip can report 0.9986 for an otherwise fully visible
  // phone tile. Treat the top 1% as fully visible so later rows cannot starve it.
  const visibleRatio = ratio >= 0.99 ? 1 : ratio;
  if (entry.ratio === visibleRatio) return;
  entry.ratio = visibleRatio;
  rebalance();
};

export const isStageAllowed = (entry: StageEntry) => allowed.has(entry);

if (import.meta.env.DEV && typeof window !== "undefined") {
  // Inspectable from the console while developing stages.
  (window as unknown as { __spStages?: unknown }).__spStages = { entries, allowed };
}
