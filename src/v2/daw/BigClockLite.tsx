// Props-only fork of OpenStudio frontend/src/components/BigClock.tsx
// (@ d2056151222fefcede123ef614ec38c6893cbfd5). The store selectors become
// props; the format/close buttons stay for looks but are inert.
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DawButton } from "./DawButton";
import type { Transport } from "./types";

export type ClockFormat = "time" | "beats";

interface BigClockLiteProps {
  timeSeconds: number;
  tempo: number;
  timeSignature: { numerator: number; denominator: number };
  transport: Transport;
  format?: ClockFormat;
  projectName?: string;
  /** `docked` is the toolbar-sized variant used in the hero. */
  size?: "floating" | "docked";
}

export const formatClock = (
  currentTime: number,
  format: ClockFormat,
  tempo: number,
  timeSignature: { numerator: number },
): string => {
  if (format === "beats") {
    const beatsPerSecond = tempo / 60;
    const totalBeats = currentTime * beatsPerSecond;
    const bars = Math.floor(totalBeats / timeSignature.numerator) + 1;
    const beat = Math.floor(totalBeats % timeSignature.numerator) + 1;
    const tick = Math.floor((totalBeats % 1) * 960);
    return `${String(bars).padStart(3, " ")}.${beat}.${String(tick).padStart(3, "0")}`;
  }
  const h = Math.floor(currentTime / 3600);
  const m = Math.floor((currentTime % 3600) / 60);
  const s = Math.floor(currentTime % 60);
  const ms = Math.floor((currentTime % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
};

export const BigClockLite = ({
  timeSeconds,
  tempo,
  timeSignature,
  transport,
  format = "time",
  projectName = "OpenStudio",
  size = "floating",
}: BigClockLiteProps) => {
  const docked = size === "docked";
  return (
    <div className="flex flex-col bg-black border border-daw-border rounded-lg shadow-2xl overflow-hidden select-none">
      <div
        className={cn(
          "flex items-center justify-between bg-neutral-900 border-b border-neutral-800",
          docked ? "px-2 py-0" : "px-3 py-1",
        )}
      >
        <span className={cn("text-neutral-500 uppercase tracking-wider", docked ? "text-[8px]" : "text-[10px]")}>
          {projectName} | {tempo} BPM | {timeSignature.numerator}/{timeSignature.denominator}
        </span>
        {!docked && (
          <div className="flex items-center gap-1">
            <DawButton variant="ghost" size="icon-sm" title="Toggle format">
              <span className="text-[9px] text-neutral-400">{format === "time" ? "T" : "B"}</span>
            </DawButton>
            <DawButton variant="ghost" size="icon-sm" aria-label="Close big clock">
              <X size={12} />
            </DawButton>
          </div>
        )}
      </div>
      <div className={cn(docked ? "px-2 py-0.5" : "px-6 py-3")} title="Click to toggle between time and beats">
        <div
          className={cn(
            "font-mono tracking-wider tabular-nums whitespace-pre",
            docked ? "text-[15px] leading-tight" : "text-5xl",
            transport === "recording" ? "text-red-500" : transport === "playing" ? "text-green-400" : "text-neutral-200",
          )}
        >
          {formatClock(timeSeconds, format, tempo, timeSignature)}
        </div>
        {!docked && (
          <div className="text-[10px] text-neutral-600 mt-1 text-right">
            {format === "time" ? "HH:MM:SS.ms" : "BAR.BEAT.TICK"}
          </div>
        )}
      </div>
    </div>
  );
};
