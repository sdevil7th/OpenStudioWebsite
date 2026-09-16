// Props-only fork of the docked mixer in OpenStudio
// frontend/src/components/MixerPanel.tsx and the drag handle from
// SortableTrack.tsx (@ d2056151222fefcede123ef614ec38c6893cbfd5): the panel
// header, the snapshots toolbar, the master strip first, a divider, the track
// strips under their coloured handles, and the Monitor FX slot. Store state
// and drag-and-drop are props and markup only.
import { memo, type ReactNode } from "react";
import { ExternalLink, Plus, Save, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelStripLite, type ChannelStripLiteProps } from "./ChannelStripLite";
import { DawButton } from "./DawButton";

export const MIXER_HEADER_HEIGHT = 20;
export const MIXER_SNAPSHOT_BAR_HEIGHT = 24;

export interface MixerPanelLiteProps {
  height: number;
  strips: ChannelStripLiteProps[];
  master: Pick<ChannelStripLiteProps, "volumeDb" | "level" | "clipping" | "muted" | "mono">;
  snapshots?: string[];
  activeSnapshot?: string;
  /** Replaces the Monitor FX slot (the hero puts the NAM Rack there). */
  aside?: ReactNode;
}

const MonitorFx = () => (
  <div className="flex flex-col shrink-0 w-[140px] bg-neutral-800/60 border border-dashed border-amber-700/40 rounded mx-0.5 overflow-hidden">
    <div className="flex items-center justify-between px-2 py-1 bg-amber-900/20 border-b border-amber-700/30">
      <span className="text-[9px] font-semibold text-amber-400 uppercase tracking-wider">Monitor FX</span>
      <span className="text-amber-500" title="Add Monitor FX">
        <Plus size={12} />
      </span>
    </div>
    <div className="px-2 py-0.5 bg-amber-900/10 border-b border-amber-700/20">
      <span className="text-[8px] text-amber-600 italic">Monitor Only — not in renders</span>
    </div>
    <div className="flex-1 p-1">
      <div className="text-[9px] text-neutral-500 text-center py-4 px-1">No monitoring plugins. Click + to add.</div>
    </div>
  </div>
);

export const MixerPanelLite = memo(function MixerPanelLite({ height, strips, master, snapshots = [], activeSnapshot, aside }: MixerPanelLiteProps) {
  return (
    <section aria-label="Mixer" className="bg-neutral-800 border-t-2 border-neutral-950 flex flex-col shrink-0 overflow-hidden min-h-0 min-w-0" style={{ height }}>
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-700 flex items-center justify-between px-2 shrink-0" style={{ height: MIXER_HEADER_HEIGHT }}>
        <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">Mixer</span>
        <div className="flex items-center gap-0.5">
          <DawButton aria-label="Detach mixer into separate window" className="h-4 w-4" size="icon-sm" title="Pop Out Mixer" variant="ghost">
            <ExternalLink size={10} />
          </DawButton>
          <DawButton aria-label="Close mixer panel" className="h-4 w-4" size="icon-sm" title="Close Mixer" variant="ghost">
            <X size={12} />
          </DawButton>
        </div>
      </div>

      {/* Mixer Snapshots Toolbar */}
      <div className="bg-neutral-900/60 border-b border-neutral-700/50 flex items-center gap-1 px-2 shrink-0 overflow-hidden" style={{ height: MIXER_SNAPSHOT_BAR_HEIGHT }}>
        <span className="text-[9px] text-neutral-500 uppercase tracking-wider mr-1 whitespace-nowrap">Snapshots</span>
        {snapshots.map((name) => (
          <span key={name} className="flex items-center gap-0.5 shrink-0">
            <span
              className={cn("px-2 py-0.5 text-[10px] leading-3 rounded whitespace-nowrap transition-colors", name === activeSnapshot ? "bg-neutral-600 text-white" : "bg-neutral-700 text-neutral-300")}
              title={`Recall "${name}"`}
            >
              {name}
            </span>
            <span className="text-neutral-500" title={`Delete "${name}"`}>
              <Trash2 size={10} />
            </span>
          </span>
        ))}
        <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] leading-3 bg-neutral-700/50 text-neutral-400 rounded whitespace-nowrap" title="Save current mixer state as snapshot">
          <Save size={10} />
          Save
        </span>
      </div>

      {/* Channel Strips Container */}
      <div className="relative flex-1 flex overflow-hidden bg-neutral-900 p-1 gap-px pl-0 min-h-0 min-w-0">
        <ChannelStripLite hasFx isMaster name="Master" pan={0} trackIndex={-1} {...master} />
        <div className="w-px bg-neutral-600 shrink-0 my-1" />
        {strips.map((strip) => (
          <div key={strip.name} className="h-full flex shrink-0">
            <div className="relative h-full flex flex-col">
              <div className="h-3 w-full flex items-center justify-center mb-0.5 rounded-t-sm" style={{ backgroundColor: strip.color || "#171717" }} title="Drag to reorder">
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-0.5 bg-white/50 rounded-full" />
                  <div className="w-0.5 h-0.5 bg-white/50 rounded-full" />
                  <div className="w-0.5 h-0.5 bg-white/50 rounded-full" />
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <ChannelStripLite {...strip} />
              </div>
            </div>
          </div>
        ))}
        <div className="w-px bg-neutral-600 shrink-0 my-1" />
        {aside ?? <MonitorFx />}
      </div>
    </section>
  );
});
