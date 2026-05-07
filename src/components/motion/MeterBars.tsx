import { type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { AccentTone } from "@/data/marketing";
import { cn } from "@/lib/utils";

interface MeterBarsProps {
  className?: string;
  accent?: AccentTone;
  bars?: number;
  density?: number;
  speed?: number;
  reducedMotionMode?: "static" | "hidden";
}

const accentClass: Record<AccentTone, string> = {
  lavender: "from-primary/15 via-primary/80 to-white/80",
  emerald: "from-secondary/15 via-secondary/80 to-white/80",
  amber: "from-accent/15 via-accent/80 to-white/80",
  frost: "from-white/15 via-sky-200/75 to-white/80",
};

const baseHeights = [38, 58, 74, 46, 66, 94, 52, 82, 63, 42];

const MeterBars = ({
  className,
  accent = "emerald",
  bars = 10,
  density = 1,
  speed = 1,
  reducedMotionMode = "static",
}: MeterBarsProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion && reducedMotionMode === "hidden") {
    return null;
  }

  return (
    <div aria-hidden="true" className={cn("pointer-events-none flex items-end gap-2", className)}>
      {Array.from({ length: bars }).map((_, index) => {
        const height = baseHeights[index % baseHeights.length] * density;

        return (
          <span
            className={cn(
              "meter-bars__bar origin-bottom rounded-full bg-gradient-to-t shadow-[0_0_30px_rgba(255,255,255,0.08)]",
              accentClass[accent],
            )}
            key={`${accent}-${index}`}
            style={
              {
                height: `${height}px`,
                width: `${Math.max(8, 10 * density)}px`,
                "--meter-scale-start": 0.35 + (index % 3) * 0.1,
                "--meter-scale-end": 0.45 + (index % 4) * 0.08,
                "--meter-duration": `${(1.6 + (index % 4) * 0.18) / speed}s`,
                "--meter-delay": `${index * 0.04}s`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
};

export default MeterBars;
