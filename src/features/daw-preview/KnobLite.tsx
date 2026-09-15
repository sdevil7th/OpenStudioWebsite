// Display-only fork of OpenStudio frontend/src/components/ui/Knob/Knob.tsx
// (@ d2056151222fefcede123ef614ec38c6893cbfd5): the SVG (270° track arc, tick
// marks, value fill with glow, centre dot with the V/P letter, indicator line)
// is kept as-is; pointer, wheel and keyboard editing and the tooltip are
// dropped. `size` is a diameter so the compact track header can use 20 px.
import { memo } from "react";

const START_ANGLE = 225;
const END_ANGLE = 495;
const ARC_SWEEP = END_ANGLE - START_ANGLE;

const FILL_COLORS: Record<string, string> = {
  default: "#0078d4",
  volume: "#4caf50",
  pan: "#16a34a",
};

const valueToAngle = (value: number, min: number, max: number) => {
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return START_ANGLE + ratio * ARC_SWEEP;
};

const angleToPoint = (angleDeg: number, radius: number, cx: number, cy: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
};

const describeArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
  if (Math.abs(endAngle - startAngle) < 0.1) return "";
  const start = angleToPoint(startAngle, radius, cx, cy);
  const end = angleToPoint(endAngle, radius, cx, cy);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

export interface KnobLiteProps {
  min: number;
  max: number;
  value: number;
  variant?: "default" | "volume" | "pan";
  /** Diameter in px (upstream: sm 24, md 30). */
  size?: number;
  label?: string;
  bipolarCenter?: number;
  className?: string;
}

export const KnobLite = memo(function KnobLite({ min, max, value, variant = "default", size = 24, label, bipolarCenter, className }: KnobLiteProps) {
  const diameter = size;
  const cx = diameter / 2;
  const cy = diameter / 2;
  const trackR = diameter / 2 - 2.5;
  const indicatorInnerR = trackR * 0.5;
  const fillColor = FILL_COLORS[variant] || FILL_COLORS.default;
  const currentAngle = valueToAngle(value, min, max);

  let fillStartAngle = START_ANGLE;
  let fillEndAngle = currentAngle;
  if (bipolarCenter !== undefined) {
    const centerAngle = valueToAngle(bipolarCenter, min, max);
    if (Math.abs(value - bipolarCenter) < (max - min) * 0.005) {
      fillStartAngle = centerAngle;
      fillEndAngle = centerAngle;
    } else if (value > bipolarCenter) {
      fillStartAngle = centerAngle;
      fillEndAngle = currentAngle;
    } else {
      fillStartAngle = currentAngle;
      fillEndAngle = centerAngle;
    }
  }

  const indicatorInner = angleToPoint(currentAngle, indicatorInnerR, cx, cy);
  const indicatorOuter = angleToPoint(currentAngle, trackR, cx, cy);
  const tickAngles = [START_ANGLE, START_ANGLE + ARC_SWEEP / 2, END_ANGLE];
  if (bipolarCenter !== undefined) tickAngles.push(valueToAngle(bipolarCenter, min, max));

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className ?? ""}`}
      style={{ width: diameter, height: diameter }}
      role="slider"
      aria-label={label ?? "Parameter"}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`} className="block">
        <path d={describeArc(cx, cy, trackR, START_ANGLE, END_ANGLE)} fill="none" stroke="#2a2a2a" strokeWidth={2.5} strokeLinecap="round" />
        <path d={describeArc(cx, cy, trackR, START_ANGLE, END_ANGLE)} fill="none" stroke="#3a3a3a" strokeWidth={1.5} strokeLinecap="round" />
        {tickAngles.map((angle, index) => {
          const outer = angleToPoint(angle, trackR + 1.5, cx, cy);
          const inner = angleToPoint(angle, trackR - 0.5, cx, cy);
          return <line key={index} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#555" strokeWidth={0.6} strokeLinecap="round" />;
        })}
        {Math.abs(fillEndAngle - fillStartAngle) > 0.1 && (
          <>
            <path d={describeArc(cx, cy, trackR, fillStartAngle, fillEndAngle)} fill="none" stroke={fillColor} strokeWidth={3.5} strokeLinecap="round" opacity={0.25} />
            <path d={describeArc(cx, cy, trackR, fillStartAngle, fillEndAngle)} fill="none" stroke={fillColor} strokeWidth={2} strokeLinecap="round" />
          </>
        )}
        <circle cx={cx} cy={cy} r={diameter * 0.18} fill="#1a1a1a" stroke="#444" strokeWidth={0.5} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#666" fontSize={diameter * 0.28} fontWeight="bold" fontFamily="sans-serif" style={{ pointerEvents: "none" }}>
          {variant === "volume" ? "V" : variant === "pan" ? "P" : ""}
        </text>
        <line x1={indicatorInner.x} y1={indicatorInner.y} x2={indicatorOuter.x} y2={indicatorOuter.y} stroke="#ccc" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    </div>
  );
});
