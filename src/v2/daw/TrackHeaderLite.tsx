// Props-only fork of OpenStudio frontend/src/components/TrackHeader.tsx and
// MasterTrackHeader.tsx (@ d2056151222fefcede123ef614ec38c6893cbfd5), plus
// the "+ Add Track" cell from App.tsx / index.css. Every store selector is a
// prop; the pickers, portals, notes popover and the sampler dialog are
// dropped. The control row wraps exactly like upstream's TCP (a flex-wrap
// row that the lane height clips), at a 20 px density so two rows fit the
// 48 px lanes of a 640 px stage.
import { memo } from "react";
import { Power, StickyNote, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DawButton } from "./DawButton";
import { KnobLite } from "./KnobLite";
import { SelectLite } from "./SelectLite";

export type TrackType = "audio" | "midi" | "instrument";

/** Header widths the stages use: the app's TCP at a 640 px design width. */
export const TRACK_HEADER_WIDTH = 228;
/** Two 20 px control rows plus padding; shorter lanes show the first row only. */
export const TWO_ROW_LANE_HEIGHT = 46;

const CONTROL = "h-5 w-5 text-[9px]";

/** Upstream frontend/src/components/icons.tsx PianoIcon, unchanged. */
const PianoIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="1.5" />
    <line x1="6.4" y1="4" x2="6.4" y2="20" />
    <line x1="10.8" y1="4" x2="10.8" y2="20" />
    <line x1="15.2" y1="4" x2="15.2" y2="20" />
    <line x1="19.6" y1="4" x2="19.6" y2="20" />
    <rect x="5" y="4" width="2.8" height="9.5" rx="0.5" fill="currentColor" stroke="none" />
    <rect x="9.4" y="4" width="2.8" height="9.5" rx="0.5" fill="currentColor" stroke="none" />
    <rect x="16.6" y="4" width="2.8" height="9.5" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
);

/** The FX + bypass pair (upstream data-tcp-pair="fx"). */
const FxPair = ({ hasFx, bypassed = false, name }: { hasFx: boolean; bypassed?: boolean; name: string }) => (
  <span className="inline-flex shrink-0 items-center">
    <DawButton
      aria-label={`FX chain for ${name}`}
      className={cn(CONTROL, "rounded-l border-r-0", hasFx && (bypassed ? "text-red-400 border-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]" : "text-green-400 border-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]"))}
      shape="square"
      size="icon-sm"
      title="FX Chain"
    >
      FX
    </DawButton>
    <DawButton
      aria-label={hasFx ? (bypassed ? `Enable FX on ${name}` : `Bypass FX on ${name}`) : "No FX loaded"}
      className={cn("h-5 w-3 rounded-r", hasFx && (bypassed ? "text-red-400 border-red-500" : "text-green-400 border-green-500"))}
      shape="square"
      size="icon-xs"
      title={hasFx ? (bypassed ? "Enable FX" : "Bypass FX") : "No FX loaded"}
    >
      <Power size={9} strokeWidth={2.5} />
    </DawButton>
  </span>
);

/** The automation pair as the app ships it: "A" plus a power toggle. */
const AutomationPair = ({ active = false, name }: { active?: boolean; name: string }) => (
  <span className="inline-flex shrink-0 items-center">
    <DawButton aria-label={`Automation for ${name}`} className={cn(CONTROL, "rounded-l border-r-0")} shape="square" size="icon-sm" title="Automation">
      A
    </DawButton>
    <DawButton
      aria-label={active ? "Disable automation read" : "Enable automation read"}
      className={cn("h-5 w-3 rounded-r", active && "text-green-400 border-green-500 bg-green-900/30")}
      shape="square"
      size="icon-xs"
      title={active ? "Disable automation read" : "Enable automation read"}
    >
      <Power size={9} strokeWidth={2.5} />
    </DawButton>
  </span>
);

