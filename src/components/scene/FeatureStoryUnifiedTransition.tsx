import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { createPortal } from "react-dom";
import {
  clamp,
  drawTransitionAsset,
  easeInOutCubic,
  easeOutCubic,
  getTransitionPhases,
  lerp,
  phaseProgress,
  type FeatureSceneCompositorState,
} from "@/components/scene/FeatureSceneCompositor";
import type { AccentTone, FeatureChapter } from "@/data/marketing";
import { cn } from "@/lib/utils";

interface FeatureStoryUnifiedTransitionProps {
  chapters: FeatureChapter[];
  stateRef: MutableRefObject<FeatureSceneCompositorState>;
  className?: string;
}

interface SweepParticle {
  x: number;
  y: number;
  radius: number;
  drift: number;
  phase: number;
}

const DPR_FALLBACK = 1;

const accentRgb: Record<AccentTone, [number, number, number]> = {
  lavender: [199, 180, 255],
  amber: [255, 201, 113],
  emerald: [116, 241, 169],
  frost: [185, 231, 255],
};

const syncCanvasSize = (target: HTMLCanvasElement, width: number, height: number) => {
  if (target.width !== width || target.height !== height) {
    target.width = width;
    target.height = height;
  }
};

const isImageReady = (image: HTMLImageElement | undefined) => Boolean(image?.complete && image.naturalWidth > 0);

const ensureImageSource = (images: Map<string, HTMLImageElement>, src: string) => {
  const existing = images.get(src);
  if (existing) {
    return existing;
  }

  const image = new Image();
  image.decoding = "async";
  image.loading = "eager";
  image.src = src;
  images.set(src, image);
  return image;
};

const collectTransitionSources = (chapter: FeatureChapter) =>
  [
    chapter.transitionProfile?.curatedMatteSrc,
    chapter.transitionProfile?.authoredBridge?.collapseFieldSrc,
    chapter.transitionProfile?.authoredBridge?.remnantEtchedSrc,
    chapter.transitionProfile?.authoredBridge?.voidCoreSrc,
    chapter.transitionProfile?.authoredBridge?.voidEdgeSrc,
    chapter.transitionProfile?.authoredBridge?.arrivalMatteSrc,
  ].filter((src): src is string => Boolean(src));

const buildParticles = (count: number): SweepParticle[] =>
  Array.from({ length: count }, (_, index) => {
    const lane = index / Math.max(1, count - 1);
    return {
      x: 0.08 + ((index * 37) % 89) / 105,
      y: 0.18 + lane * 0.68,
      radius: 1.4 + (index % 5) * 0.7,
      drift: ((index * 19) % 31) / 30 - 0.5,
      phase: ((index * 43) % 100) / 100,
    };
  });

