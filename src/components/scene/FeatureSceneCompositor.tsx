import { useEffect, useRef } from "react";
import type { FeatureChapter, FeatureSceneFragment, FeatureTransitionProfile } from "@/data/marketing";
import type { ScreenshotAsset } from "@/data/screenshots";
import { loadScheduledImage } from "@/lib/imageScheduler";
import { cn } from "@/lib/utils";

export interface FeatureSceneCompositorState {
  activeIndex: number;
  nextIndex: number;
  fromIndex?: number;
  toIndex?: number;
  committedIndex?: number;
  visualOwnerIndex?: number;
  transitionDirection?: 1 | -1;
  transitionPhase?: "hold" | "cue" | "push" | "commit" | "destroy" | "arrive" | "settled";
  scrollProgress?: number;
  settleProgress?: number;
  ambientProgress?: number;
  loosenProgress?: number;
  destructionProgress?: number;
  reassemblyProgress?: number;
  readableProgress?: number;
  transitionProgress: number;
  burnProgress: number;
  transitionActive: number;
  introProgress: number;
  sceneProgress: number;
  handoffProgress: number;
  reducedMotion: boolean;
  fragmentStagger: number[];
  pointerX: number;
  pointerY: number;
  pointerActive: number;
  stageRect?: FeatureStoryViewportRect;
  viewportRect?: FeatureStoryViewportRect;
}

export interface FeatureStoryViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FeatureSceneCompositorProps {
  chapters: FeatureChapter[];
  stateRef: React.MutableRefObject<FeatureSceneCompositorState>;
  className?: string;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

export interface ScenePaintStyle {
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
  rotate: number;
  brightness: number;
  saturate: number;
  blur: number;
}

export interface SceneEnhance {
  fragmentStagger?: number[];
  basePaintOpacity?: number;
  pointerX?: number;
  pointerY?: number;
  pointerActive?: number;
  time?: number;
  idleStrength?: number;
}

export interface TransitionPhases {
  collapseStart: number;
  voidPeak: number;
  arrivalStart: number;
  settleEnd: number;
}

interface VoidField {
  points: Point[];
  center: Point;
  radiusX: number;
  radiusY: number;
  charWidth: number;
  emberWidth: number;
  smokeStrength: number;
  degradationDensity: number;
  tearAmount: number;
  particleDrift: number;
  remnantStrength: number;
  contourExtraction: number;
  voidShape: NonNullable<FeatureTransitionProfile["voidShape"]>;
}

const DPR_FALLBACK = 1;
const DPR_LIMIT = 1.5;
const TAU = Math.PI * 2;
const DEFAULT_COLLAPSE = 0.22;
const DEFAULT_VOID_PEAK = 0.72;
const DEFAULT_ARRIVAL = 0.9;
const DEFAULT_SETTLE = 1;

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export const lerp = (start: number, end: number, progress: number) => start + (end - start) * progress;
export const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp(value, 0, 1), 3);
export const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export const phaseProgress = (value: number, start: number, end: number) => {
  if (end <= start) {
    return value >= end ? 1 : 0;
  }

  return clamp((value - start) / (end - start), 0, 1);
};

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const idleValue = (time: number, seed: number, speed: number, phase = 0) =>
  Math.sin(time * speed + seed * 0.00021 + phase);

const edgeNoise = (value: number, seed: number) => {
  const waveA = Math.sin(value * 0.0105 + seed * 11.3) * 0.5 + 0.5;
  const waveB = Math.sin(value * 0.026 + seed * 19.7) * 0.5 + 0.5;
  const waveC = Math.cos(value * 0.041 + seed * 31.9) * 0.5 + 0.5;
  return waveA * 0.5 + waveB * 0.32 + waveC * 0.18;
};

const vectorFromAngle = (angleDegrees: number) => {
  const angle = (angleDegrees * Math.PI) / 180;
  return {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
};

export const getTransitionPhases = (profile?: FeatureTransitionProfile): TransitionPhases => {
  const collapseStart = clamp(profile?.collapseStart ?? profile?.hold ?? DEFAULT_COLLAPSE, 0, 1);
  const voidPeak = clamp(Math.max(collapseStart + 0.1, profile?.voidPeak ?? DEFAULT_VOID_PEAK), 0, 1);
  const arrivalStart = clamp(
    Math.max(
      voidPeak + 0.06,
      profile?.arrivalStart ?? Math.min(voidPeak + (profile?.bridgeHold ?? 0.15), DEFAULT_ARRIVAL),
    ),
    0,
    1,
  );
  const settleEnd = clamp(
    Math.max(arrivalStart + 0.08, profile?.settleEnd ?? profile?.settle ?? DEFAULT_SETTLE),
    0,
    1,
  );

  return {
    collapseStart,
    voidPeak,
    arrivalStart,
    settleEnd,
  };
};

const getPointerDepthScale = (profile?: FeatureTransitionProfile) => {
  if (profile?.authoredBridge?.pointerDepthStrength) {
    return profile.authoredBridge.pointerDepthStrength;
  }

  switch (profile?.pointerDepthProfile) {
    case "soft":
      return 0.82;
    case "deep":
      return 1.32;
    default:
      return 1;
  }
};

const pathRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const clampedRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + clampedRadius, y);
  context.lineTo(x + width - clampedRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
  context.lineTo(x + width, y + height - clampedRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - clampedRadius, y + height);
  context.lineTo(x + clampedRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
  context.lineTo(x, y + clampedRadius);
  context.quadraticCurveTo(x, y, x + clampedRadius, y);
  context.closePath();
};

const parsePosition = (position?: string) => {
  if (!position) {
    return { x: 0.5, y: 0.5 };
  }

  const [xToken = "50%", yToken = "50%"] = position.split(" ");
  const parseToken = (token: string) => {
    if (token.endsWith("%")) {
      return clamp(Number.parseFloat(token) / 100, 0, 1);
    }

    if (token === "left" || token === "top") {
      return 0;
    }

    if (token === "right" || token === "bottom") {
      return 1;
    }

    return 0.5;
  };

  return { x: parseToken(xToken), y: parseToken(yToken) };
};

const fitImage = (asset: ScreenshotAsset, image: HTMLImageElement, frame: Rect) => {
  const naturalWidth = Math.max(1, image.naturalWidth || frame.width);
  const naturalHeight = Math.max(1, image.naturalHeight || frame.height);
  const sourceRatio = naturalWidth / naturalHeight;
  const frameRatio = frame.width / frame.height;
  const objectPosition = parsePosition(asset.focalPosition);

  if (asset.fit === "contain") {
    const scale = sourceRatio > frameRatio ? frame.width / naturalWidth : frame.height / naturalHeight;
    const drawWidth = naturalWidth * scale;
    const drawHeight = naturalHeight * scale;

    return {
      x: frame.x + (frame.width - drawWidth) * 0.5,
      y: frame.y + (frame.height - drawHeight) * 0.5,
      width: drawWidth,
      height: drawHeight,
    };
  }

  if (sourceRatio > frameRatio) {
    const drawHeight = frame.height;
    const drawWidth = drawHeight * sourceRatio;
    const overflow = drawWidth - frame.width;
    return {
      x: frame.x - overflow * objectPosition.x,
      y: frame.y,
      width: drawWidth,
      height: drawHeight,
    };
  }

  const drawWidth = frame.width;
  const drawHeight = drawWidth / sourceRatio;
  const overflow = drawHeight - frame.height;
  return {
    x: frame.x,
    y: frame.y - overflow * objectPosition.y,
    width: drawWidth,
    height: drawHeight,
  };
};

const isImageReady = (image: HTMLImageElement | undefined) =>
  Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0);

const chapterTint = (chapter: FeatureChapter) => {
  switch (chapter.accent) {
    case "amber":
      return "rgba(255, 191, 94, 0.12)";
    case "emerald":
      return "rgba(100, 246, 166, 0.12)";
    case "frost":
      return "rgba(210, 238, 255, 0.12)";
    default:
      return "rgba(199, 180, 255, 0.14)";
  }
};

const getBaseRect = (width: number, height: number): Rect => {
  const x = width * 0.06;
  const y = height * 0.015;
  const baseWidth = width * 0.58;
  const baseHeight = height * 0.49;
  return { x, y, width: baseWidth, height: baseHeight };
};

const getFragmentRect = (layout: FeatureSceneFragment["layout"], width: number, height: number): Rect => {
  const base = getBaseRect(width, height);

  switch (layout) {
    case "top-strip":
      return {
        x: base.x + base.width * 0.02,
        y: base.y + base.height * 0.03,
        width: base.width * 0.5,
        height: height * 0.09,
      };
    case "top-crest":
      return {
        x: base.x + base.width * 0.02,
        y: base.y + base.height * 0.02,
        width: base.width * 0.26,
        height: height * 0.14,
      };
    case "bottom-strip":
      return {
        x: base.x + base.width * 0.06,
        y: base.y + base.height - height * 0.11,
        width: base.width * 0.74,
        height: height * 0.1,
      };
    case "inset-left":
      return {
        x: base.x + base.width * 0.08,
        y: base.y + base.height * 0.68,
        width: width * 0.2,
        height: height * 0.22,
      };
    default:
      return {
        x: base.x + base.width * 0.76,
        y: base.y + base.height * 0.1,
        width: width * 0.22,
        height: height * 0.25,
      };
  }
};