export interface TrackHeaderLiteProps {
  name: string;
  color: string;
  type?: TrackType;
  /** Shown in the accent input select of audio tracks ("In 1-2"). */
  input?: string;
  volumeDb?: number;
  /** -1 … 1 */
  pan?: number;
  hasFx?: boolean;
  fxBypassed?: boolean;
  automationRead?: boolean;
  muted?: boolean;
  soloed?: boolean;
  armed?: boolean;
  selected?: boolean;
  /** Linear peak level for the activity bar at the right edge. */
  level?: number;
  height: number;
  /** Fades the header in while a track is being added. */
  entering?: boolean;
}

/** Meter gradient thresholds from upstream getMeterColor(). */
const meterColor = (dbNorm: number) => (dbNorm > 0.92 ? "#ef4444" : dbNorm > 0.85 ? "#facc15" : "#16a34a");

export const TrackHeaderLite = memo(function TrackHeaderLite({
  name,
  color,
  type = "audio",
  input = "In 1-2",
  volumeDb = 0,
  pan = 0,
  hasFx = false,
  fxBypassed = false,
  automationRead = false,
  muted = false,
  soloed = false,
  armed = false,
  selected = false,
  level = 0,
  height,
  entering = false,
}: TrackHeaderLiteProps) {
  const dbNorm = level > 0.001 ? Math.max(0, (20 * Math.log10(level) + 60) / 72) : 0;
  const twoRows = height >= TWO_ROW_LANE_HEIGHT;
  const typeLabel = type === "audio" ? "Audio" : type === "midi" ? "MIDI" : "Instrument";

  return (
    <div
      className={cn("flex flex-col border-b border-neutral-900 relative overflow-hidden box-border transition-opacity duration-500", selected ? "bg-neutral-700" : "bg-neutral-800", entering && "opacity-0")}
      data-track-type={type}
      style={{ height }}
    >
      <div className="flex shrink-0 overflow-hidden" style={{ height }}>
        {/* Track colour bar */}
        <div className="w-2 shrink-0" style={{ background: color || "#666" }} title="Track color" />

        {/* Main content — the single flex-wrap row of the TCP */}
        <div className="flex-1 min-w-0 flex flex-wrap items-center content-center py-[3px] px-1.5 gap-x-1 gap-y-0.5">
          <DawButton
            active={armed}
            activeStyle="glow"
            aria-label={armed ? "Disarm track recording" : "Arm track for recording"}
            className={cn(CONTROL, "shrink-0")}
            shape="circle"
            size="icon-sm"
            title="Record Arm (R)"
            variant="danger"
          >
            R
          </DawButton>
          <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-neutral-400" title="Set track icon">
            <span className="text-[9px] leading-none">&#9835;</span>
          </span>
          <span className="min-w-[36px] flex-1 basis-10 h-5 px-1.5 rounded bg-neutral-700 text-white text-[10px] leading-5 truncate" title={name} aria-label="Track name">
            {name}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <KnobLite label="Volume" max={12} min={-60} size={20} value={volumeDb} variant="volume" />
            <KnobLite bipolarCenter={0} label="Pan" max={1} min={-1} size={20} value={pan} variant="pan" />
          </span>
          <span className="flex gap-px shrink-0">
            <DawButton active={muted} aria-label={muted ? "Unmute track" : "Mute track"} className={cn(CONTROL, "rounded-l")} shape="square" size="icon-sm" title="Mute (M)">
              M
            </DawButton>
            <DawButton active={soloed} aria-label={soloed ? "Unsolo track" : "Solo track"} className={cn(CONTROL, "rounded-r")} shape="square" size="icon-sm" title="Solo (S)" variant="warning">
              S
            </DawButton>
          </span>

          {twoRows && (
            <>
              <FxPair bypassed={fxBypassed} hasFx={hasFx} name={name} />
              <AutomationPair active={automationRead} name={name} />
              <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-neutral-500" title="Add track notes">
                <StickyNote size={11} />
              </span>
              <SelectLite title="Track type" value={typeLabel} width={44} />
              {type === "audio" && <SelectLite title="Input" value={input} variant="accent" width={46} />}
              {type === "instrument" && (
                <DawButton aria-label="Instrument plugin" className="h-5 w-5 px-0 text-purple-300 border-purple-500/60" size="icon-sm" title="Instrument">
                  <PianoIcon size={11} />
                </DawButton>
              )}
            </>
          )}
        </div>

        {/* Right side: vertical activity meter */}
        <div className="w-2 pt-1 bg-neutral-900 flex flex-col-reverse border-l border-neutral-800 shrink-0 mr-1" data-meter-source={type === "audio" ? "audio_output" : "midi_input"}>
          <div
            className={cn("w-full transition-all duration-75", armed && dbNorm > 0.01 && "animate-pulse")}
            style={{
              height: `${Math.min(100, dbNorm * 100)}%`,
              background: type === "audio" ? meterColor(dbNorm) : "linear-gradient(to top, #22d3ee, #a5f3fc)",
            }}
          />
        </div>
      </div>
    </div>
  );
});

