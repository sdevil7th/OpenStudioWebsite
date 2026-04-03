import { motion, useReducedMotion } from "framer-motion";
import type { AccentTone } from "@/data/marketing";
import { cn } from "@/lib/utils";

interface OrbitalNodesProps {
  className?: string;
  accent?: AccentTone;
  density?: number;
  speed?: number;
  count?: number;
  reducedMotionMode?: "static" | "hidden";
}

const accentMap: Record<AccentTone, string> = {
  lavender: "bg-primary/30",
  emerald: "bg-secondary/30",
  amber: "bg-accent/30",
  frost: "bg-white/20",
};

const positions = [
  { left: "8%", top: "12%", size: 120 },
  { left: "72%", top: "18%", size: 96 },
  { left: "26%", top: "62%", size: 84 },
  { left: "82%", top: "68%", size: 132 },
  { left: "52%", top: "30%", size: 72 },
  { left: "44%", top: "78%", size: 102 },
];

const OrbitalNodes = ({
  className,
  accent = "lavender",
  density = 1,
  speed = 1,
  count = 4,
  reducedMotionMode = "static",
}: OrbitalNodesProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion && reducedMotionMode === "hidden") {
    return null;
  }

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {positions.slice(0, count).map((node, index) => (
        <motion.span
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, index % 2 === 0 ? 18 : -14, 0],
                  y: [0, index % 2 === 0 ? -16 : 14, 0],
                  scale: [1, 1.08, 1],
                }
          }
          className={cn("absolute rounded-full blur-[70px]", accentMap[accent])}
          key={`${accent}-${index}`}
          style={{
            left: node.left,
            top: node.top,
            width: `${node.size * density}px`,
            height: `${node.size * density}px`,
          }}
          transition={
            prefersReducedMotion
              ? undefined
              : {
                    duration: (8 + index * 1.2) / speed,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
          }
        />
      ))}
    </div>
  );
};

export default OrbitalNodes;
