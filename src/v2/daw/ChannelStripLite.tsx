// Props-only fork of OpenStudio frontend/src/components/ChannelStrip.tsx and
// the `pan` variant of components/ui/Slider (@ d2056151222fefcede123ef614ec38c6893cbfd5).
// Every `useDAWStore` selector is a prop, and the FX chain panel, context menu,
// native-bridge clip reset, scoped-action executor and grouped wheel handlers
// are dropped. Markup and Tailwind classes are otherwise kept as-is.
import { memo } from "react";
import { ChevronDown, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import { DawButton } from "./DawButton";
import { MasterPeakMeterCluster } from "./vendor/MasterPeakMeterCluster";
import { PeakMeter } from "./vendor/PeakMeter";
import {
  CHANNEL_STRIP_DB_LABEL_FONT_CLASS,
  CHANNEL_STRIP_DB_LABEL_WIDTH_CLASS,
  normalizeDbToMeter,
} from "./vendor/meterConfig";

const DB_MARKS: { db: number; label: string }[] = [
  { db: 12, label: "12" },
  { db: 6, label: "6" },
  { db: 0, label: "0" },
  { db: -6, label: "-6" },
  { db: -12, label: "-12" },
  { db: -24, label: "-24" },
  { db: -48, label: "-48" },
  { db: -60, label: "-∞" },
];

const getDbPosition = (db: number) => (1 - normalizeDbToMeter(db, "extended")) * 100;

const formatVolume = (db: number) => (db <= -60 ? "-∞" : db.toFixed(1));

/** The centre-fill pan slider from ui/Slider's `pan` variant, display only. */
const PanSlider = ({ value, label }: { value: number; label: string }) => {
  const min = -100;
  const max = 100;
  const range = max - min;
  const centerRatio = (0 - min) / range;
  const valueRatio = (value - min) / range;
  const fillLeft = Math.min(centerRatio, valueRatio) * 100;
  const fillWidth = Math.abs(valueRatio - centerRatio) * 100;
  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <div
        className="relative w-full h-2 rounded cursor-pointer select-none"
        style={{ background: "#3a3a3a" }}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      >
        <div className="absolute top-0 bottom-0 w-px bg-neutral-500" style={{ left: `${centerRatio * 100}%` }} />
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: `${fillLeft}%`,
            width: `${fillWidth}%`,
            background: "#16a34a",
            borderRadius: value < 0 ? "4px 0 0 4px" : value > 0 ? "0 4px 4px 0" : "0",
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-2 rounded-sm border border-neutral-400 bg-neutral-300 hover:bg-white transition-colors"
          style={{ left: `${valueRatio * 100}%`, transform: "translateX(-50%)" }}
        />
      </div>
    </div>
  );
};

export interface ChannelStripLiteProps {
  name: string;
  trackIndex: number;
  color?: string;
  input?: string;
  hasFx?: boolean;
  fxBypassed?: boolean;
  volumeDb: number;
  /** -1 … 1 */
  pan: number;
  muted?: boolean;
  soloed?: boolean;
  armed?: boolean;
  isSelected?: boolean;
  isMaster?: boolean;
  /** Linear peak level (1 = 0 dBFS). */
  level: number;
  clipping?: boolean;
  /** Master only. */
  mono?: boolean;
  automationRead?: boolean;
  automationWrite?: boolean;
  sendCount?: number;
}