const drawImageCard = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  asset: ScreenshotAsset,
  frame: Rect,
  radius: number,
  opacity: number,
  overlays = true,
) => {
  context.save();
  pathRoundedRect(context, frame.x, frame.y, frame.width, frame.height, radius);
  context.clip();
  context.globalAlpha = opacity;
  context.fillStyle = "rgba(7, 10, 15, 0.88)";
  context.fillRect(frame.x, frame.y, frame.width, frame.height);

  if (isImageReady(image)) {
    const drawRect = fitImage(asset, image, frame);
    context.drawImage(image, drawRect.x, drawRect.y, drawRect.width, drawRect.height);
  }

  if (overlays) {
    const shade = context.createLinearGradient(frame.x, frame.y, frame.x, frame.y + frame.height);
    shade.addColorStop(0, "rgba(0, 0, 0, 0.04)");
    shade.addColorStop(0.72, "rgba(0, 0, 0, 0.12)");
    shade.addColorStop(1, "rgba(0, 0, 0, 0.34)");
    context.fillStyle = shade;
    context.fillRect(frame.x, frame.y, frame.width, frame.height);
  }

  context.restore();
};

const drawChip = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  background: string,
  color: string,
) => {
  context.save();
  context.font = "600 10px JetBrains Mono, monospace";
  context.textBaseline = "middle";
  const width = context.measureText(text).width + 22;
  pathRoundedRect(context, x, y, width, 24, 12);
  context.fillStyle = background;
  context.fill();
  context.fillStyle = color;
  context.fillText(text, x + 11, y + 12);
  context.restore();
};

