// Props-only fork of the transport / edit / view groups of OpenStudio
// frontend/src/components/MainToolbar.tsx (@ d2056151222fefcede123ef614ec38c6893cbfd5).
// Store selectors and shortcut labels become props; the tool-mode group and the
// grid/quantize popover are left out to fit the hero's 640 px stage.
import { Blend, Circle, Grid3x3, Play, Redo2, Repeat, SlidersHorizontal, Square, Undo2 } from "lucide-react";
import { DawButton } from "./DawButton";
import type { Transport } from "./types";

interface TransportLiteProps {
  transport: Transport;
  loopEnabled: boolean;
  snapEnabled: boolean;
  autoCrossfade?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  showMixer?: boolean;
  hasArmedTracks?: boolean;
  /** Rendered at the right edge (the docked clock in the hero). */
  trailing?: React.ReactNode;
}

export const TransportLite = ({
  transport,
  loopEnabled,
  snapEnabled,
  autoCrossfade = true,
  canUndo = true,
  canRedo = false,
  showMixer = true,
  hasArmedTracks = true,
  trailing,
}: TransportLiteProps) => {
  const isPlaying = transport !== "stopped";
  const isRecording = transport === "recording";
  return (
    <div
      className="relative h-12 overflow-visible bg-neutral-900 border-b border-b-neutral-950 flex items-center px-3 gap-3 shrink-0"
      role="toolbar"
      aria-label="Main Toolbar"
    >
      <div className="flex items-center gap-1" role="group" aria-label="Transport Controls">
        <DawButton variant="purple" size="icon-lg" active={loopEnabled} title="Toggle Loop" aria-label="Toggle Loop">
          <Repeat size={16} />
        </DawButton>
        <DawButton
          variant="danger"
          size="icon-lg"
          active={isRecording}
          disabled={!hasArmedTracks && !isRecording}
          title="Record"
          aria-label="Record"
        >
          <Circle size={16} fill="currentColor" />
        </DawButton>
        <DawButton variant="success" size="icon-lg" active={isPlaying} title="Play (Space)" aria-label="Play">
          <Play size={16} fill="currentColor" />
        </DawButton>
        <DawButton variant="default" size="icon-lg" disabled={!isPlaying} title="Stop (Space)" aria-label="Stop">
          <Square size={14} fill="currentColor" />
        </DawButton>
      </div>

      <div className="w-px h-6 bg-neutral-700" />

      <div className="flex items-center gap-1" role="group" aria-label="Edit Tools">
        <DawButton variant="default" size="icon-lg" disabled={!canUndo} title="Undo" aria-label="Undo">
          <Undo2 size={16} />
        </DawButton>
        <DawButton variant="default" size="icon-lg" disabled={!canRedo} title="Redo" aria-label="Redo">
          <Redo2 size={16} />
        </DawButton>
        <DawButton
          variant="default"
          size="icon-lg"
          active={snapEnabled}
          title={snapEnabled ? "Snap Enabled" : "Snap Disabled"}
          aria-label="Snap to Grid"
        >
          <Grid3x3 size={16} />
        </DawButton>
        <DawButton
          variant="default"
          size="icon-lg"
          active={autoCrossfade}
          title={autoCrossfade ? "Auto-Crossfade On" : "Auto-Crossfade Off"}
          aria-label="Auto-Crossfade"
        >
          <Blend size={16} />
        </DawButton>
      </div>

      <div className="w-px h-6 bg-neutral-700" />

      <div className="flex items-center gap-1" role="group" aria-label="View Toggles">
        <DawButton variant="default" size="icon-lg" active={showMixer} title="Toggle Mixer" aria-label="Toggle Mixer">
          <SlidersHorizontal size={16} />
        </DawButton>
      </div>

      <div style={{ flex: 1 }} />

      {trailing}
    </div>
  );
};