export const ChannelStripLite = memo(function ChannelStripLite({
  name,
  trackIndex,
  color,
  input = "In 1",
  hasFx = false,
  fxBypassed = false,
  volumeDb,
  pan,
  muted = false,
  soloed = false,
  armed = false,
  isSelected = false,
  isMaster = false,
  level,
  clipping = false,
  mono = false,
  automationRead = true,
  automationWrite = false,
  sendCount = 0,
}: ChannelStripLiteProps) {
  const panDisplay = pan === 0 ? "C" : pan > 0 ? `R${Math.round(Math.abs(pan * 100))}` : `L${Math.round(Math.abs(pan * 100))}`;
  const dbMarks = isMaster ? DB_MARKS : DB_MARKS.filter((m) => [12, 0, -12, -48, -60].includes(m.db));

  return (
    <div
      role="group"
      aria-label={`Channel strip for ${name}`}
      className={cn("flex flex-col shrink-0 h-full border-r border-l border-neutral-800", {
        "w-[90px] bg-slate-800 sticky left-0 z-10 border-x-2 border-x-green-600": isMaster,
        "w-[75px] bg-neutral-800": !isMaster && !isSelected,
        "w-[75px] bg-neutral-700": !isMaster && isSelected,
      })}
    >
      {/* Track Name Header */}
      <div
        className={cn("text-[9px] font-bold text-center truncate px-1 py-1 shrink-0", {
          "bg-green-600 text-white": isMaster,
          "bg-neutral-700 text-neutral-200 border-b-2": !isMaster,
        })}
        style={!isMaster ? { borderColor: color || "#666" } : undefined}
      >
        {isMaster ? "● MASTER ●" : name}
      </div>

      <div className="overflow-hidden min-h-0">
        {!isMaster && (
          <div className="px-1 pt-0.5 pb-0.5 shrink-0">
            <button
              type="button"
              title="Sends, receives & hardware output routing"
              className={cn(
                "w-full h-4 rounded text-[7px] font-bold cursor-pointer transition-colors border",
                sendCount > 0
                  ? "border-cyan-600/60 text-cyan-400 bg-neutral-900 hover:bg-neutral-800"
                  : "border-neutral-700 text-neutral-500 bg-neutral-900/60 hover:border-cyan-500 hover:text-cyan-400",
              )}
            >
              IO {sendCount > 0 && `(${sendCount})`}
            </button>
          </div>
        )}

        {!isMaster && (
          <div className="px-1 py-1 shrink-0">
            <div className="bg-emerald-700 text-[8px] text-white text-center py-0.5 rounded truncate cursor-pointer hover:bg-emerald-600 transition-colors">
              {input}
            </div>
          </div>
        )}

        {isMaster && (
          <div className="flex gap-0.5 p-1 shrink-0">
            <DawButton variant="default" size="xs" active={muted} title="Mute" aria-label="Mute master" className="flex-1 px-0.5">
              M
            </DawButton>
            <DawButton
              variant="default"
              size="xs"
              active={mono}
              title={mono ? "Disable Mono" : "Enable Mono"}
              aria-label="Mono monitoring"
              className={cn("flex-1 px-0.5", mono ? "bg-yellow-600 text-white border-yellow-500" : "hover:border-yellow-500 hover:text-yellow-300")}
            >
              MONO
            </DawButton>
          </div>
        )}

        <div className={cn("flex justify-between px-1 shrink-0", isMaster ? "pb-0.5" : "pb-1")}>
          <span className="flex shrink-0">
            <button
              type="button"
              aria-label={`Open FX chain for ${name}`}
              className={cn(
                "h-4 w-4 rounded rounded-r-none text-[7px] flex items-center justify-center cursor-pointer transition-colors p-0",
                hasFx
                  ? fxBypassed
                    ? "bg-neutral-800 border border-red-500 text-red-400 shadow-[0_0_6px_rgba(239,68,68,0.4)]"
                    : "bg-neutral-800 border border-green-500 text-green-400 shadow-[0_0_6px_rgba(34,197,94,0.4)]"
                  : "bg-neutral-800 border border-dashed border-neutral-600 text-neutral-500 hover:border-green-500 hover:text-green-500",
              )}
            >
              FX
            </button>
            <button
              type="button"
              title={hasFx ? (fxBypassed ? "Enable FX" : "Bypass FX") : "No FX loaded"}
              aria-label={hasFx ? (fxBypassed ? `Enable FX on ${name}` : `Bypass FX on ${name}`) : `Open FX chain for ${name}`}
              className={cn(
                "h-4 w-3 shrink-0 rounded rounded-l-none flex items-center justify-center transition-colors border hover:cursor-pointer",
                !hasFx && "border-neutral-700 text-neutral-600 bg-neutral-800",
                hasFx && !fxBypassed && "border-green-500 text-green-400 bg-neutral-800",
                hasFx && fxBypassed && "border-red-500 text-red-400 bg-neutral-800",
              )}
            >
              <Power size={8} strokeWidth={2.5} />
            </button>
          </span>
          {!isMaster && (
            <button
              type="button"
              title="Channel Strip EQ"
              aria-label={`Open EQ for ${name}`}
              className="h-4 px-1.5 shrink-0 rounded flex items-center justify-center text-[7px] font-bold transition-colors border border-neutral-600 text-neutral-500 bg-neutral-800 hover:border-daw-accent hover:text-daw-accent cursor-pointer"
            >
              EQ
            </button>
          )}
          {isMaster && (
            <span className="flex shrink-0 gap-0.5">
              <button
                type="button"
                title={automationRead ? "Disable master automation read" : "Enable master automation read"}
                aria-label="Master automation read"
                className={cn(
                  "h-4 w-4 rounded flex items-center justify-center text-[7px] font-bold transition-colors border bg-neutral-800",
                  automationRead ? "border-teal-500 text-teal-300" : "border-neutral-600 text-neutral-500 hover:border-teal-500 hover:text-teal-300 cursor-pointer",
                )}
              >
                R
              </button>
              <span className="flex shrink-0">
                <button
                  type="button"
                  title={automationWrite ? "Disable master automation write" : "Enable master automation write"}
                  aria-label="Master automation write"
                  className={cn(
                    "h-4 w-4 rounded rounded-r-none flex items-center justify-center text-[7px] font-bold transition-colors border border-r-0 bg-neutral-800 cursor-pointer",
                    automationWrite ? "border-red-500 text-red-300" : "border-neutral-600 text-neutral-500 hover:border-red-500 hover:text-red-300",
                  )}
                >
                  W
                </button>
                <button
                  type="button"
                  title="Master automation panel"
                  aria-label="Open master automation envelopes"
                  className="h-4 w-3 rounded rounded-l-none flex items-center justify-center transition-colors border bg-neutral-800 cursor-pointer border-neutral-600 text-neutral-500 hover:border-teal-500 hover:text-teal-300"
                >
                  <ChevronDown size={8} strokeWidth={2.5} />
                </button>
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Pan Section */}
      <div className={cn("px-1 shrink-0", isMaster ? "pb-1" : "pb-0.5")}>
        <div className="flex flex-col items-center gap-0.5">
          <PanSlider label={`Pan for ${name}: ${panDisplay}`} value={pan * 100} />
          <span className="text-[8px] text-neutral-500 font-mono">{panDisplay}</span>
        </div>
      </div>

      {/* Meter + Fader Section */}
      <div className="flex-1 flex gap-0.5 px-1 py-0.5 min-h-0 overflow-hidden">
        <div className="shrink-0 h-full">
          {isMaster ? (
            <MasterPeakMeterCluster level={level} clipping={clipping} />
          ) : (
            <PeakMeter
              level={level}
              ariaLabel={`${name} meter: audio output`}
              stereo={true}
              clipping={clipping}
              scaleMode="extended"
              showThresholdLine={true}
            />
          )}
        </div>

        <div className={`relative ${CHANNEL_STRIP_DB_LABEL_WIDTH_CLASS} shrink-0 h-full`}>
          <div className="absolute inset-x-0" style={{ top: 5, bottom: 5 }}>
            {dbMarks.map(({ db, label }) => (
              <span
                key={db}
                className={`absolute ${CHANNEL_STRIP_DB_LABEL_FONT_CLASS} text-neutral-400 leading-none right-0`}
                style={{ top: `${getDbPosition(db)}%`, transform: "translateY(-50%)" }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 flex justify-center h-full">
          <div className="flex flex-col items-center min-h-0 overflow-hidden" style={{ height: "100%", width: "18px" }}>
            <input
              type="range"
              min={-60}
              max={12}
              step={0.1}
              value={volumeDb}
              readOnly
              tabIndex={-1}
              className="cursor-pointer transition-opacity vertical-fader"
              style={{ writingMode: "vertical-lr", direction: "rtl", height: "100%" }}
              aria-valuemin={-60}
              aria-valuemax={12}
              aria-valuenow={volumeDb}
              aria-label={`Volume fader for ${name}: ${formatVolume(volumeDb)} dB`}
              title={`${formatVolume(volumeDb)} dB`}
            />
          </div>
        </div>
      </div>

      {/* Volume Display */}
      <div
        className={cn("text-[9px] font-mono text-center py-0.5 shrink-0 tabular-nums", {
          "bg-slate-900 text-blue-400 mt-0.5": isMaster,
          "bg-neutral-900 text-neutral-400": !isMaster,
        })}
      >
        {formatVolume(volumeDb)} dB
      </div>

      {/* M/S/R Buttons for tracks */}
      {!isMaster && (
        <div className="flex gap-0.5 p-1 shrink-0">
          <DawButton variant="default" size="xs" active={muted} title="Mute" aria-label={`Mute track ${name}`} className="flex-1 px-0.5">
            M
          </DawButton>
          <DawButton variant="warning" size="xs" active={soloed} title="Solo" aria-label={`Solo track ${name}`} className="flex-1 px-0.5">
            S
          </DawButton>
          <DawButton
            variant="danger"
            size="xs"
            active={armed}
            activeStyle={armed ? "glow" : "solid"}
            title="Record Arm"
            aria-label={`Arm track ${name} for recording`}
            className="flex-1 px-0.5"
          >
            R
          </DawButton>
        </div>
      )}

      {/* Track Number / OUT */}
      <div
        className={cn("text-[10px] font-bold text-center py-1 shrink-0", {
          "bg-green-600 text-white": isMaster,
          "bg-neutral-800/50 text-neutral-500": !isMaster,
        })}
      >
        {isMaster ? "OUT" : trackIndex + 1}
      </div>
    </div>
  );
});
