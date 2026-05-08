import { useEffect, useRef } from "react";
import type { FeatureSceneCompositorState } from "@/components/scene/FeatureSceneCompositor";
import type { AccentTone } from "@/data/marketing";
import { cn } from "@/lib/utils";

interface StarFieldProps {
  stateRef: React.MutableRefObject<FeatureSceneCompositorState>;
  accentByIndex: AccentTone[];
  density?: number;
  className?: string;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  depth: number;
  twinklePhase: number;
  twinkleSpeed: number;
  driftX: number;
  driftY: number;
}

const ACCENT_TO_RGB: Record<AccentTone, [number, number, number]> = {
  lavender: [199, 180, 255],
  amber: [255, 201, 113],
  emerald: [116, 241, 169],
  frost: [185, 231, 255],
};

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

const makeStars = (count: number, width: number, height: number): Star[] => {
  const random = mulberry32(0xa113f1e);
  return Array.from({ length: count }, () => {
    const depth = 0.35 + random() * 0.9;
    return {
      x: random() * width,
      y: random() * height,
      radius: 0.35 + random() * 1.7,
      baseAlpha: 0.18 + random() * 0.6,
      depth,
      twinklePhase: random() * Math.PI * 2,
      twinkleSpeed: 0.4 + random() * 0.9,
      driftX: (random() - 0.5) * 0.04,
      driftY: (random() - 0.5) * 0.04,
    };
  });
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const FRAME_INTERVAL_MS = 1000 / 30;

const StarField = ({ stateRef, accentByIndex, density = 1, className }: StarFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hardware = navigator.hardwareConcurrency ?? 4;
    const targetCount = Math.round((hardware >= 4 ? 220 : 120) * density);
    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let lastWidth = 0;
    let lastHeight = 0;
    let currentAccent: [number, number, number] = ACCENT_TO_RGB.lavender;
    const startTime = performance.now();
    let rafId = 0;
    let lastPaintAt = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = bounds.width;
      height = bounds.height;
      const pixelW = Math.max(1, Math.round(width * dpr));
      const pixelH = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
      }
      if (lastWidth !== width || lastHeight !== height) {
        stars = makeStars(targetCount, width, height);
        lastWidth = width;
        lastHeight = height;
      }
    };

    const render = (now: number) => {
      if (now - lastPaintAt < FRAME_INTERVAL_MS) {
        rafId = window.requestAnimationFrame(render);
        return;
      }
      lastPaintAt = now;

      resize();

      const dpr = window.devicePixelRatio || 1;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const state = stateRef.current;
      const activeIndex = Math.max(0, Math.min(accentByIndex.length - 1, state.activeIndex ?? 0));
      const targetAccent = ACCENT_TO_RGB[accentByIndex[activeIndex] ?? "lavender"];
      // smoothly drift to target accent
      currentAccent = [
        lerp(currentAccent[0], targetAccent[0], 0.06),
        lerp(currentAccent[1], targetAccent[1], 0.06),
        lerp(currentAccent[2], targetAccent[2], 0.06),
      ];

      const time = (performance.now() - startTime) / 1000;
      const sceneProgress = state.sceneProgress ?? 0;
      const introProgress = state.introProgress ?? 0;
      const transitionActive = state.transitionActive ?? 0;
      const pointerActive = (state.pointerActive ?? 0) * (1 - (state.burnProgress ?? 0) * 0.4);
      const pointerX = (state.pointerX ?? 0) * pointerActive * 18;
      const pointerY = (state.pointerY ?? 0) * pointerActive * 12;
      const energy = (0.68 + introProgress * 0.18 + sceneProgress * 0.1) * (1 - transitionActive * 0.82);

      for (const star of stars) {
        const driftT = prefersReducedMotion ? 0 : time * 0.035;
        const x = star.x + star.driftX * driftT * width + pointerX * star.depth;
        const y =
          ((star.y + star.driftY * driftT * height + pointerY * star.depth) % (height + 40) + (height + 40)) %
          (height + 40);

        const twinkle = prefersReducedMotion ? 1 : 0.6 + Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.4;
        const alpha = Math.max(0, Math.min(1, star.baseAlpha * twinkle * energy));

        context.beginPath();
        context.fillStyle = `rgba(${currentAccent[0]},${currentAccent[1]},${currentAccent[2]},${alpha})`;
        context.arc(x, y, star.radius * (0.7 + star.depth * 0.5), 0, Math.PI * 2);
        context.fill();

        if (star.radius > 1.4 && !prefersReducedMotion) {
          // subtle halo for the larger stars
          context.beginPath();
          context.fillStyle = `rgba(${currentAccent[0]},${currentAccent[1]},${currentAccent[2]},${alpha * 0.14})`;
          context.arc(x, y, star.radius * 3.2, 0, Math.PI * 2);
          context.fill();
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [stateRef, accentByIndex, density]);

  return (
    <canvas
      aria-hidden="true"
      className={cn("feature-starfield pointer-events-none absolute inset-0", className)}
      ref={canvasRef}
    />
  );
};

export default StarField;
