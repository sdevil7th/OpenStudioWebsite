import { useMemo, useRef } from "react";
import { ChevronDown, Minus, Power, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DawButton } from "../DawButton";
import { MIN_ANIMATED_SCALE, StageFrame, useStageScale } from "../stage/StageFrame";
import type { StageProps } from "../stage/LiveStage";
import { useStageTimeline } from "../stage/useStageTimeline";
import { EQGraph } from "../vendor/ParametricGraph/EQGraph";
import { SPEC, type EqBandState } from "./pluginWindowScript";

export const STAGE_WIDTH = 640;
export const STAGE_HEIGHT = 360;
const TITLE_HEIGHT = 30;
const TOOLBAR_HEIGHT = 34;
const BAND_STRIP = 54;
const GRAPH_HEIGHT = STAGE_HEIGHT - TITLE_HEIGHT - TOOLBAR_HEIGHT - BAND_STRIP;

const noop = () => undefined;

/** The slider layout OpenStudio's built-in EQ reports: 5 per band, 8 bands. */
const toSliders = (bands: EqBandState[], bypass: boolean) =>
  bands.flatMap((band, index) => {
    const base = index * 5;
    return [
      { index: base, name: `Band ${index + 1} Enabled`, min: 0, max: 1, def: 0, inc: 1, value: band.enabled && !bypass ? 1 : 0, isEnum: true },
      { index: base + 1, name: `Band ${index + 1} Type`, min: 0, max: 5, def: 1, inc: 1, value: band.type, isEnum: true },
      { index: base + 2, name: `Band ${index + 1} Freq`, min: 20, max: 20000, def: band.freq, inc: 1, value: band.freq, isEnum: false },
      { index: base + 3, name: `Band ${index + 1} Gain`, min: -18, max: 18, def: 0, inc: 0.1, value: band.gainDB, isEnum: false },
      { index: base + 4, name: `Band ${index + 1} Q`, min: 0.1, max: 10, def: 1, inc: 0.01, value: band.q, isEnum: false },
    ];
  });

const TYPE_LABEL = ["Low shelf", "Peak", "High shelf", "Low pass", "High pass", "Notch"];
const formatFreq = (freq: number) => (freq >= 1000 ? `${(freq / 1000).toFixed(freq >= 10000 ? 1 : 2)} kHz` : `${Math.round(freq)} Hz`);

const PluginWindowStage = ({ priority, className }: StageProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(outerRef, STAGE_WIDTH);
  const state = useStageTimeline(SPEC, { scope: outerRef, enabled: scale >= MIN_ANIMATED_SCALE, priority, startDelay: 0.6, fps: 24 });
  const sliders = useMemo(() => toSliders(state.bands, state.bypass), [state.bands, state.bypass]);
  const active = state.bands.filter((band) => band.enabled);

  return (
    <StageFrame
      className={className}
      data={{ bypass: state.bypass, slot: state.slot }}
      height={STAGE_HEIGHT}
      label="OpenStudio EQ hosted in its own window: a band is swept up to 1.2 kHz, boosted and narrowed, the plugin is bypassed and compared A/B."
      outerRef={outerRef}
      scale={scale}
      width={STAGE_WIDTH}
    >
      {/* Native plugin window title bar */}
      <div className="flex items-center gap-2 px-3 bg-[#1f1f1f] border-b border-black text-[10px] text-neutral-200 shrink-0" style={{ height: TITLE_HEIGHT }}>
        <span className="font-semibold">OpenStudio EQ</span>
        <span className="text-neutral-500">— Vocal · Track FX 1</span>
        <span className="ml-auto flex items-center gap-2 text-neutral-500">
          <Minus size={10} />
          <Square size={9} />
          <X size={10} />
        </span>
      </div>
      {/* FX chain header row */}
      <div className="flex items-center gap-1.5 px-2 bg-neutral-900 border-b border-neutral-800 shrink-0" style={{ height: TOOLBAR_HEIGHT }}>
        <DawButton
          active={!state.bypass}
          activeStyle="glow"
          className={cn("w-6 h-5", state.focus === "bypass" && "ring-2 ring-daw-accent/50")}
          size="icon-xs"
          title="Bypass"
          variant={state.bypass ? "default" : "success"}
        >
          <Power size={10} />
        </DawButton>
        <span className={cn("flex items-center gap-1 h-5 px-2 rounded border border-neutral-700 bg-neutral-800 text-[9px] text-neutral-200", state.focus === "preset" && "border-daw-accent")}>
          {state.preset}
          <ChevronDown className="text-neutral-500" size={9} />
        </span>
        <span className={cn("flex rounded border border-neutral-700 overflow-hidden", state.focus === "ab" && "ring-2 ring-daw-accent/50")}>
          {(["A", "B"] as const).map((slot) => (
            <span
              key={slot}
              className={cn("h-5 w-5 flex items-center justify-center text-[9px] font-bold", state.slot === slot ? "bg-daw-accent text-white" : "bg-neutral-800 text-neutral-400")}
            >
              {slot}
            </span>
          ))}
        </span>
        <span className="ml-auto text-[8px] uppercase tracking-wider text-neutral-500">
          Built-in · {active.length} bands · {state.bypass ? "bypassed" : "48 kHz"}
        </span>
      </div>
      {/* Graph */}
      <div className={cn("relative shrink-0 bg-[#0e0e0e] transition-opacity", state.bypass && "opacity-50")} style={{ height: GRAPH_HEIGHT }}>
        <EQGraph height={GRAPH_HEIGHT} onSliderChange={noop} sliders={sliders} width={STAGE_WIDTH} />
        {state.bypass ? (
          <span className="absolute top-2 right-3 rounded bg-neutral-950/80 border border-neutral-700 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-neutral-300">
            Bypass
          </span>
        ) : null}
      </div>
      {/* Band readouts */}
      <div className="flex shrink-0 bg-neutral-900 border-t border-neutral-800" style={{ height: BAND_STRIP }}>
        {state.bands.slice(0, 5).map((band, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 min-w-0 px-2 py-1.5 border-r border-neutral-800 last:border-r-0 flex flex-col gap-0.5 transition-colors",
              state.focusBand === index && "bg-daw-accent/15",
            )}
          >
            <span className="text-[7.5px] uppercase tracking-wider text-neutral-500 truncate">
              {index + 1} · {TYPE_LABEL[band.type]}
            </span>
            <span className="text-[10px] font-mono text-neutral-100 tabular-nums">{formatFreq(band.freq)}</span>
            <span className="text-[8px] font-mono text-neutral-400 tabular-nums">
              {band.gainDB >= 0 ? "+" : ""}
              {band.gainDB.toFixed(1)} dB · Q {band.q.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </StageFrame>
  );
};

export default PluginWindowStage;
