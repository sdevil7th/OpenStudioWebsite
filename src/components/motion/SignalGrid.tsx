import { type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { AccentTone } from "@/data/marketing";
import { cn } from "@/lib/utils";

interface SignalGridProps {
  className?: string;
  accent?: AccentTone;
  density?: number;
  speed?: number;
  reducedMotionMode?: "static" | "hidden";
}

const accentGlow: Record<AccentTone, string> = {
  lavender: "from-primary/20 via-primary/10 to-transparent",
  emerald: "from-secondary/20 via-secondary/10 to-transparent",
  amber: "from-accent/20 via-accent/10 to-transparent",
  frost: "from-white/16 via-sky-200/10 to-transparent",
};

const SignalGrid = ({
  className,
  accent = "lavender",
  density = 1,
  speed = 1,
  reducedMotionMode = "static",
}: SignalGridProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion && reducedMotionMode === "hidden") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn("signal-grid pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ "--signal-grid-duration": `${6 / speed}s` } as CSSProperties}
    >
      <div className="absolute inset-0 grid-overlay opacity-[0.08]" style={{ backgroundSize: `${56 / density}px ${56 / density}px` }} />
      <div className="absolute inset-0 surface-dot-grid opacity-[0.08]" />
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", accentGlow[accent])} />
    </div>
  );
};

export default SignalGrid;