/* ---------------- master row ---------------- */

export const MASTER_HEADER_HEIGHT = 26;

interface MasterHeaderLiteProps {
  volumeDb: number;
  muted?: boolean;
  hasFx?: boolean;
  automationRead?: boolean;
}

/** The compact master row pinned to the bottom of the TCP. */
export const MasterHeaderLite = memo(function MasterHeaderLite({ volumeDb, muted = false, hasFx = true, automationRead = true }: MasterHeaderLiteProps) {
  const ratio = Math.max(0, Math.min(1, (volumeDb + 60) / 72));
  return (
    <div className="border-t border-daw-border bg-daw-panel px-1.5 flex items-center gap-[3px] shrink-0 overflow-hidden" style={{ height: MASTER_HEADER_HEIGHT }}>
      <span className="leading-none text-[9px] font-bold uppercase text-daw-text-muted shrink-0 mr-px">Master</span>
      <DawButton active={muted} aria-label={muted ? "Unmute Master" : "Mute Master"} className={CONTROL} size="icon-sm" title="Mute Master">
        <Volume2 size={11} />
      </DawButton>
      <DawButton aria-label="Mute master" className={CONTROL} size="icon-sm" title="Mute">
        M
      </DawButton>
      <FxPair hasFx={hasFx} name="Master" />
      <AutomationPair active={automationRead} name="Master" />
      <span aria-label="Master volume" aria-valuemax={12} aria-valuemin={-60} aria-valuenow={volumeDb} className="relative w-8 h-2 rounded-full bg-neutral-700 shrink-0 ml-px" role="slider">
        <span className="absolute inset-y-0 left-0 rounded-full bg-daw-accent" style={{ width: `${ratio * 100}%` }} />
        <span className="absolute top-1/2 w-3 h-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-400 border border-blue-200 shadow" style={{ left: `${ratio * 100}%` }} />
      </span>
      <span className="ml-auto leading-none text-[9px] font-mono text-daw-text-muted text-right shrink-0 tabular-nums whitespace-nowrap">{volumeDb <= -60 ? "-inf" : volumeDb.toFixed(1)} dB</span>
    </div>
  );
});

/* ---------------- "+ Add Track" ---------------- */

/** The sticky TCP header cell that sits beside the ruler. */
export const AddTrackBar = ({ height }: { height: number }) => (
  <div className="shrink-0 px-1.5 pt-[2px] pb-[3px] border-b border-[#2a2a2a] bg-[#121212] flex" style={{ height }}>
    <button
      type="button"
      aria-label="Add new audio track"
      className="w-full rounded-[3px] bg-[#0078d4] text-white text-[11px] font-semibold leading-none"
      style={{ height: height - 6 }}
    >
      + Add Track
    </button>
  </div>
);
