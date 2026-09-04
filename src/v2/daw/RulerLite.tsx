// SVG re-draw of OpenStudio frontend/src/components/TimelineRuler.tsx and the
// "ruler" Playhead (@ d2056151222fefcede123ef614ec38c6893cbfd5). Upstream
// renders these with react-konva; the website has no Konva, so the same
// geometry and colours (#0a0a0a ground, #555/#888 bar ticks, #444/#666 beat
// ticks, amber loop range, #4cc9f0 playhead) are drawn as plain SVG.
import { memo } from "react";

export const TIMELINE_RULER_HEIGHT = 30;

interface RulerLiteProps {
  width: number;
  pixelsPerSecond: number;
  tempo: number;
  timeSignature: { numerator: number; denominator: number };
  playheadSeconds: number;
  loopRange?: readonly [number, number];
  loopEnabled?: boolean;
  height?: number;
}

const RulerMarks = memo(function RulerMarks({
  width,
  pixelsPerSecond,
  tempo,
  timeSignature,
  height,
}: Pick<RulerLiteProps, "width" | "pixelsPerSecond" | "tempo" | "timeSignature"> & { height: number }) {
  const secondsPerBeat = 60 / tempo;
  const beatsPerBar = timeSignature.numerator;
  const totalBeats = Math.ceil(width / pixelsPerSecond / secondsPerBeat) + 1;
  const marks = [];
  for (let beat = 0; beat < totalBeats; beat += 1) {
    const x = Math.round(beat * secondsPerBeat * pixelsPerSecond) + 0.5;
    const isBar = beat % beatsPerBar === 0;
    marks.push(
      <line
        key={`t${beat}`}
        stroke={isBar ? "#555" : "#444"}
        strokeWidth={1}
        x1={x}
        x2={x}
        y1={isBar ? height - 14 : height - 7}
        y2={height}
      />,
    );
    if (isBar) {
      marks.push(
        <text key={`l${beat}`} fill="#888" fontFamily="JetBrains Mono, Consolas, monospace" fontSize={10} x={x + 3} y={11}>
          {beat / beatsPerBar + 1}
        </text>,
      );
    } else {
      marks.push(
        <text key={`b${beat}`} fill="#666" fontFamily="JetBrains Mono, Consolas, monospace" fontSize={9} x={x + 2} y={height - 9}>
          {(beat % beatsPerBar) + 1}
        </text>,
      );
    }
  }
  return <>{marks}</>;
});

export const RulerLite = ({
  width,
  pixelsPerSecond,
  tempo,
  timeSignature,
  playheadSeconds,
  loopRange,
  loopEnabled = false,
  height = TIMELINE_RULER_HEIGHT,
}: RulerLiteProps) => {
  const playheadX = Math.min(width, Math.max(0, playheadSeconds * pixelsPerSecond));
  const loopX = loopRange ? loopRange[0] * pixelsPerSecond : 0;
  const loopW = loopRange ? (loopRange[1] - loopRange[0]) * pixelsPerSecond : 0;
  return (
    <svg
      aria-hidden="true"
      className="block shrink-0"
      height={height}
      role="presentation"
      style={{ display: "block" }}
      width={width}
    >
      <rect fill="#0a0a0a" height={height} width={width} x={0} y={0} />
      {loopRange && (
        <g opacity={loopEnabled ? 1 : 0.35}>
          <rect fill="#f59e0b" height={height} opacity={0.5} width={loopW} x={loopX} y={0} />
          <rect fill="#f59e0b" height={height} stroke="#b45309" strokeWidth={1} width={5} x={loopX} y={0} />
          <rect fill="#f59e0b" height={height} stroke="#b45309" strokeWidth={1} width={5} x={loopX + loopW - 5} y={0} />
        </g>
      )}
      <RulerMarks height={height} pixelsPerSecond={pixelsPerSecond} tempo={tempo} timeSignature={timeSignature} width={width} />
      <line stroke="#333" strokeWidth={1} x1={0} x2={width} y1={height - 0.5} y2={height - 0.5} />
      {/* Playhead: upstream's "ruler" variant is a 12 px cyan block at 30 %. */}
      <g style={{ transform: `translateX(${playheadX}px)`, willChange: "transform" }}>
        <rect fill="#4cc9f0" height={height} opacity={0.3} width={12} x={-6} y={0} />
        <line stroke="#4cc9f0" strokeWidth={1} x1={0.5} x2={0.5} y1={0} y2={height} />
      </g>
    </svg>
  );
};

/** The 1 px cyan line that continues the playhead down through the lanes. */
export const PlayheadLine = ({ x, height }: { x: number; height: number }) => (
  <div
    aria-hidden="true"
    className="absolute top-0 left-0 pointer-events-none"
    style={{
      height,
      width: 1,
      background: "#4cc9f0",
      transform: `translateX(${x}px)`,
      willChange: "transform",
      boxShadow: "0 0 6px rgba(76, 201, 240, 0.55)",
    }}
  />
);
