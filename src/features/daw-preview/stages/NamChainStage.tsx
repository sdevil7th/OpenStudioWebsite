import { useRef } from "react";
import { Activity, AudioWaveform, CloudRain, Disc3, Gauge, SlidersHorizontal, Speaker, Timer, Waves, Zap } from "lucide-react";
import { MIN_ANIMATED_SCALE, StageFrame, useStageScale } from "../stage/StageFrame";
import type { StageProps } from "../stage/LiveStage";
import { useStageTimeline } from "../stage/useStageTimeline";
import { NAMCompactChain } from "../vendor/NAMCompactChain";
import type { NAMSignalChainPostModule, NAMSignalChainRouteModule } from "../vendor/NAMSignalChainTypes";
import { SPEC, type PostId } from "./namChainScript";

// The chain rail is a three-column grid that needs room; design it wide and
// let StageFrame scale it into the column (0.67 at 640px is still legible).
export const STAGE_WIDTH = 960;
export const STAGE_HEIGHT = 540;

const noop = () => undefined;

const POST: Record<PostId, Omit<NAMSignalChainRouteModule, "id">> = {
  eq: { label: "EQ", caption: "9 bands · HPF 80", icon: <SlidersHorizontal size={14} /> },
  mod: { label: "Mod", caption: "Chorus · 0.4 Hz", icon: <Waves size={14} /> },
  delay: { label: "Delay", caption: "Tape · 1/8 dotted", icon: <Timer size={14} /> },
  reverb: { label: "Reverb", caption: "Plate · 2.4 s", icon: <CloudRain size={14} /> },
};

const NamChainStage = ({ priority, className }: StageProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(outerRef, STAGE_WIDTH);
  const state = useStageTimeline(SPEC, { scope: outerRef, enabled: scale >= MIN_ANIMATED_SCALE * 0.75, priority, startDelay: 0.6, fps: 20 });

  const fixedPre: NAMSignalChainRouteModule[] = [
    {
      id: "gate",
      label: "Gate",
      caption: "−46 dB · fast",
      status: state.gateOpen ? "OPEN" : "CLOSED",
      enabled: true,
      icon: <Gauge size={14} />,
      onToggle: noop,
      onEdit: noop,
    },
  ];
  const captureCore: NAMSignalChainRouteModule[] = [
    {
      id: "pedal",
      label: "Pedal",
      caption: "Precision Drive",
      enabled: state.pedalOn,
      icon: <Zap size={14} />,
      onToggle: noop,
      onEdit: noop,
    },
    {
      id: "amp",
      label: "Amp",
      caption: `Clean Twin A2 · ${Math.round(-12 + state.input * 14)} dB`,
      enabled: true,
      icon: <Activity size={14} />,
      onEdit: noop,
    },
    {
      id: "cab",
      label: "Cab",
      caption: "4×12 V30 · SM57",
      enabled: true,
      icon: <Speaker size={14} />,
      onToggle: noop,
      onEdit: noop,
    },
  ];
  const reorderablePost: NAMSignalChainPostModule[] = state.postOrder.map((id, index) => ({
    id,
    ...POST[id],
    enabled: true,
    onToggle: noop,
    onEdit: noop,
    canMoveLeft: index > 0,
    canMoveRight: index < state.postOrder.length - 1,
    onMoveLeft: noop,
    onMoveRight: noop,
  }));
  const tail: NAMSignalChainRouteModule[] = [
    { id: "output", label: "Output", caption: "−1.2 dB · stereo", enabled: true, icon: <AudioWaveform size={14} />, onEdit: noop },
  ];

  return (
    <StageFrame
      className={`daw-nam-chain-stage ${className ?? ""}`.trim()}
      data={{ focus: state.focus, locked: state.locked }}
      height={STAGE_HEIGHT}
      label="OpenStudio NAM Rack signal chain: gate, pedal, amp, cab, then EQ, modulation, delay, and reverb; a pedal is bypassed, the delay moved earlier, and the order locked."
      outerRef={outerRef}
      scale={scale}
      width={STAGE_WIDTH}
    >
      {/* Rack header behind the chain panel */}
      <div className="flex items-center gap-2 px-4 h-11 shrink-0 border-b border-white/10 bg-[#0d0f12] text-[12px] text-neutral-300">
        <Disc3 className="text-amber-300" size={12} />
        <strong className="text-neutral-100 tracking-wide">NAM RACK</strong>
        <span className="text-neutral-500">Clean Twin Style A2 · Guitar</span>
        <span className="ml-auto text-[9px] uppercase tracking-wider text-amber-300/90">Signal chain</span>
      </div>
      <div className="relative flex-1 bg-[radial-gradient(circle_at_50%_0%,rgba(219,153,66,0.10),transparent_55%),linear-gradient(180deg,#121417,#07090b)]">
        <NAMCompactChain
          captureCore={captureCore}
          fixedPre={fixedPre}
          onClose={noop}
          onResetPostOrder={noop}
          onTogglePostOrderLock={noop}
          postOrderLocked={state.locked}
          reorderablePost={reorderablePost}
          resetPostOrderDisabled={state.postOrder.join() === "eq,mod,delay,reverb"}
          tail={tail}
        />
      </div>
    </StageFrame>
  );
};

export default NamChainStage;
