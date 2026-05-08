import { useEffect, useMemo, useRef } from "react";
import type { FeatureSceneCompositorState } from "@/components/scene/FeatureSceneCompositor";
import type { AccentTone, FeatureChapter } from "@/data/marketing";
import { cn } from "@/lib/utils";

interface ConstellationFieldProps {
  chapters: FeatureChapter[];
  stateRef: React.MutableRefObject<FeatureSceneCompositorState>;
  className?: string;
}

interface ConstellationShape {
  points: Array<{ x: number; y: number; r: number }>;
  polyline: string;
  totalLength: number;
}

const ACCENT_STROKE: Record<AccentTone, string> = {
  lavender: "rgba(199,180,255,0.72)",
  amber: "rgba(255,201,113,0.7)",
  emerald: "rgba(116,241,169,0.7)",
  frost: "rgba(185,231,255,0.7)",
};
const FRAME_INTERVAL_MS = 1000 / 24;

const mulberry32 = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const buildShape = (seed: number, viewWidth: number, viewHeight: number, nodeCount: number): ConstellationShape => {
  const random = mulberry32(seed);
  const points: Array<{ x: number; y: number; r: number }> = [];

  // Place nodes in a loose organic meander across the viewport
  const marginX = viewWidth * 0.08;
  const marginY = viewHeight * 0.12;
  const usableW = viewWidth - marginX * 2;
  const usableH = viewHeight - marginY * 2;

  for (let i = 0; i < nodeCount; i += 1) {
    const t = i / (nodeCount - 1);
    const swing = Math.sin(t * Math.PI * (1.4 + random() * 1.2) + random() * Math.PI * 2);
    const x = marginX + t * usableW + swing * usableW * 0.12;
    const y = marginY + usableH * (0.2 + random() * 0.8) + swing * usableH * 0.1;
    const r = 1.4 + random() * 2.8;
    points.push({ x, y, r });
  }

  // Compute polyline + length
  let d = "";
  let total = 0;
  points.forEach((p, i) => {
    if (i === 0) {
      d = `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    } else {
      const prev = points[i - 1]!;
      const dx = p.x - prev.x;
      const dy = p.y - prev.y;
      total += Math.sqrt(dx * dx + dy * dy);
      d += ` L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    }
  });

  return { points, polyline: d, totalLength: total };
};

const ConstellationField = ({ chapters, stateRef, className }: ConstellationFieldProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const nodeGroupRefs = useRef<Array<SVGGElement | null>>([]);

  // Use a fixed virtual viewBox so shapes are resolution-independent
  const viewWidth = 1600;
  const viewHeight = 900;

  const shapes = useMemo<ConstellationShape[]>(
    () =>
      chapters.map((chapter, index) => {
        const seed = hashString(chapter.id) ^ (index * 97);
        const nodeCount = 12 + (seed % 6);
        return buildShape(seed, viewWidth, viewHeight, nodeCount);
      }),
    [chapters],
  );

  useEffect(() => {
    // Initialize dasharray / offset for each path
    pathRefs.current.forEach((path, index) => {
      if (!path) {
        return;
      }
      const length = shapes[index]?.totalLength ?? 0;
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    });
  }, [shapes]);

  useEffect(() => {
    let rafId = 0;
    let lastPaintAt = 0;

    const render = (now: number) => {
      if (now - lastPaintAt < FRAME_INTERVAL_MS) {
        rafId = window.requestAnimationFrame(render);
        return;
      }
      lastPaintAt = now;

      const state = stateRef.current;
      const activeIndex = Math.max(0, Math.min(chapters.length - 1, state.activeIndex ?? 0));
      const intro = Math.max(0, Math.min(1, state.introProgress ?? 0));
      const scene = Math.max(0, Math.min(1, state.sceneProgress ?? 0));
      const handoff = Math.max(0, Math.min(1, state.handoffProgress ?? 0));
      const transitionActive = Math.max(0, Math.min(1, state.transitionActive ?? 0));
      const pointerActive = Math.max(0, Math.min(1, state.pointerActive ?? 0)) * (1 - Math.max(0, Math.min(1, state.burnProgress ?? 0)) * 0.45);
      const pointerX = Math.max(-1, Math.min(1, state.pointerX ?? 0)) * pointerActive;
      const pointerY = Math.max(-1, Math.min(1, state.pointerY ?? 0)) * pointerActive;

      layerRefs.current.forEach((layer, index) => {
        if (!layer) {
          return;
        }
        const isActive = index === activeIndex;
        const path = pathRefs.current[index];
        const nodeGroup = nodeGroupRefs.current[index];
        const length = shapes[index]?.totalLength ?? 0;
        layer.style.transform = `translate3d(${pointerX * (10 + index * 0.8)}px, ${pointerY * (8 + index * 0.6)}px, 0)`;

        if (!isActive) {
          layer.style.opacity = "0";
          if (path) {
            path.style.strokeDashoffset = `${length}`;
          }
          if (nodeGroup) {
            nodeGroup.style.opacity = "0";
          }
          return;
        }

        // Layer opacity — fades in during intro, holds during scene, dims at handoff
        const layerOpacity =
          (0.2 + 0.38 * Math.min(1, intro * 1.35 + scene * 0.45)) *
          (1 - handoff * 0.7) *
          (1 - transitionActive * 0.88);
        layer.style.opacity = String(layerOpacity);

        if (path) {
          // draw as intro→scene advance, fade at handoff
          const drawProgress = Math.max(0.38, Math.min(1, intro * 0.55 + scene * 0.8));
          path.style.strokeDashoffset = `${length * (1 - drawProgress)}`;
          path.style.opacity = String(1 - handoff * 0.85);
        }

        if (nodeGroup) {
          // nodes appear as the stroke reaches them; simple mapping
          nodeGroup.style.opacity = String((0.28 + Math.min(0.72, intro * 1.1 + scene * 0.24)) * (1 - handoff * 0.85));
        }
      });

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [stateRef, chapters, shapes]);

  return (
    <div
      aria-hidden="true"
      className={cn("feature-constellation pointer-events-none absolute inset-0", className)}
      ref={containerRef}
    >
      {chapters.map((chapter, index) => {
        const accent = chapter.accent ?? "lavender";
        const stroke = ACCENT_STROKE[accent];
        const shape = shapes[index];

        if (!shape) {
          return null;
        }

        return (
          <div
            className="feature-constellation__layer"
            data-chapter-id={chapter.id}
            key={chapter.id}
            ref={(element) => {
              layerRefs.current[index] = element;
            }}
          >
            <svg
              className="feature-constellation__svg"
              preserveAspectRatio="xMidYMid slice"
              viewBox={`0 0 ${viewWidth} ${viewHeight}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="feature-constellation__path"
                d={shape.polyline}
                fill="none"
                ref={(element) => {
                  pathRefs.current[index] = element;
                }}
                stroke={stroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.25}
              />
              <g
                className="feature-constellation__nodes"
                ref={(element) => {
                  nodeGroupRefs.current[index] = element;
                }}
              >
                {shape.points.map((point, pointIndex) => (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    fill={stroke}
                    key={pointIndex}
                    r={point.r}
                  />
                ))}
              </g>
            </svg>
          </div>
        );
      })}
    </div>
  );
};

export default ConstellationField;
