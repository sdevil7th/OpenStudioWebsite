import type { AccentTone } from "@/data/marketing";
import MeterBars from "@/components/motion/MeterBars";
import SignalGrid from "@/components/motion/SignalGrid";
import OrbitalNodes from "@/components/scene/OrbitalNodes";
import WaveformRibbon from "@/components/scene/WaveformRibbon";
import { cn } from "@/lib/utils";

interface SoundFieldProps {
  className?: string;
  accent?: AccentTone;
  density?: number;
  speed?: number;
  reducedMotionMode?: "static" | "hidden";
  showGrid?: boolean;
  showMeters?: boolean;
  showWave?: boolean;
  showNodes?: boolean;
}

const SoundField = ({
  className,
  accent = "lavender",
  density = 1,
  speed = 1,
  reducedMotionMode = "static",
  showGrid = true,
  showMeters = true,
  showWave = true,
  showNodes = true,
}: SoundFieldProps) => (
  <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
    {showGrid ? <SignalGrid accent={accent} density={density} reducedMotionMode={reducedMotionMode} speed={speed} /> : null}
    {showNodes ? <OrbitalNodes accent={accent} count={5} density={density} reducedMotionMode={reducedMotionMode} speed={speed} /> : null}
    {showWave ? <WaveformRibbon accent={accent} className="bottom-[12%] h-28" density={density} reducedMotionMode={reducedMotionMode} speed={speed} /> : null}
    {showMeters ? (
      <div className="absolute bottom-6 right-6">
        <MeterBars accent={accent} bars={10} density={density} reducedMotionMode={reducedMotionMode} speed={speed} />
      </div>
    ) : null}
  </div>
);

export default SoundField;