const FeatureStoryUnifiedTransition = ({ chapters, stateRef, className }: FeatureStoryUnifiedTransitionProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const particlesRef = useRef<SweepParticle[]>(buildParticles(42));

  useEffect(() => {
    const loadChapter = (index: number) => {
      const chapter = chapters[index];
      if (!chapter) {
        return;
      }

      collectTransitionSources(chapter).forEach((src) => ensureImageSource(imagesRef.current, src));
    };

    loadChapter(0);
    loadChapter(1);

    const idleId = window.setTimeout(() => {
      chapters.forEach((_, index) => loadChapter(index));
    }, 1800);

    return () => window.clearTimeout(idleId);
  }, [chapters]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let rafId = 0;
    const renderStartedAt = performance.now();

    const render = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const dpr = window.devicePixelRatio || DPR_FALLBACK;
      const pixelWidth = Math.max(1, Math.round(width * dpr));
      const pixelHeight = Math.max(1, Math.round(height * dpr));
      syncCanvasSize(canvas, pixelWidth, pixelHeight);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const state = stateRef.current;
      const portalOpacity = Number.parseFloat(
        document.documentElement.style.getPropertyValue("--feature-story-portal-opacity") || "0",
      );

      if (portalOpacity <= 0.001 || state.reducedMotion || state.transitionActive <= 0.001) {
        rafId = window.requestAnimationFrame(render);
        return;
      }

      const fromIndex = clamp(state.fromIndex ?? state.activeIndex ?? 0, 0, chapters.length - 1);
      const toIndex = clamp(state.toIndex ?? state.nextIndex ?? fromIndex, 0, chapters.length - 1);
      const fromChapter = chapters[fromIndex];
      const toChapter = chapters[toIndex] ?? fromChapter;

      if (!fromChapter || !toChapter || fromIndex === toIndex) {
        rafId = window.requestAnimationFrame(render);
        return;
      }

      const authoredBridge = fromChapter.transitionProfile?.authoredBridge;
      if (!authoredBridge) {
        rafId = window.requestAnimationFrame(render);
        return;
      }

      const transitionSources = collectTransitionSources(fromChapter);
      transitionSources.forEach((src) => ensureImageSource(imagesRef.current, src));

      const phases = getTransitionPhases(fromChapter.transitionProfile);
      const progress = clamp(state.transitionProgress ?? 0, 0, 1);
      const collapse = easeInOutCubic(phaseProgress(progress, phases.collapseStart, phases.voidPeak));
      const bridge = easeInOutCubic(phaseProgress(progress, phases.voidPeak, phases.arrivalStart));
      const arrival = easeOutCubic(phaseProgress(progress, phases.arrivalStart, phases.settleEnd));
      const settle = clamp(state.settleProgress ?? 0, 0, 1);
      const direction = state.transitionDirection === -1 ? -1 : 1;
      const sweep = clamp(Math.max(collapse * 0.5, bridge) * (1 - arrival * 0.86), 0, 1);
      const overlayAlpha = clamp(portalOpacity * (sweep * 0.56 + collapse * 0.1) * (1 - settle * 0.24), 0, 0.58);

      if (overlayAlpha <= 0.004) {
        rafId = window.requestAnimationFrame(render);
        return;
      }

      const fromRgb = accentRgb[fromChapter.accent ?? "lavender"];
      const toRgb = accentRgb[toChapter.accent ?? fromChapter.accent ?? "lavender"];
      const rgb = [
        lerp(fromRgb[0], toRgb[0], arrival),
        lerp(fromRgb[1], toRgb[1], arrival),
        lerp(fromRgb[2], toRgb[2], arrival),
      ];
      const time = (performance.now() - renderStartedAt) / 1000;
      const sweepX = lerp(direction > 0 ? -width * 0.18 : width * 1.18, width * 0.5, bridge);
      const sweepY = height * (0.46 + Math.sin(time * 0.34) * 0.025);

      context.save();
      context.globalAlpha = overlayAlpha;
      const wash = context.createRadialGradient(sweepX, sweepY, 0, sweepX, sweepY, width * 0.82);
      wash.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.16)`);
      wash.addColorStop(0.28, "rgba(10, 14, 24, 0.25)");
      wash.addColorStop(0.72, "rgba(2, 4, 10, 0.18)");
      wash.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = wash;
      context.fillRect(0, 0, width, height);
      context.restore();

      context.save();
      context.globalCompositeOperation = "screen";
      context.globalAlpha = clamp(overlayAlpha * 0.82, 0, 0.52);
      context.lineCap = "round";
      for (let index = 0; index < 9; index += 1) {
        const t = index / 8;
        const y = height * (0.2 + t * 0.62) + Math.sin(time * 0.42 + index) * 18;
        const offset = (t - 0.5) * width * 0.1;
        context.beginPath();
        context.moveTo(sweepX - direction * width * 0.42 + offset, y - height * 0.08);
        context.bezierCurveTo(
          sweepX - direction * width * 0.18,
          y - height * 0.12,
          sweepX + direction * width * 0.2,
          y + height * 0.12,
          sweepX + direction * width * 0.48 + offset,
          y + height * 0.04,
        );
        context.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${0.22 + sweep * 0.36})`;
        context.lineWidth = 1 + index * 0.26;
        context.stroke();
      }
      context.restore();

      const collapseField = imagesRef.current.get(authoredBridge.collapseFieldSrc);
      const remnant = imagesRef.current.get(authoredBridge.remnantEtchedSrc);
      const voidEdge = imagesRef.current.get(authoredBridge.voidEdgeSrc);
      const arrivalMatte = imagesRef.current.get(authoredBridge.arrivalMatteSrc);

      context.save();
      context.globalCompositeOperation = "screen";
      if (collapseField && isImageReady(collapseField)) {
        drawTransitionAsset(context, collapseField, width, height, {
          alpha: clamp(overlayAlpha * (collapse * 0.22 + bridge * 0.08), 0, 0.16),
          scale: lerp(0.96, 1.08, Math.max(collapse, bridge)),
          offsetX: direction * lerp(-width * 0.08, width * 0.02, bridge),
          offsetY: lerp(height * 0.014, -height * 0.01, bridge),
          rotation: direction * lerp(-0.012, 0.004, bridge),
          compositeOperation: "lighter",
        });
      }

      if (remnant && isImageReady(remnant)) {
        drawTransitionAsset(context, remnant, width, height, {
          alpha: clamp(overlayAlpha * (collapse * 0.08 + bridge * 0.12) * (1 - arrival * 0.68), 0, 0.12),
          scale: lerp(1, 1.05, bridge),
          offsetX: direction * lerp(-width * 0.035, width * 0.01, bridge),
          offsetY: lerp(height * 0.008, -height * 0.006, bridge),
          rotation: direction * lerp(-0.006, 0.003, bridge),
        });
      }

      if (voidEdge && isImageReady(voidEdge)) {
        drawTransitionAsset(context, voidEdge, width, height, {
          alpha: clamp(overlayAlpha * bridge * (1 - arrival * 0.78), 0, 0.18),
          scale: lerp(0.88, authoredBridge.edgeScale ?? 1.1, bridge),
          offsetX: direction * lerp(-width * 0.06, width * 0.015, bridge),
          offsetY: lerp(height * 0.012, -height * 0.008, bridge),
          rotation: direction * lerp(-0.01, 0.004, bridge),
        });
      }

      if (arrivalMatte && isImageReady(arrivalMatte) && arrival > 0.04) {
        drawTransitionAsset(context, arrivalMatte, width, height, {
          alpha: clamp(overlayAlpha * arrival * (1 - arrival * 0.64), 0, 0.12),
          scale: lerp(1.1, 1.01, arrival),
          offsetX: direction * lerp(-width * 0.025, 0, arrival),
          offsetY: lerp(height * 0.01, 0, arrival),
          rotation: direction * lerp(-0.005, 0, arrival),
        });
      }
      context.restore();

      context.save();
      context.globalCompositeOperation = "lighter";
      particlesRef.current.forEach((particle, index) => {
        const drift = Math.sin(time * 0.7 + particle.phase * Math.PI * 2) * particle.drift;
        const x = (particle.x + direction * (bridge - 0.5) * 0.32 + drift * 0.025) * width;
        const y = (particle.y + Math.cos(time * 0.5 + index) * 0.018) * height;
        const alpha = overlayAlpha * (0.12 + (index % 4) * 0.026) * (1 - arrival * 0.44);
        context.beginPath();
        context.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
        context.arc(x, y, particle.radius * (1 + bridge * 1.4), 0, Math.PI * 2);
        context.fill();
      });
      context.restore();

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => window.cancelAnimationFrame(rafId);
  }, [chapters, stateRef]);

  return createPortal(
    <canvas aria-hidden="true" className={cn("feature-story-unified-transition", className)} ref={canvasRef} />,
    document.body,
  );
};

export default FeatureStoryUnifiedTransition;