const wrapText = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(nextLine).width <= maxWidth || !currentLine) {
      currentLine = nextLine;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const drawSceneDecor = (
  context: CanvasRenderingContext2D,
  chapter: FeatureChapter,
  index: number,
  width: number,
  height: number,
  pointerX: number,
  pointerY: number,
) => {
  context.save();

  const tint = chapterTint(chapter);
  const glowX = width * (0.26 + pointerX * 0.035);
  const glowY = height * (0.22 + pointerY * 0.03);
  const glow = context.createRadialGradient(glowX, glowY, 0, glowX, glowY, width * 0.42);
  glow.addColorStop(0, tint);
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.globalAlpha = 0.11;
  context.strokeStyle = "rgba(255,255,255,0.08)";
  context.lineWidth = 1;
  const grid = Math.max(56, Math.round(width * 0.052));
  const gridDriftX = pointerX * 14;
  const gridDriftY = pointerY * 10;
  for (let x = -grid; x <= width + grid; x += grid) {
    context.beginPath();
    context.moveTo(x + gridDriftX, 0);
    context.lineTo(x + gridDriftX, height);
    context.stroke();
  }
  for (let y = -grid; y <= height + grid; y += grid) {
    context.beginPath();
    context.moveTo(0, y + gridDriftY);
    context.lineTo(width, y + gridDriftY);
    context.stroke();
  }
  context.globalAlpha = 1;

  drawChip(
    context,
    22 + pointerX * 4,
    18 + pointerY * 2,
    chapter.eyebrow.toUpperCase(),
    "rgba(16, 18, 28, 0.78)",
    "rgba(255,255,255,0.66)",
  );
  drawChip(
    context,
    width - 86 + pointerX * 3,
    18 + pointerY * 2,
    `0${index + 1}`,
    "rgba(16, 18, 28, 0.78)",
    "rgba(255,255,255,0.74)",
  );

  context.restore();
};

export const drawScene = (
  context: CanvasRenderingContext2D,
  chapter: FeatureChapter,
  chapterIndex: number,
  style: ScenePaintStyle,
  images: Map<string, HTMLImageElement>,
  dims: { width: number; height: number },
  enhance?: SceneEnhance,
) => {
  const { width, height } = dims;
  const pointerActive = enhance?.pointerActive ?? 0;
  const pointerX = pointerActive > 0 ? enhance?.pointerX ?? 0 : 0;
  const pointerY = pointerActive > 0 ? enhance?.pointerY ?? 0 : 0;
  const time = enhance?.time ?? 0;
  const idleStrength = enhance?.idleStrength ?? 1;
  const seed = hashString(chapter.id);
  const idleX = idleValue(time, seed, 0.32) * 8 * idleStrength;
  const idleY = idleValue(time, seed, 0.27, 1.7) * 6 * idleStrength;
  const idleRotate = idleValue(time, seed, 0.21, 0.8) * 0.006 * idleStrength;

  context.save();
  context.globalAlpha = style.opacity;
  context.filter = `brightness(${style.brightness}) saturate(${style.saturate}) blur(${style.blur}px)`;
  context.translate(
    width / 2 + style.translateX + pointerX * 28 + idleX,
    height / 2 + style.translateY + pointerY * 22 + idleY,
  );
  context.rotate(style.rotate + pointerX * 0.034 - pointerY * 0.016 + idleRotate);
  context.scale(style.scale, style.scale);
  context.translate(-width / 2, -height / 2);

  context.fillStyle = "rgba(6, 9, 14, 0.95)";
  context.fillRect(0, 0, width, height);
  drawSceneDecor(context, chapter, chapterIndex, width, height, pointerX * 4.5, pointerY * 4.5);

  const baseRect = getBaseRect(width, height);
  const baseImage = images.get(chapter.sceneBase.asset.src);
  const basePaintOpacity = enhance?.basePaintOpacity ?? 1;

  context.save();
  context.translate(pointerX * 18 + idleX * 0.38, pointerY * 13 + idleY * 0.38);
  context.rotate(pointerX * 0.009 + idleRotate * 0.45);
  drawImageCard(context, baseImage, chapter.sceneBase.asset, baseRect, 34, basePaintOpacity);
  context.restore();

  const accent = chapterTint(chapter).replace("0.12", "0.62").replace("0.14", "0.62");
  context.save();
  context.globalAlpha = 0.5 * basePaintOpacity;
  context.strokeStyle = accent;
  context.lineWidth = 1;
  const guideY = baseRect.y + baseRect.height + height * 0.075 + pointerY * 5;
  context.beginPath();
  context.moveTo(baseRect.x + pointerX * 8, guideY);
  context.lineTo(baseRect.x + baseRect.width * 0.52 + pointerX * 10, guideY);
  context.stroke();
  context.font = "600 10px JetBrains Mono, monospace";
  context.fillStyle = accent;
  context.fillText(
    (chapter.sceneBase.label ?? chapter.sceneBase.asset.label).toUpperCase(),
    baseRect.x + pointerX * 8,
    guideY + 24,
  );
  context.restore();

  chapter.sceneFragments.forEach((fragment, fragmentIndex) => {
    const fragmentRect = getFragmentRect(fragment.layout, width, height);
    const stagger = enhance?.fragmentStagger?.[fragmentIndex] ?? 1;
    const depth = 1.12 + fragmentIndex * 0.38;
    const sharedIdle = idleValue(time, seed, 0.26, fragmentIndex * 0.6);
    const fragmentIdleX = (idleX * 0.42 + sharedIdle * 3) * idleStrength;
    const fragmentIdleY = (idleY * 0.42 + idleValue(time, seed, 0.24, 1.4 + fragmentIndex) * 3) * idleStrength;
    const offsetY = (1 - stagger) * 18 + pointerY * 15 * depth + fragmentIdleY;
    const offsetX = pointerX * 18 * depth + fragmentIdleX;
    const scale = 0.96 + stagger * 0.04;
    const opacity = 0.92 * stagger;
    const image = images.get(fragment.asset.src);

    context.save();
    const cx = fragmentRect.x + fragmentRect.width / 2;
    const cy = fragmentRect.y + fragmentRect.height / 2;
    context.translate(cx + offsetX, cy + offsetY);
    context.rotate(pointerX * 0.018 * depth + idleRotate * depth);
    context.scale(scale, scale);
    context.translate(-cx, -cy);
    drawImageCard(context, image, fragment.asset, fragmentRect, 22, opacity, true);

    context.save();
    context.font = "600 9px JetBrains Mono, monospace";
    context.fillStyle = `rgba(255,255,255,${0.54 * stagger})`;
    context.fillText(
      (fragment.label ?? fragment.asset.label).toUpperCase(),
      fragmentRect.x + 12,
      fragmentRect.y + fragmentRect.height - 14,
    );
    context.restore();
    context.restore();
  });

  context.restore();
  context.filter = "none";
};

export const drawMidiArrivalTableau = (
  context: CanvasRenderingContext2D,
  chapter: FeatureChapter,
  chapterIndex: number,
  style: ScenePaintStyle,
  images: Map<string, HTMLImageElement>,
  dims: { width: number; height: number },
  enhance?: SceneEnhance,
  composition: NonNullable<NonNullable<FeatureTransitionProfile["authoredBridge"]>["arrivalComposition"]> = "midi-tableau",
) => {
  const { width, height } = dims;
  const pointerActive = enhance?.pointerActive ?? 0;
  const pointerX = pointerActive > 0 ? enhance?.pointerX ?? 0 : 0;
  const pointerY = pointerActive > 0 ? enhance?.pointerY ?? 0 : 0;
  const time = enhance?.time ?? 0;
  const idleStrength = enhance?.idleStrength ?? 1;
  const seed = hashString(`${chapter.id}-${composition}`);
  const tableauIdleX = idleValue(time, seed, 0.3) * 7 * idleStrength;
  const tableauIdleY = idleValue(time, seed, 0.24, 1.4) * 5 * idleStrength;
  const label = chapter.label.toUpperCase();
  const isMixer = composition === "mixer-tableau";
  const isEngine = composition === "engine-tableau";
  const isAutomation = composition === "automation-tableau";
  const accent = isMixer
    ? "rgba(255, 184, 110, 0.16)"
    : isEngine
      ? "rgba(178, 216, 255, 0.15)"
      : isAutomation
        ? "rgba(210, 185, 255, 0.16)"
        : "rgba(103, 255, 174, 0.14)";
  const accentSecondary = isMixer
    ? "rgba(255, 126, 88, 0.07)"
    : isEngine
      ? "rgba(130, 180, 255, 0.08)"
      : isAutomation
        ? "rgba(122, 255, 190, 0.06)"
        : "rgba(172, 202, 255, 0.08)";
  const tableauLift = isMixer || isEngine || isAutomation ? 1.18 : 1;

  context.save();
  context.globalAlpha = style.opacity;
  context.filter = `brightness(${style.brightness}) saturate(${style.saturate}) blur(${style.blur}px)`;
  context.translate(
    width / 2 + style.translateX + pointerX * 22 + tableauIdleX,
    height / 2 + style.translateY + pointerY * 18 + tableauIdleY,
  );
  context.rotate(style.rotate + pointerX * 0.024 + idleValue(time, seed, 0.2) * 0.004 * idleStrength);
  context.scale(style.scale, style.scale);
  context.translate(-width / 2, -height / 2);

  context.fillStyle = isMixer || isEngine || isAutomation ? "rgba(5, 8, 14, 0.94)" : "rgba(4, 7, 13, 0.97)";
  context.fillRect(0, 0, width, height);

  const wash = context.createRadialGradient(
    width * (0.62 + pointerX * 0.03),
    height * (0.36 + pointerY * 0.03),
    0,
    width * (0.62 + pointerX * 0.03),
    height * (0.36 + pointerY * 0.03),
    width * 0.56,
  );
  wash.addColorStop(0, accent);
  wash.addColorStop(0.36, accentSecondary);
  wash.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = wash;
  context.fillRect(0, 0, width, height);

  context.globalAlpha *= 0.22;
  context.strokeStyle = "rgba(255,255,255,0.12)";
  context.lineWidth = 1;
  const grid = Math.max(46, Math.round(width * 0.044));
  for (let x = -grid; x < width + grid; x += grid) {
    context.beginPath();
    context.moveTo(x + pointerX * 18, 0);
    context.lineTo(x + pointerX * 18, height);
    context.stroke();
  }
  for (let y = -grid; y < height + grid; y += grid) {
    context.beginPath();
    context.moveTo(0, y + pointerY * 12);
    context.lineTo(width, y + pointerY * 12);
    context.stroke();
  }
  context.globalAlpha = style.opacity;

  context.save();
  context.font = `600 ${Math.round(width * (isAutomation ? 0.095 : isEngine ? 0.11 : 0.13))}px Fraunces, Georgia, serif`;
  context.fillStyle = `rgba(245, 248, 255, ${0.26 * tableauLift})`;
  context.textBaseline = "middle";
  context.fillText(label, width * 0.08 + pointerX * 16, height * 0.48 + pointerY * 10);
  context.restore();

  drawChip(
    context,
    width * 0.08 + pointerX * 8,
    height * 0.16 + pointerY * 4,
    `MODULE 0${chapterIndex + 1} / ${label}`,
    "rgba(8, 12, 20, 0.76)",
    "rgba(220,255,235,0.76)",
  );

  const baseImage = images.get(chapter.sceneBase.asset.src);
  const heroFrame = {
    x: width * (isMixer ? 0.18 : isEngine ? 0.42 : isAutomation ? 0.36 : 0.34) + pointerX * 22,
    y: height * (isMixer ? 0.2 : isEngine ? 0.16 : isAutomation ? 0.16 : 0.18) + pointerY * 14,
    width: width * (isMixer ? 0.64 : isEngine ? 0.42 : isAutomation ? 0.5 : 0.52),
    height: height * (isMixer ? 0.48 : isEngine ? 0.52 : isAutomation ? 0.46 : 0.46),
  };
  drawImageCard(context, baseImage, chapter.sceneBase.asset, heroFrame, 30, Math.min(1, 0.98 * tableauLift), true);

  chapter.sceneFragments.forEach((fragment, fragmentIndex) => {
    const image = images.get(fragment.asset.src);
    const isFirst = fragmentIndex === 0;
    const firstX = isEngine ? 0.14 : isAutomation ? 0.18 : 0.16;
    const secondX = isMixer ? 0.58 : isEngine ? 0.64 : 0.62;
    const firstY = isMixer ? 0.58 : isEngine ? 0.14 : 0.56;
    const secondY = isAutomation ? 0.62 : 0.1;
    const frame = {
      x: width * (isFirst ? firstX : secondX) + pointerX * (isFirst ? 40 : 58),
      y: height * (isFirst ? firstY : secondY) + pointerY * (isFirst ? 28 : 36),
      width: width * (isFirst ? (isMixer ? 0.3 : 0.25) : isEngine ? 0.22 : 0.2),
      height: height * (isFirst ? (isMixer ? 0.2 : 0.22) : isEngine ? 0.24 : 0.2),
    };
    const cx = frame.x + frame.width / 2;
    const cy = frame.y + frame.height / 2;

    context.save();
    context.translate(cx, cy);
    context.rotate((isFirst ? (isEngine ? 0.048 : -0.045) : isAutomation ? -0.056 : 0.052) + pointerX * 0.02);
    context.translate(-cx, -cy);
    drawImageCard(context, image, fragment.asset, frame, 24, Math.min(1, 0.86 * tableauLift), true);
    context.restore();
  });

  for (let index = 0; index < 34; index += 1) {
    const x = width * (0.22 + ((index * 37) % 59) / 100) + pointerX * (8 + (index % 5) * 4);
    const y = height * (0.24 + ((index * 23) % 48) / 100) + pointerY * (6 + (index % 4) * 4);
    const alpha = 0.08 + ((index * 17) % 100) / 1000;
    context.beginPath();
    context.fillStyle = `rgba(210, 255, 230, ${alpha})`;
    context.arc(x, y, 1 + (index % 3), 0, TAU);
    context.fill();
  }

  context.restore();
  context.filter = "none";
};

const traceVoidPath = (
  context: CanvasRenderingContext2D,
  field: VoidField,
  scale: number,
  seed: number,
  progress: number,
  jitterAmount = 0,
) => {
  field.points.forEach((point, index) => {
    const jitter =
      jitterAmount <= 0
        ? 0
        : (edgeNoise(index * 13 + progress * 220, seed + index * 0.014) - 0.5) * jitterAmount;
    const x = field.center.x + (point.x - field.center.x) * scale + jitter;
    const y = field.center.y + (point.y - field.center.y) * scale + jitter * 0.72;

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
};

const traceVoidShape = (
  context: CanvasRenderingContext2D,
  field: VoidField,
  scale: number,
  seed: number,
  progress: number,
  jitterAmount = 0,
) => {
  context.beginPath();
  traceVoidPath(context, field, scale, seed, progress, jitterAmount);
  context.closePath();
};

const getVoidGeometry = (
  width: number,
  height: number,
  profile: FeatureTransitionProfile | undefined,
) => {
  const shape = profile?.voidShape ?? "orb";
  switch (shape) {
    case "eclipse":
      return {
        centerX: width * 0.56,
        centerY: height * 0.49,
        radiusX: width * 0.24,
        radiusY: height * 0.34,
      };
    case "shard":
      return {
        centerX: width * 0.49,
        centerY: height * 0.53,
        radiusX: width * 0.29,
        radiusY: height * 0.25,
      };
    case "veil":
      return {
        centerX: width * 0.52,
        centerY: height * 0.46,
        radiusX: width * 0.32,
        radiusY: height * 0.37,
      };
    default:
      return {
        centerX: width * 0.52,
        centerY: height * 0.5,
        radiusX: width * 0.27,
        radiusY: height * 0.31,
      };
  }
};

const buildVoidField = (
  width: number,
  height: number,
  profile: FeatureTransitionProfile | undefined,
  chapterSeed: number,
  collapseProgress: number,
  bridgeProgress: number,
  arrivalProgress: number,
): VoidField => {
  const geometry = getVoidGeometry(width, height, profile);
  const angleVector = vectorFromAngle(profile?.edgeAngle ?? -6);
  const voidScale = profile?.voidScale ?? 1;
  const baseEnvelope = easeOutCubic(collapseProgress);
  const bridgeLift = bridgeProgress * (1 - arrivalProgress) * 0.04;
  const sustain = 1 - arrivalProgress * 0.22;
  const envelope = clamp((0.02 + baseEnvelope * 0.98 + bridgeLift) * sustain, 0.02, 1.18);
  const center = {
    x: geometry.centerX + angleVector.x * width * 0.01 * bridgeProgress,
    y: geometry.centerY + angleVector.y * height * 0.01 * bridgeProgress,
  };
  const radiusX = geometry.radiusX * envelope * voidScale;
  const radiusY = geometry.radiusY * envelope * voidScale;
  const steps = 240;
  const points: Point[] = [];
  const roughness = profile?.edgeRoughness ?? 1;

  for (let index = 0; index <= steps; index += 1) {
    const angle = (index / steps) * TAU;
    const low = edgeNoise(angle * 760 + collapseProgress * 240, chapterSeed) - 0.5;
    const mid = edgeNoise(angle * 1380 - arrivalProgress * 220, chapterSeed + 0.37) - 0.5;
    const high = edgeNoise(angle * 2140 + bridgeProgress * 180, chapterSeed + 0.71) - 0.5;
    let distortion = 1 + low * 0.28 * roughness + mid * 0.14 + high * 0.08;

    if (profile?.voidShape === "shard") {
      distortion += Math.cos(angle * 3 + chapterSeed * 8.2) * 0.12;
    } else if (profile?.voidShape === "veil") {
      distortion += Math.sin(angle * 2 + chapterSeed * 4.1) * 0.09;
    } else if (profile?.voidShape === "eclipse") {
      distortion += Math.cos(angle * 2 + chapterSeed * 3.3) * 0.05;
    }

    points.push({
      x: center.x + Math.cos(angle) * radiusX * distortion,
      y: center.y + Math.sin(angle) * radiusY * distortion,
    });
  }

  return {
    points,
    center,
    radiusX,
    radiusY,
    charWidth: Math.max(width, height) * (profile?.charWidth ?? 0.04),
    emberWidth: Math.max(width, height) * (profile?.emberWidth ?? 0.01),
    smokeStrength: profile?.smokeStrength ?? 0.24,
    degradationDensity: profile?.degradationDensity ?? 0.92,
    tearAmount: profile?.tearAmount ?? 0.58,
    particleDrift: profile?.particleDrift ?? 0.64,
    remnantStrength: profile?.remnantStrength ?? 0.82,
    contourExtraction: profile?.contourExtraction ?? 0.78,
    voidShape: profile?.voidShape ?? "orb",
  };
};

const paintVoidRemovalMask = (
  context: CanvasRenderingContext2D,
  field: VoidField,
  chapterSeed: number,
  collapseProgress: number,
  arrivalProgress: number,
) => {
  context.save();
  context.fillStyle = "rgba(0,0,0,1)";
  traceVoidShape(context, field, 1, chapterSeed, collapseProgress, field.charWidth * 0.12);
  context.fill();

  const breakupDepth = field.charWidth * (1.1 + collapseProgress * 1.6);
  for (let index = 0; index < field.points.length; index += 3) {
    const point = field.points[index]!;
    const grain = edgeNoise(index * 17 + collapseProgress * 260, chapterSeed + 0.62);
    const drift = (edgeNoise(index * 14 + 70 + arrivalProgress * 140, chapterSeed + 1.28) - 0.5) * field.charWidth * 2.2;
    const depth = breakupDepth * (0.28 + grain * 1.22);
    const radiusX = field.charWidth * (0.18 + grain * 0.94) * (1 + field.tearAmount * 0.48);
    const radiusY = field.charWidth * (0.12 + grain * 0.68) * (1 + field.degradationDensity * 0.32);

    context.beginPath();
    context.fillStyle = `rgba(0,0,0,${0.18 + grain * 0.46})`;
    context.ellipse(
      point.x + (point.x - field.center.x) * 0.06 + drift,
      point.y + (point.y - field.center.y) * 0.06 + drift * 0.4,
      radiusX,
      radiusY,
      grain * Math.PI,
      0,
      TAU,
    );
    context.fill();
  }

  for (let index = 0; index < field.points.length; index += 10) {
    const point = field.points[index]!;
    const tearNoise = edgeNoise(index * 21 + collapseProgress * 180, chapterSeed + 2.04);
    if (tearNoise < 0.56) {
      continue;
    }

    context.beginPath();
    context.fillStyle = `rgba(0,0,0,${0.32 + tearNoise * 0.5})`;
    context.ellipse(
      point.x + (point.x - field.center.x) * 0.14,
      point.y + (point.y - field.center.y) * 0.14,
      field.charWidth * (0.72 + tearNoise * 1.4),
      field.charWidth * (0.22 + tearNoise * 0.5),
      tearNoise * Math.PI,
      0,
      TAU,
    );
    context.fill();
  }

  context.restore();
};

const paintRemnantMask = (
  context: CanvasRenderingContext2D,
  field: VoidField,
  chapterSeed: number,
  collapseProgress: number,
  arrivalProgress: number,
) => {
  context.save();
  context.fillStyle = "rgba(255,255,255,1)";
  traceVoidShape(context, field, 1.34, chapterSeed + 0.2, collapseProgress, field.charWidth * 0.18);
  context.fill();

  context.globalCompositeOperation = "destination-out";
  traceVoidShape(context, field, 0.82 - arrivalProgress * 0.06, chapterSeed + 0.51, collapseProgress, field.charWidth * 0.12);
  context.fill();

  context.globalCompositeOperation = "source-over";
  for (let index = 0; index < field.points.length; index += 4) {
    const point = field.points[index]!;
    const grain = edgeNoise(index * 12 + collapseProgress * 160, chapterSeed + 0.93);
    if (grain < 0.38) {
      continue;
    }

    context.beginPath();
    context.fillStyle = `rgba(255,255,255,${0.06 + grain * 0.16})`;
    context.ellipse(
      point.x + (point.x - field.center.x) * 0.22,
      point.y + (point.y - field.center.y) * 0.22,
      field.charWidth * (0.08 + grain * 0.22),
      field.charWidth * (0.04 + grain * 0.12),
      grain * Math.PI,
      0,
      TAU,
    );
    context.fill();
  }

  context.restore();
};

const paintVoidBridgeOverlay = (
  context: CanvasRenderingContext2D,
  field: VoidField,
  chapterSeed: number,
  collapseProgress: number,
  bridgeProgress: number,
  arrivalProgress: number,
) => {
  const drawWidth = context.canvas.width;
  const drawHeight = context.canvas.height;

  const voidOpacity = clamp(
    (easeInOutCubic(collapseProgress) * 0.9 + bridgeProgress * 0.24) * (1 - arrivalProgress * 0.84),
    0,
    1,
  );
  if (voidOpacity <= 0.001) {
    return;
  }

  context.save();
  traceVoidShape(context, field, 1, chapterSeed, collapseProgress, field.charWidth * 0.08);
  context.clip();

  const radial = context.createRadialGradient(
    field.center.x,
    field.center.y,
    Math.max(field.radiusX, field.radiusY) * 0.04,
    field.center.x,
    field.center.y,
    Math.max(field.radiusX, field.radiusY) * 1.22,
  );
  radial.addColorStop(0, `rgba(4, 5, 11, ${0.96 * voidOpacity})`);
  radial.addColorStop(0.42, `rgba(8, 9, 18, ${0.92 * voidOpacity})`);
  radial.addColorStop(0.78, `rgba(16, 18, 28, ${0.76 * voidOpacity})`);
  radial.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = radial;
  context.fillRect(0, 0, drawWidth, drawHeight);

  for (let index = 0; index < 5; index += 1) {
    const orbit = edgeNoise(index * 140 + chapterSeed * 200, chapterSeed + index);
    const cloudX = field.center.x + (orbit - 0.5) * field.radiusX * 0.78;
    const cloudY = field.center.y + (edgeNoise(index * 220 + 90, chapterSeed + 1.4) - 0.5) * field.radiusY * 0.78;
    const cloudRadius = Math.max(field.radiusX, field.radiusY) * (0.18 + edgeNoise(index * 320 + 60, chapterSeed + 2.6) * 0.26);
    const cloud = context.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudRadius);
    cloud.addColorStop(0, `rgba(176, 188, 255, ${0.08 * voidOpacity})`);
    cloud.addColorStop(0.5, `rgba(88, 102, 182, ${0.06 * voidOpacity})`);
    cloud.addColorStop(1, "rgba(10, 10, 18, 0)");
    context.fillStyle = cloud;
    context.beginPath();
    context.arc(cloudX, cloudY, cloudRadius, 0, TAU);
    context.fill();
  }

  const particles = Math.round(90 + field.degradationDensity * 70);
  for (let index = 0; index < particles; index += 1) {
    const angle = edgeNoise(index * 73 + chapterSeed * 500, chapterSeed + 0.82) * TAU;
    const radius = Math.pow(edgeNoise(index * 41 + 30, chapterSeed + 1.17), 1.2) * Math.max(field.radiusX, field.radiusY) * 0.98;
    const x = field.center.x + Math.cos(angle) * radius;
    const y = field.center.y + Math.sin(angle) * radius * (field.radiusY / Math.max(1, field.radiusX));
    const alpha = 0.06 + edgeNoise(index * 19 + bridgeProgress * 100, chapterSeed + 1.92) * 0.34;
    const size = 0.4 + edgeNoise(index * 29 + 110, chapterSeed + 2.11) * 1.8;
    context.beginPath();
    context.fillStyle = `rgba(244, 246, 255, ${alpha * voidOpacity})`;
    context.arc(x, y, size, 0, TAU);
    context.fill();
  }

  context.restore();

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";

  context.beginPath();
  traceVoidPath(context, field, 1.04, chapterSeed + 0.2, collapseProgress, field.charWidth * 0.14);
  context.strokeStyle = `rgba(10, 5, 4, ${0.72 * voidOpacity})`;
  context.lineWidth = field.charWidth * 1.54;
  context.shadowColor = `rgba(0, 0, 0, ${0.32 * voidOpacity})`;
  context.shadowBlur = field.charWidth * 0.56;
  context.stroke();

  context.beginPath();
  traceVoidPath(context, field, 0.98, chapterSeed + 0.48, collapseProgress, field.charWidth * 0.12);
  context.strokeStyle = `rgba(244, 234, 214, ${(0.22 + bridgeProgress * 0.16) * voidOpacity})`;
  context.lineWidth = Math.max(1, field.emberWidth * 1.6);
  context.shadowColor = `rgba(255, 180, 102, ${(0.2 + bridgeProgress * 0.16) * voidOpacity})`;
  context.shadowBlur = field.charWidth * 0.32;
  context.stroke();

  for (let index = 0; index < field.points.length; index += 3) {
    const point = field.points[index]!;
    const grain = edgeNoise(index * 16 + collapseProgress * 240, chapterSeed + 0.9);
    const smokeNoise = edgeNoise(index * 11 + 90 + bridgeProgress * 220, chapterSeed + 1.37);
    const emberNoise = edgeNoise(index * 24 + 160 + bridgeProgress * 240, chapterSeed + 1.81);
    const ashNoise = edgeNoise(index * 13 + arrivalProgress * 140, chapterSeed + 2.23);
    const pushX = (point.x - field.center.x) * 0.08;
    const pushY = (point.y - field.center.y) * 0.08;
    const edgeX = point.x + pushX;
    const edgeY = point.y + pushY;

    context.beginPath();
    context.fillStyle = `rgba(18, 9, 4, ${(0.14 + grain * 0.28) * voidOpacity})`;
    context.ellipse(
      edgeX,
      edgeY,
      field.charWidth * (0.16 + grain * 0.7),
      field.charWidth * (0.08 + smokeNoise * 0.42),
      grain * Math.PI,
      0,
      TAU,
    );
    context.fill();

    if (smokeNoise > 0.46) {
      const radius = field.charWidth * (0.7 + smokeNoise * 1.26);
      const smokeX = edgeX + pushX * 0.6;
      const smokeY = edgeY + pushY * 0.6;
      const smoke = context.createRadialGradient(smokeX, smokeY, radius * 0.1, smokeX, smokeY, radius);
      smoke.addColorStop(0, `rgba(216, 210, 204, ${field.smokeStrength * 0.16 * voidOpacity})`);
      smoke.addColorStop(0.34, `rgba(112, 110, 106, ${field.smokeStrength * 0.14 * voidOpacity})`);
      smoke.addColorStop(1, "rgba(12, 12, 12, 0)");
      context.beginPath();
      context.fillStyle = smoke;
      context.arc(smokeX, smokeY, radius, 0, TAU);
      context.fill();
    }

    if (emberNoise > 0.56) {
      const sparkX = edgeX + pushX * 0.34;
      const sparkY = edgeY + pushY * 0.34;
      const sparkRadius = 0.6 + emberNoise * 1.4;
      context.beginPath();
      context.fillStyle = `rgba(255, 240, 218, ${(0.18 + emberNoise * 0.48) * voidOpacity})`;
      context.arc(sparkX, sparkY, sparkRadius, 0, TAU);
      context.fill();
    }

    if (ashNoise > 0.48) {
      context.beginPath();
      context.fillStyle = `rgba(218, 214, 204, ${(0.04 + ashNoise * 0.12) * voidOpacity})`;
      context.arc(
        edgeX + pushX * 0.92,
        edgeY + pushY * 0.92,
        0.4 + ashNoise * 1.1,
        0,
        TAU,
      );
      context.fill();
    }
  }

  context.restore();
};

const getArrivalStyle = (
  profile: FeatureTransitionProfile | undefined,
  ease: number,
  directionX: number,
  directionY: number,
) => {
  switch (profile?.arrivalStyle) {
    case "lift":
      return {
        translateX: directionX * (1 - ease) * 10,
        translateY: 26 * (1 - ease) + directionY * (1 - ease) * 12,
        scale: lerp(1.06, 1, ease),
        rotate: directionX * (1 - ease) * 0.006,
      };
    case "bloom":
      return {
        translateX: directionX * (1 - ease) * 6,
        translateY: 8 * (1 - ease),
        scale: lerp(1.1, 1, ease),
        rotate: 0,
      };
    default:
      return {
        translateX: directionX * (1 - ease) * 28,
        translateY: directionY * (1 - ease) * 14 + 8 * (1 - ease),
        scale: lerp(1.04, 1, ease),
        rotate: -directionX * (1 - ease) * 0.01,
      };
  }
};

export const drawTransitionAsset = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  drawWidth: number,
  drawHeight: number,
  options?: {
    alpha?: number;
    scale?: number;
    offsetX?: number;
    offsetY?: number;
    rotation?: number;
    compositeOperation?: GlobalCompositeOperation;
  },
) => {
  if (!isImageReady(image)) {
    return;
  }

  const alpha = options?.alpha ?? 1;
  if (alpha <= 0.001) {
    return;
  }

  const scale = options?.scale ?? 1;
  const offsetX = options?.offsetX ?? 0;
  const offsetY = options?.offsetY ?? 0;
  const rotation = options?.rotation ?? 0;

  context.save();
  context.globalAlpha = alpha;
  if (options?.compositeOperation) {
    context.globalCompositeOperation = options.compositeOperation;
  }
  context.translate(drawWidth / 2 + offsetX, drawHeight / 2 + offsetY);
  context.rotate(rotation);
  context.scale(scale, scale);
  context.translate(-drawWidth / 2, -drawHeight / 2);
  context.drawImage(image, 0, 0, drawWidth, drawHeight);
  context.restore();
};

const collectChapterSources = (chapter: FeatureChapter, includeTransition = false, includeFragments = true) => {
  const sources = [
    chapter.sceneBase.asset.src,
    ...(includeFragments ? chapter.sceneFragments.map((fragment) => fragment.asset.src) : []),
  ];

  if (includeTransition) {
    [
      chapter.transitionProfile?.curatedMatteSrc,
      chapter.transitionProfile?.collapseMaskSrc,
      chapter.transitionProfile?.voidBridgeSrc,
      chapter.transitionProfile?.remnantMaskSrc,
      chapter.transitionProfile?.arrivalMatteSrc,
      chapter.transitionProfile?.authoredBridge?.collapseFieldSrc,
      chapter.transitionProfile?.authoredBridge?.remnantEtchedSrc,
      chapter.transitionProfile?.authoredBridge?.voidCoreSrc,
      chapter.transitionProfile?.authoredBridge?.voidEdgeSrc,
      chapter.transitionProfile?.authoredBridge?.arrivalMatteSrc,
    ].forEach((src) => {
      if (src) {
        sources.push(src);
      }
    });
  }

  return sources;
};

const ensureImageSource = (
  images: Map<string, HTMLImageElement>,
  pending: Set<string>,
  src: string,
  priority: "active" | "next" | "idle" = "idle",
  {
    height,
    includeTransition = false,
    width,
  }: {
    height?: number;
    includeTransition?: boolean;
    width?: number;
  } = {},
) => {
  const existing = images.get(src);
  if (existing || pending.has(src)) {
    return existing;
  }

  pending.add(src);
  void loadScheduledImage(src, {
    fit: "cover",
    group: includeTransition ? "transitionUpcoming" : priority === "active" ? "cinematicFirstFrame" : "nearby",
    height,
    maxWidth: includeTransition ? 960 : priority === "active" ? 1280 : 960,
    priority,
    slot: includeTransition ? "transition-mask" : priority === "active" ? "cinematic" : "panel",
    tier: priority === "active" ? "story-active" : "story-next",
    width,
  })
    .then((image) => {
      images.set(src, image);
    })
    .finally(() => {
      pending.delete(src);
    });

  return undefined;
};

const FeatureSceneCompositor = ({ chapters, stateRef, className }: FeatureSceneCompositorProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const remnantCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ringCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const pendingImagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const loadChapter = (index: number, includeTransition = false) => {
      const chapter = chapters[index];
      if (!chapter) {
        return;
      }

      const width = typeof window === "undefined" ? 960 : window.innerWidth;
      const height = typeof window === "undefined" ? 640 : window.innerHeight;

      collectChapterSources(chapter, includeTransition, index === 0).forEach((src) =>
        ensureImageSource(imagesRef.current, pendingImagesRef.current, src, index === 0 ? "active" : "next", {
          height,
          includeTransition,
          width,
        }),
      );
    };

    loadChapter(0);
    loadChapter(1);
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

    const ensureCanvas = (ref: React.MutableRefObject<HTMLCanvasElement | null>) => {
      if (!ref.current) {
        ref.current = document.createElement("canvas");
      }

      return ref.current;
    };

    const syncCanvasSize = (target: HTMLCanvasElement, width: number, height: number) => {
      if (target.width !== width || target.height !== height) {
        target.width = width;
        target.height = height;
      }
    };

    let animationFrame = 0;
    const renderStartTime = performance.now();
    let stageVisible = true;

    const render = () => {
      if (!stageVisible || document.visibilityState === "hidden") {
        animationFrame = 0;
        return;
      }

      const bounds = canvas.getBoundingClientRect();
      const drawWidth = Math.max(1, bounds.width);
      const drawHeight = Math.max(1, bounds.height);
      const devicePixelRatio = Math.min(window.devicePixelRatio || DPR_FALLBACK, DPR_LIMIT);
      const pixelWidth = Math.max(1, Math.round(drawWidth * devicePixelRatio));
      const pixelHeight = Math.max(1, Math.round(drawHeight * devicePixelRatio));
      syncCanvasSize(canvas, pixelWidth, pixelHeight);

      const sourceCanvas = ensureCanvas(sourceCanvasRef);
      const activeCanvas = ensureCanvas(activeCanvasRef);
      const nextCanvas = ensureCanvas(nextCanvasRef);
      const maskCanvas = ensureCanvas(maskCanvasRef);
      const remnantCanvas = ensureCanvas(remnantCanvasRef);
      const ringCanvas = ensureCanvas(ringCanvasRef);
      const overlayCanvas = ensureCanvas(overlayCanvasRef);
      [
        sourceCanvas,
        activeCanvas,
        nextCanvas,
        maskCanvas,
        remnantCanvas,
        ringCanvas,
        overlayCanvas,
      ].forEach((target) => syncCanvasSize(target, pixelWidth, pixelHeight));

      const sourceContext = sourceCanvas.getContext("2d");
      const activeContext = activeCanvas.getContext("2d");
      const nextContext = nextCanvas.getContext("2d");
      const maskContext = maskCanvas.getContext("2d");
      const remnantContext = remnantCanvas.getContext("2d");
      const ringContext = ringCanvas.getContext("2d");
      const overlayContext = overlayCanvas.getContext("2d");

      if (
        !sourceContext ||
        !activeContext ||
        !nextContext ||
        !maskContext ||
        !remnantContext ||
        !ringContext ||
        !overlayContext
      ) {
        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      [
        context,
        sourceContext,
        activeContext,
        nextContext,
        maskContext,
        remnantContext,
        ringContext,
        overlayContext,
      ].forEach((ctx) => {
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        ctx.clearRect(0, 0, drawWidth, drawHeight);
      });

      const currentState = stateRef.current;
      const activeIndex = clamp(currentState.fromIndex ?? currentState.activeIndex, 0, chapters.length - 1);
      const nextIndex = clamp(currentState.toIndex ?? currentState.nextIndex, 0, chapters.length - 1);
      const visualOwnerIndex = clamp(currentState.visualOwnerIndex ?? currentState.activeIndex, 0, chapters.length - 1);
      const activeChapter = chapters[activeIndex];
      const visualOwnerChapter = chapters[visualOwnerIndex] ?? activeChapter;

      if (!activeChapter || !visualOwnerChapter) {
        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      const reducedMotion = currentState.reducedMotion;
      const renderTime = reducedMotion ? 0 : (performance.now() - renderStartTime) / 1000;
      const intro = clamp(currentState.introProgress ?? 0, 0, 1);
      const scene = clamp(currentState.sceneProgress ?? 0, 0, 1);
      const handoff = clamp(currentState.handoffProgress ?? 0, 0, 1);
      const shouldWarmNearbyChapters =
        activeIndex <= 1 ||
        currentState.transitionActive > 0.001 ||
        intro > 0.001 ||
        scene > 0.001 ||
        handoff > 0.001;

      if (shouldWarmNearbyChapters) {
        [activeIndex, visualOwnerIndex, nextIndex].forEach((index) => {
          const chapter = chapters[index];
          if (!chapter) {
            return;
          }

          const includeTransition = currentState.transitionActive > 0.04;
          const includeFragments = index === activeIndex || index === visualOwnerIndex || includeTransition;

          collectChapterSources(chapter, includeTransition, includeFragments).forEach((src) =>
            ensureImageSource(
              imagesRef.current,
              pendingImagesRef.current,
              src,
              index === activeIndex || index === visualOwnerIndex ? "active" : "next",
              {
                height: drawHeight,
                includeTransition:
                  includeTransition &&
                  src !== chapter.sceneBase.asset.src &&
                  !chapter.sceneFragments.some((fragment) => fragment.asset.src === src),
                width: drawWidth,
              },
            ),
          );
        });
      }
      const rawPointerActive = reducedMotion ? 0 : clamp(currentState.pointerActive ?? 0, 0, 1);
      const rawPointerX = clamp(currentState.pointerX ?? 0, -1, 1);
      const rawPointerY = clamp(currentState.pointerY ?? 0, -1, 1);
      const transitionProgress = clamp(currentState.transitionProgress ?? 0, 0, 1);
      const shouldTransition =
        currentState.transitionActive > 0.001 &&
        nextIndex !== activeIndex &&
        chapters[nextIndex];

      const pointerDepth = getPointerDepthScale(activeChapter.transitionProfile);
      const phases = getTransitionPhases(activeChapter.transitionProfile);
      const collapseProgress = phaseProgress(transitionProgress, phases.collapseStart, phases.voidPeak);
      const bridgeProgress = phaseProgress(transitionProgress, phases.voidPeak, phases.arrivalStart);
      const arrivalProgress = phaseProgress(transitionProgress, phases.arrivalStart, phases.settleEnd);
      const collapseEase = easeInOutCubic(collapseProgress);
      const bridgeEase = easeInOutCubic(bridgeProgress);
      const arrivalEase = easeInOutCubic(arrivalProgress);
      const bridgeStrength = Math.max(collapseEase, bridgeEase * 0.96);
      const pointerDamp = shouldTransition ? 1 - bridgeStrength * 0.58 : 1;
      const pointerX = rawPointerX * rawPointerActive * pointerDamp * pointerDepth;
      const pointerY = rawPointerY * rawPointerActive * pointerDamp * pointerDepth;
      const pointerActive = rawPointerActive * pointerDamp;

      const fragmentLag = activeChapter.transitionProfile?.fragmentLag ?? 0.08;
      const fragmentCount = activeChapter.sceneFragments.length;
      const fragmentStagger = Array.from({ length: fragmentCount }, (_, fragmentIndex) => {
        const start = 0.18 + fragmentIndex * fragmentLag;
        const end = start + 0.34;
        return easeOutCubic(phaseProgress(scene, start, end));
      });

      if (!shouldTransition) {
        drawScene(
          context,
          visualOwnerChapter,
          visualOwnerIndex,
          {
            opacity: 0.82 + intro * 0.08 + scene * 0.1,
            translateX: 0,
            translateY: 0,
            scale: 1,
            rotate: 0,
            brightness: 0.94 + scene * 0.06,
            saturate: 0.94 + scene * 0.06,
            blur: 0,
          },
          imagesRef.current,
          { width: drawWidth, height: drawHeight },
          {
            fragmentStagger,
            basePaintOpacity: clamp(0.38 + intro * 0.18 + scene * 0.44, 0, 1),
            pointerX,
            pointerY,
            pointerActive,
            time: renderTime,
            idleStrength: 1,
          },
        );

        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      const nextChapter = chapters[nextIndex] ?? activeChapter;
      const chapterSeed = activeChapter.transitionProfile?.burnSeed ?? (activeIndex + 1) * 0.17;
      const entryDirection = activeChapter.transitionProfile?.entryDirection ?? "right";
      const directionX = entryDirection === "left" ? -1 : entryDirection === "right" ? 1 : 0;
      const directionY = entryDirection === "plunge" ? 1 : 0;
      const arrivalStyle = getArrivalStyle(activeChapter.transitionProfile, arrivalEase, directionX, directionY);
      const authoredBridge = activeChapter.transitionProfile?.authoredBridge;
      const authoredArrivalStart = authoredBridge
        ? clamp(phases.arrivalStart + (authoredBridge.arrivalDelay ?? 0), 0, phases.settleEnd - 0.04)
        : phases.arrivalStart;
      const authoredArrivalProgress = phaseProgress(transitionProgress, authoredArrivalStart, phases.settleEnd);
      const authoredArrivalEase = easeInOutCubic(authoredArrivalProgress);
      const collapseMaskImage = activeChapter.transitionProfile?.collapseMaskSrc
        ? imagesRef.current.get(activeChapter.transitionProfile.collapseMaskSrc)
        : undefined;
      const remnantMaskImage = activeChapter.transitionProfile?.remnantMaskSrc
        ? imagesRef.current.get(activeChapter.transitionProfile.remnantMaskSrc)
        : undefined;
      const voidBridgeImage = activeChapter.transitionProfile?.voidBridgeSrc
        ? imagesRef.current.get(activeChapter.transitionProfile.voidBridgeSrc)
        : undefined;
      const arrivalMatteImage = activeChapter.transitionProfile?.arrivalMatteSrc
        ? imagesRef.current.get(activeChapter.transitionProfile.arrivalMatteSrc)
        : undefined;
      const authoredCollapseFieldImage = authoredBridge
        ? imagesRef.current.get(authoredBridge.collapseFieldSrc)
        : undefined;
      const authoredRemnantEtchedImage = authoredBridge
        ? imagesRef.current.get(authoredBridge.remnantEtchedSrc)
        : undefined;
      const authoredVoidCoreImage = authoredBridge ? imagesRef.current.get(authoredBridge.voidCoreSrc) : undefined;
      const authoredVoidEdgeImage = authoredBridge ? imagesRef.current.get(authoredBridge.voidEdgeSrc) : undefined;
      const authoredArrivalMatteImage = authoredBridge
        ? imagesRef.current.get(authoredBridge.arrivalMatteSrc)
        : undefined;
      const useAuthoredBridge = Boolean(
        authoredBridge &&
          authoredCollapseFieldImage &&
          authoredRemnantEtchedImage &&
          authoredVoidCoreImage &&
          authoredVoidEdgeImage &&
          authoredArrivalMatteImage,
      );

      if (reducedMotion) {
        drawScene(
          context,
          nextChapter,
          nextIndex,
          {
            opacity: arrivalEase,
            translateX: arrivalStyle.translateX,
            translateY: arrivalStyle.translateY,
            scale: arrivalStyle.scale,
            rotate: arrivalStyle.rotate,
            brightness: lerp(0.94, 1, arrivalEase),
            saturate: lerp(0.94, 1, arrivalEase),
            blur: 0,
          },
          imagesRef.current,
          { width: drawWidth, height: drawHeight },
          {
            pointerX: pointerX * 0.72,
            pointerY: pointerY * 0.72,
            pointerActive: pointerActive * 0.72,
            time: renderTime,
            idleStrength: 0,
          },
        );
        drawScene(
          context,
          activeChapter,
          activeIndex,
          {
            opacity: 1 - arrivalEase,
            translateX: -directionX * arrivalEase * 8,
            translateY: -arrivalEase * 4,
            scale: lerp(1, 0.996, arrivalEase),
            rotate: 0,
            brightness: lerp(1, 0.94, arrivalEase),
            saturate: lerp(1, 0.96, arrivalEase),
            blur: 0,
          },
          imagesRef.current,
          { width: drawWidth, height: drawHeight },
          {
            fragmentStagger,
            basePaintOpacity: clamp(0.58 - handoff * 0.2, 0.42, 1),
            pointerX,
            pointerY,
            pointerActive,
            time: renderTime,
            idleStrength: 0,
          },
        );

        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      if (authoredBridge) {
        const committed = (currentState.visualOwnerIndex ?? activeIndex) === nextIndex;
        const ownerChapter = committed ? nextChapter : activeChapter;
        const ownerIndex = committed ? nextIndex : activeIndex;
        const ownerSettle = committed ? easeOutCubic(phaseProgress(transitionProgress, phases.arrivalStart, phases.settleEnd)) : 0;

        drawScene(
          context,
          ownerChapter,
          ownerIndex,
          {
            opacity: committed ? clamp(0.72 + ownerSettle * 0.28, 0, 1) : clamp(1 - collapseEase * 0.18, 0.78, 1),
            translateX: committed ? directionX * (1 - ownerSettle) * 8 - pointerX * 1.5 : pointerX * 2.5,
            translateY: committed ? (1 - ownerSettle) * 5 - pointerY * 1.2 : pointerY * 2,
            scale: committed ? lerp(1.014, 1, ownerSettle) : lerp(1, 0.996, collapseEase),
            rotate: committed ? -directionX * (1 - ownerSettle) * 0.003 : directionX * collapseEase * 0.003,
            brightness: committed ? lerp(0.92, 1, ownerSettle) : lerp(1, 0.88, collapseEase),
            saturate: committed ? lerp(0.94, 1, ownerSettle) : lerp(1, 0.86, collapseEase),
            blur: committed ? lerp(0.4, 0, ownerSettle) : lerp(0, 0.28, collapseEase),
          },
          imagesRef.current,
          { width: drawWidth, height: drawHeight },
          {
            fragmentStagger,
            basePaintOpacity: clamp(0.56 + scene * 0.32 - handoff * 0.16, 0.42, 1),
            pointerX,
            pointerY,
            pointerActive,
            time: renderTime,
            idleStrength: committed ? ownerSettle : 1 - bridgeStrength * 0.5,
          },
        );

        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      drawScene(
        sourceContext,
        activeChapter,
        activeIndex,
        {
          opacity: 1,
          translateX: -directionX * collapseEase * (useAuthoredBridge ? 11 : 6) + pointerX * 3,
          translateY: -collapseEase * (useAuthoredBridge ? 5 : 2) + pointerY * 2,
          scale: lerp(1, useAuthoredBridge ? 0.982 : 0.992, bridgeStrength * 0.8),
          rotate: directionX * collapseEase * (useAuthoredBridge ? 0.007 : 0.004),
          brightness: lerp(1, useAuthoredBridge ? 0.72 : 0.86, bridgeStrength),
          saturate: lerp(1, useAuthoredBridge ? 0.54 : 0.76, bridgeStrength),
          blur: lerp(0, useAuthoredBridge ? 0.95 : 0.6, bridgeStrength * 0.4),
        },
        imagesRef.current,
        { width: drawWidth, height: drawHeight },
        {
          fragmentStagger,
          basePaintOpacity: clamp(0.56 + scene * 0.32 - handoff * 0.16, 0.42, 1),
          pointerX,
          pointerY,
          pointerActive,
          time: renderTime,
          idleStrength: 1 - bridgeStrength * 0.45,
        },
      );

      const sceneArrivalEase = useAuthoredBridge ? authoredArrivalEase : arrivalEase;
      const nextSceneOpacity = clamp(sceneArrivalEase * (useAuthoredBridge ? 1.22 : 1.12), 0, 1);
      if (nextSceneOpacity > 0.001) {
        const incomingTranslateX = useAuthoredBridge
          ? directionX * (1 - sceneArrivalEase) * 42
          : arrivalStyle.translateX;
        const incomingTranslateY = useAuthoredBridge
          ? 20 * (1 - sceneArrivalEase) + directionY * (1 - sceneArrivalEase) * 10
          : arrivalStyle.translateY;
        const incomingScale = useAuthoredBridge ? lerp(1.08, 1, sceneArrivalEase) : arrivalStyle.scale;
        const incomingRotate = useAuthoredBridge
          ? -directionX * (1 - sceneArrivalEase) * 0.012
          : arrivalStyle.rotate;

        drawScene(
          nextContext,
          nextChapter,
          nextIndex,
          {
            opacity: nextSceneOpacity,
            translateX: incomingTranslateX - pointerX * 4,
            translateY: incomingTranslateY - pointerY * 3,
            scale: incomingScale,
            rotate: incomingRotate,
            brightness: lerp(useAuthoredBridge ? 0.76 : 0.9, 1, sceneArrivalEase),
            saturate: lerp(useAuthoredBridge ? 0.78 : 0.9, 1, sceneArrivalEase),
            blur: lerp(useAuthoredBridge ? 1.6 : 1.2, 0, sceneArrivalEase),
          },
          imagesRef.current,
          { width: drawWidth, height: drawHeight },
          {
            pointerX: pointerX * 0.72,
            pointerY: pointerY * 0.72,
            pointerActive: pointerActive * 0.72,
            time: renderTime,
            idleStrength: sceneArrivalEase,
          },
        );

        const nextArrivalMatte = useAuthoredBridge ? authoredArrivalMatteImage : arrivalMatteImage;
        if (nextArrivalMatte) {
          maskContext.clearRect(0, 0, drawWidth, drawHeight);
          drawTransitionAsset(maskContext, nextArrivalMatte, drawWidth, drawHeight, {
            alpha: clamp(sceneArrivalEase * (useAuthoredBridge ? 1.34 : 1.2), 0, 1),
            scale: useAuthoredBridge ? lerp(0.9, 1.1, sceneArrivalEase) : lerp(0.78, 1.08, sceneArrivalEase),
            offsetX: directionX * lerp(useAuthoredBridge ? -88 : -160, 0, sceneArrivalEase),
            offsetY:
              directionY * lerp(useAuthoredBridge ? -44 : -70, 0, sceneArrivalEase) +
              lerp(useAuthoredBridge ? 18 : 34, 0, sceneArrivalEase),
            rotation: directionX * lerp(useAuthoredBridge ? -0.012 : -0.03, 0, sceneArrivalEase),
          });
          nextContext.save();
          nextContext.globalCompositeOperation = "destination-in";
          nextContext.drawImage(maskCanvas, 0, 0, drawWidth, drawHeight);
          nextContext.restore();
        }

        context.drawImage(nextCanvas, 0, 0, drawWidth, drawHeight);
      }

      const activeField = buildVoidField(
        drawWidth,
        drawHeight,
        activeChapter.transitionProfile,
        chapterSeed,
        collapseEase,
        bridgeEase,
        arrivalEase,
      );

      maskContext.clearRect(0, 0, drawWidth, drawHeight);
      if (useAuthoredBridge && authoredCollapseFieldImage) {
        drawTransitionAsset(maskContext, authoredCollapseFieldImage, drawWidth, drawHeight, {
          alpha: clamp(collapseEase * 1.28 + bridgeEase * 0.18, 0, 1),
          scale: lerp(0.7, 1.08, Math.max(collapseEase, bridgeEase * 0.6)),
          offsetX: directionX * lerp(-72, 8, collapseEase),
          offsetY: lerp(18, -10, collapseEase),
          rotation: directionX * lerp(-0.012, 0.004, bridgeEase),
          compositeOperation: "lighter",
        });
      } else {
        paintVoidRemovalMask(maskContext, activeField, chapterSeed, collapseEase, arrivalEase);
        if (collapseMaskImage) {
          drawTransitionAsset(maskContext, collapseMaskImage, drawWidth, drawHeight, {
            alpha: clamp(collapseEase * 1.18 + bridgeEase * 0.12, 0, 1),
            scale: lerp(0.48, 1.16, collapseEase),
            offsetX: directionX * lerp(-54, 22, collapseEase),
            offsetY: lerp(22, -8, collapseEase),
            compositeOperation: "lighter",
          });
        }
      }
      activeContext.drawImage(sourceCanvas, 0, 0, drawWidth, drawHeight);
      activeContext.save();
      activeContext.globalCompositeOperation = "destination-out";
      activeContext.drawImage(maskCanvas, 0, 0, drawWidth, drawHeight);
      activeContext.restore();
      context.drawImage(activeCanvas, 0, 0, drawWidth, drawHeight);

      ringContext.clearRect(0, 0, drawWidth, drawHeight);
      if (useAuthoredBridge && authoredRemnantEtchedImage) {
        drawTransitionAsset(context, authoredRemnantEtchedImage, drawWidth, drawHeight, {
          alpha: clamp((collapseEase * 0.82 + bridgeEase * 0.28) * (1 - sceneArrivalEase * 0.5), 0, 1),
          scale: lerp(0.99, 1.035, bridgeEase),
          offsetX: directionX * lerp(-14, 6, collapseEase),
          offsetY: lerp(4, -5, collapseEase),
        });
      } else {
        paintRemnantMask(ringContext, activeField, chapterSeed, collapseEase, arrivalEase);
        if (remnantMaskImage) {
          drawTransitionAsset(ringContext, remnantMaskImage, drawWidth, drawHeight, {
            alpha: clamp(collapseEase * 0.98 + bridgeEase * 0.26, 0, 1),
            scale: lerp(0.92, 1.06, collapseEase),
            offsetX: directionX * lerp(-36, 10, collapseEase),
            offsetY: lerp(10, -6, collapseEase),
            compositeOperation: "lighter",
          });
        }
        remnantContext.save();
        remnantContext.filter = `grayscale(1) contrast(${1.4 + activeField.contourExtraction * 1.3}) saturate(0.15) brightness(${1.02 + activeField.contourExtraction * 0.22})`;
        remnantContext.globalAlpha = clamp(
          (collapseEase * 0.62 + bridgeEase * 0.34) * activeField.remnantStrength * (1 - arrivalEase * 0.72),
          0,
          1,
        );
        remnantContext.drawImage(sourceCanvas, 0, 0, drawWidth, drawHeight);
        remnantContext.restore();
        remnantContext.save();
        remnantContext.globalCompositeOperation = "destination-in";
        remnantContext.drawImage(ringCanvas, 0, 0, drawWidth, drawHeight);
        remnantContext.restore();
        remnantContext.save();
        remnantContext.globalCompositeOperation = "source-atop";
        remnantContext.fillStyle = `rgba(232, 228, 222, ${0.18 + bridgeEase * 0.14})`;
        remnantContext.fillRect(0, 0, drawWidth, drawHeight);
        remnantContext.restore();
        context.drawImage(remnantCanvas, 0, 0, drawWidth, drawHeight);
      }

      overlayContext.clearRect(0, 0, drawWidth, drawHeight);
      if (useAuthoredBridge && authoredVoidCoreImage && authoredVoidEdgeImage) {
        const authoredBridgeOpacity = clamp((collapseEase * 0.96 + bridgeEase * 0.36) * (1 - sceneArrivalEase * 0.74), 0, 1);
        const bridgeHoldWeight = clamp((collapseEase * 0.72 + bridgeEase * 0.64) * (1 - sceneArrivalEase * 0.52), 0, 1);
        overlayContext.save();
        overlayContext.globalAlpha = authoredBridgeOpacity;
        overlayContext.fillStyle = "rgba(2, 4, 10, 0.46)";
        overlayContext.fillRect(0, 0, drawWidth, drawHeight);
        overlayContext.restore();
        overlayContext.save();
        const stageShadow = overlayContext.createRadialGradient(
          drawWidth * 0.54,
          drawHeight * 0.46,
          0,
          drawWidth * 0.54,
          drawHeight * 0.46,
          drawWidth * 0.58,
        );
        stageShadow.addColorStop(0, `rgba(1, 3, 9, ${0.58 * bridgeHoldWeight})`);
        stageShadow.addColorStop(0.48, `rgba(2, 4, 10, ${0.42 * bridgeHoldWeight})`);
        stageShadow.addColorStop(0.78, `rgba(2, 4, 9, ${0.18 * bridgeHoldWeight})`);
        stageShadow.addColorStop(1, "rgba(2, 4, 9, 0)");
        overlayContext.fillStyle = stageShadow;
        overlayContext.fillRect(0, 0, drawWidth, drawHeight);
        overlayContext.restore();
        drawTransitionAsset(overlayContext, authoredVoidCoreImage, drawWidth, drawHeight, {
          alpha: clamp(authoredBridgeOpacity * 1.18, 0, 1),
          scale: lerp(0.96, authoredBridge?.coreScale ?? 1.08, Math.max(collapseEase, bridgeEase)),
          offsetX: directionX * lerp(-62, 10, collapseEase),
          offsetY: lerp(14, -10, collapseEase),
          rotation: directionX * lerp(-0.01, 0.003, bridgeEase),
        });
        drawTransitionAsset(overlayContext, authoredVoidEdgeImage, drawWidth, drawHeight, {
          alpha: clamp((collapseEase * 0.92 + bridgeEase * 0.46) * (1 - sceneArrivalEase * 0.58), 0, 1),
          scale: lerp(0.8, authoredBridge?.edgeScale ?? 1.04, Math.max(collapseEase, bridgeEase)),
          offsetX: directionX * lerp(-60, 8, collapseEase),
          offsetY: lerp(14, -10, collapseEase),
          rotation: directionX * lerp(-0.012, 0.004, bridgeEase),
        });
      } else if (voidBridgeImage) {
        drawTransitionAsset(overlayContext, voidBridgeImage, drawWidth, drawHeight, {
          alpha: clamp((collapseEase * 0.78 + bridgeEase * 0.44) * (1 - arrivalEase * 0.78), 0, 1),
          scale: lerp(0.74, 1.14, Math.max(collapseEase, bridgeEase)),
          offsetX: directionX * lerp(-60, 14, collapseEase),
          offsetY: lerp(16, -12, collapseEase),
          rotation: directionX * lerp(-0.018, 0.005, bridgeEase),
        });
      }
      if (!useAuthoredBridge) {
        paintVoidBridgeOverlay(
          overlayContext,
          activeField,
          chapterSeed,
          collapseEase,
          bridgeEase,
          arrivalEase,
        );
      }
      context.drawImage(overlayCanvas, 0, 0, drawWidth, drawHeight);

      if (useAuthoredBridge && sceneArrivalEase > 0.18 && authoredArrivalMatteImage) {
        const foregroundArrival = easeOutCubic(phaseProgress(sceneArrivalEase, 0.18, 1));
        nextContext.clearRect(0, 0, drawWidth, drawHeight);
        const composition = authoredBridge?.arrivalComposition;
        if (composition) {
          drawMidiArrivalTableau(
            nextContext,
            nextChapter,
            nextIndex,
            {
              opacity: clamp(foregroundArrival * 1.24, 0, 1),
              translateX: directionX * (1 - foregroundArrival) * 18 - pointerX * 3,
              translateY: 10 * (1 - foregroundArrival) - pointerY * 2,
              scale: lerp(1.035, 1, foregroundArrival),
              rotate: -directionX * (1 - foregroundArrival) * 0.006,
              brightness: lerp(0.9, 1.08, foregroundArrival),
              saturate: lerp(0.94, 1.08, foregroundArrival),
              blur: lerp(0.7, 0, foregroundArrival),
            },
            imagesRef.current,
            { width: drawWidth, height: drawHeight },
            {
              pointerX: pointerX * 0.68,
              pointerY: pointerY * 0.68,
              pointerActive: pointerActive * 0.68,
              time: renderTime,
              idleStrength: foregroundArrival,
            },
            composition,
          );
        } else {
          drawScene(
          nextContext,
          nextChapter,
          nextIndex,
          {
            opacity: clamp(foregroundArrival * 1.24, 0, 1),
            translateX: directionX * (1 - foregroundArrival) * 18 - pointerX * 3,
            translateY: 10 * (1 - foregroundArrival) - pointerY * 2,
            scale: lerp(1.035, 1, foregroundArrival),
            rotate: -directionX * (1 - foregroundArrival) * 0.006,
            brightness: lerp(0.94, 1.14, foregroundArrival),
            saturate: lerp(0.98, 1.12, foregroundArrival),
            blur: lerp(0.7, 0, foregroundArrival),
          },
          imagesRef.current,
          { width: drawWidth, height: drawHeight },
          {
            pointerX: pointerX * 0.68,
            pointerY: pointerY * 0.68,
            pointerActive: pointerActive * 0.68,
            time: renderTime,
            idleStrength: foregroundArrival,
          },
          );
        }

        maskContext.clearRect(0, 0, drawWidth, drawHeight);
        drawTransitionAsset(maskContext, authoredArrivalMatteImage, drawWidth, drawHeight, {
          alpha: clamp(foregroundArrival * 1.2, 0, 1),
          scale: lerp(0.98, 1.14, foregroundArrival),
          offsetX: directionX * lerp(-30, 0, foregroundArrival),
          offsetY: lerp(8, 0, foregroundArrival),
          rotation: directionX * lerp(-0.004, 0, foregroundArrival),
        });
        nextContext.save();
        nextContext.globalCompositeOperation = "destination-in";
        nextContext.drawImage(maskCanvas, 0, 0, drawWidth, drawHeight);
        nextContext.restore();

        context.save();
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = clamp(foregroundArrival * 0.92, 0, 1);
        context.drawImage(nextCanvas, 0, 0, drawWidth, drawHeight);
        context.restore();

        const arrivalGlow = context.createRadialGradient(
          drawWidth * 0.58,
          drawHeight * 0.46,
          0,
          drawWidth * 0.58,
          drawHeight * 0.46,
          drawWidth * 0.44,
        );
        arrivalGlow.addColorStop(0, `rgba(196, 228, 255, ${0.08 * foregroundArrival})`);
        arrivalGlow.addColorStop(0.48, `rgba(113, 255, 169, ${0.035 * foregroundArrival})`);
        arrivalGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.fillStyle = arrivalGlow;
        context.fillRect(0, 0, drawWidth, drawHeight);
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    const requestRender = () => {
      if (animationFrame || !stageVisible || document.visibilityState === "hidden") {
        return;
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    const stageObserver =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(
            ([entry]) => {
              stageVisible = Boolean(entry?.isIntersecting);
              requestRender();
            },
            { rootMargin: "420px 0px", threshold: 0.01 },
          );
    stageObserver?.observe(canvas);
    document.addEventListener("visibilitychange", requestRender);
    requestRender();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      stageObserver?.disconnect();
      document.removeEventListener("visibilitychange", requestRender);
    };
  }, [chapters, stateRef]);

  return <canvas aria-hidden="true" className={cn("feature-story-compositor", className)} ref={canvasRef} />;
};

export default FeatureSceneCompositor;
