import { motion, useReducedMotion } from "framer-motion";
import type { AccentTone } from "@/data/marketing";
import { cn } from "@/lib/utils";

interface WaveformRibbonProps {
  className?: string;
  accent?: AccentTone;
  density?: number;
  speed?: number;
  reducedMotionMode?: "static" | "hidden";
}

const accentClass: Record<AccentTone, string> = {
  lavender: "from-primary/0 via-primary/85 to-secondary/70",
  emerald: "from-secondary/0 via-secondary/85 to-primary/70",
  amber: "from-accent/0 via-accent/90 to-primary/70",
  frost: "from-white/0 via-white/80 to-primary/60",
};

const WaveformRibbon = ({
  className,
  accent = "lavender",
  density = 1,
  speed = 1,
  reducedMotionMode = "static",
}: WaveformRibbonProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion && reducedMotionMode === "hidden") {
    return null;
  }

  const segments = Array.from({ length: Math.max(16, Math.round(24 * density)) });

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 flex items-center justify-center overflow-hidden", className)}>
      <motion.div
        animate={prefersReducedMotion ? undefined : { x: ["0%", "-4%", "0%"], y: [0, -6, 0] }}
        className="flex w-[130%] items-end gap-2 opacity-80"
        transition={prefersReducedMotion ? undefined : { duration: 8 / speed, repeat: Infinity, ease: "easeInOut" }}
      >
        {segments.map((_, index) => (
          <span
            className={cn("rounded-full bg-gradient-to-t", accentClass[accent])}
            key={`${accent}-${index}`}
            style={{
              height: `${22 + ((index * 13) % 52)}px`,
              width: `${Math.max(6, 7 * density)}px`,
              opacity: 0.15 + ((index % 5) * 0.08),
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default WaveformRibbon;
