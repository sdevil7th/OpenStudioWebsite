import { motion, useReducedMotion } from "framer-motion";
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

const seedHeights = [138, 158, 174, 146, 166, 194, 152, 182, 163, 142];

function generateHeights(count: number): number[] {
  if (count <= seedHeights.length) return seedHeights.slice(0, count);
  return Array.from({ length: count }, (_, i) => seedHeights[i % seedHeights.length]);
}

const MeterBars = ({
  className,
  accent = "emerald",
  bars = 10,
  density = 1,
  speed = 1,
  reducedMotionMode = "static",
}: MeterBarsProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion && reducedMotionMode === "hidden") {
    return null;
  }

  return (
    <div aria-hidden="true" className={cn("pointer-events-none flex items-end gap-2", className)}>
      {Array.from({ length: bars }).map((_, index) => {
        const height = generateHeights(bars)[index] * density;

        return (
          <motion.span
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    scaleY: [0.35 + ((index % 3) * 0.1), 1, 0.45 + ((index % 4) * 0.08)],
                    opacity: [0.4, 0.95, 0.55],
                  }
            }
            className={cn(
              "origin-bottom rounded-full bg-gradient-to-t shadow-[0_0_30px_rgba(255,255,255,0.08)]",
              accentClass[accent],
            )}
            key={`${accent}-${index}`}
            style={{ height: `${height}px`, width: `${Math.max(8, 10 * density)}px` }}
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    duration: (1.6 + (index % 4) * 0.18) / speed,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                    delay: index * 0.04,
                  }
            }
          />
        );
      })}
    </div>
  );
};

export default MeterBars;
