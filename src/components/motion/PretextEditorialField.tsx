import { useEffect, useMemo, useRef, useState } from "react";
import { layoutWithLines, prepareWithSegments, clearCache } from "@chenglou/pretext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

type EditorialVariant = "features" | "ai";

interface PretextEditorialFieldProps {
  className?: string;
  cursorRepel?: boolean;
  forceCount?: number;
  text: string;
  variant: EditorialVariant;
  visibleObjects?: boolean;
}

interface EditorialFragment {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  lineHeight: number;
}

const AI_OBJECT_LABELS = ["signal"];

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const smooth = (value: number) => {
  const clamped = clamp(value);
  return clamped * clamped * (3 - 2 * clamped);
};

const buildFontShorthand = (style: CSSStyleDeclaration) =>
  [
    style.fontStyle,
    style.fontVariantCaps && style.fontVariantCaps !== "normal" ? style.fontVariantCaps : "",
    style.fontWeight,
    style.fontSize,
    style.fontFamily,
  ]
    .filter(Boolean)
    .join(" ");

const getLineHeight = (style: CSSStyleDeclaration) => {
  const lineHeight = Number.parseFloat(style.lineHeight);
  const fontSize = Number.parseFloat(style.fontSize);
  return Number.isFinite(lineHeight) ? lineHeight : fontSize * 1.55;
};

const measureToken = (() => {
  let canvas: HTMLCanvasElement | undefined;
  return (token: string, font: string) => {
    canvas ??= document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return token.length * 8;
    }
    context.font = font;
    return context.measureText(token).width;
  };
})();

const makeForcePoint = (index: number, time: number, width: number, height: number, variant: EditorialVariant) => {
  const seed = index + 1;
  const spanX = variant === "ai" ? 0.54 : 0.46;
  const spanY = variant === "ai" ? 0.5 : 0.42;
  return {
    x:
      width *
      (0.5 +
        Math.sin(time * (0.34 + seed * 0.03) + seed * 1.41) * spanX +
        Math.sin(time * (0.73 + seed * 0.017) + seed * 0.37) * 0.08),
    y:
      height *
      (0.5 +
        Math.cos(time * (0.29 + seed * 0.025) + seed * 1.13) * spanY +
        Math.sin(time * (0.61 + seed * 0.013) + seed * 2.1) * 0.11),
    z: Math.sin(time * (0.45 + seed * 0.02) + seed * 0.86) * 90,
    phase: (Math.sin(time * (0.54 + seed * 0.019) + seed * 0.76) + 1) * 0.5,
  };
};

const clearVars = (node: HTMLElement) => {
  node.style.setProperty("--pretext-x", "0px");
  node.style.setProperty("--pretext-y", "0px");
  node.style.setProperty("--pretext-z", "0px");
  node.style.setProperty("--pretext-rx", "0deg");
  node.style.setProperty("--pretext-ry", "0deg");
  node.style.setProperty("--pretext-rz", "0deg");
  node.style.setProperty("--pretext-scale-x", "1");
  node.style.setProperty("--pretext-glow", "0");
  node.style.setProperty("--pretext-blur", "0px");
};

const PretextEditorialField = ({
  className,
  cursorRepel = false,
  forceCount,
  text,
  variant,
  visibleObjects = false,
}: PretextEditorialFieldProps) => {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLParagraphElement | null>(null);
  const fragmentRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const objectRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const layoutRef = useRef({ width: 1, height: 1, left: 0, top: 0 });
  const pointerRef = useRef({ x: 0, y: 0, active: 0 });
  const reduceMotion = usePrefersReducedMotion();
  const [fragments, setFragments] = useState<EditorialFragment[]>([]);
  const [height, setHeight] = useState(0);
  const objectLabels = useMemo(
    () => (visibleObjects && variant === "ai" ? AI_OBJECT_LABELS : []),
    [variant, visibleObjects],
  );

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const measure = measureRef.current;
    const field = fieldRef.current;
    if (!measure || !field || typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(max-width: 767px)").matches) {
      return;
    }

    let active = true;
    const renderLayout = () => {
      if (!active || !measureRef.current || !fieldRef.current) {
        return;
      }

      const width = Math.max(1, measureRef.current.clientWidth);
      const style = window.getComputedStyle(measureRef.current);
      const font = buildFontShorthand(style);
      const lineHeight = getLineHeight(style);
      const prepared = prepareWithSegments(text, font);
      const result = layoutWithLines(prepared, width, lineHeight);
      const nextFragments: EditorialFragment[] = [];

      result.lines.forEach((line, lineIndex) => {
        const tokens = line.text.match(/\S+\s*/g) ?? [];
        let x = 0;
        tokens.forEach((token, tokenIndex) => {
          const tokenWidth = measureToken(token, font);
          nextFragments.push({
            id: `${lineIndex}-${tokenIndex}-${token}`,
            text: token,
            x,
            y: lineIndex * lineHeight,
            width: tokenWidth,
            lineHeight,
          });
          x += tokenWidth;
        });
      });

      layoutRef.current.width = width;
      layoutRef.current.height = Math.max(lineHeight, result.height);
      setHeight(result.height);
      setFragments(nextFragments);
    };

    const observer = new ResizeObserver(() => {
      renderLayout();
      const rect = field.getBoundingClientRect();
      layoutRef.current.left = rect.left;
      layoutRef.current.top = rect.top;
    });
    observer.observe(measure);

    void document.fonts.ready.then(renderLayout);
    renderLayout();

    return () => {
      active = false;
      observer.disconnect();
      clearCache();
    };
  }, [reduceMotion, text]);

  useEffect(() => {
    if (reduceMotion || fragments.length === 0) {
      return;
    }

    const field = fieldRef.current;
    if (!field || window.matchMedia("(max-width: 767px)").matches) {
      return;
    }

    let frameId = 0;
    let inView = true;
    const startedAt = performance.now();
    const forces = forceCount ?? (variant === "ai" ? 2 : 2);
    const radius = variant === "ai" ? 72 : 92;
    const intensity = variant === "ai" ? 0.45 : 0.36;
    const activationThreshold = variant === "ai" ? 0.42 : 0.15;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
      },
      { rootMargin: "24% 0px" },
    );
    observer.observe(field);

    const updateFieldRect = () => {
      const rect = field.getBoundingClientRect();
      layoutRef.current.left = rect.left;
      layoutRef.current.top = rect.top;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!cursorRepel) {
        return;
      }
      pointerRef.current.x = event.clientX - layoutRef.current.left;
      pointerRef.current.y = event.clientY - layoutRef.current.top;
      pointerRef.current.active = 1;
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = 0;
    };

    updateFieldRect();
    window.addEventListener("scroll", updateFieldRect, { passive: true });
    window.addEventListener("resize", updateFieldRect);
    if (cursorRepel) {
      field.addEventListener("pointermove", handlePointerMove);
      field.addEventListener("pointerleave", handlePointerLeave);
      field.addEventListener("pointercancel", handlePointerLeave);
    }

    const tick = (now: number) => {
      const time = (now - startedAt) / 1000;
      const width = layoutRef.current.width;
      const fieldHeight = Math.max(1, layoutRef.current.height);
      const points = Array.from({ length: forces }, (_, index) => makeForcePoint(index, time, width, fieldHeight, variant));

      if (cursorRepel && pointerRef.current.active > 0.01) {
        points.push({
          x: pointerRef.current.x,
          y: pointerRef.current.y,
          z: 130,
          phase: 1,
        });
        pointerRef.current.active = clamp(pointerRef.current.active * 0.94, 0, 1);
      }

      objectRefs.current.forEach((object, index) => {
        if (!object) {
          return;
        }
        const point = points[index % points.length] ?? makeForcePoint(index, time, width, fieldHeight, variant);
        object.style.setProperty("--pretext-object-x", `${point.x.toFixed(2)}px`);
        object.style.setProperty("--pretext-object-y", `${point.y.toFixed(2)}px`);
        object.style.setProperty("--pretext-object-z", `${point.z.toFixed(2)}px`);
        object.style.setProperty("--pretext-object-alpha", inView ? `${(0.22 + point.phase * 0.56).toFixed(3)}` : "0");
      });

      fragments.forEach((fragment, index) => {
        const node = fragmentRefs.current[index];
        if (!node || !inView) {
          if (node) clearVars(node);
          return;
        }

        const centerX = fragment.x + fragment.width * 0.5;
        const centerY = fragment.y + fragment.lineHeight * 0.52;
        let strongest = 0;
        let pushX = 0;
        let pushY = 0;
        let depth = 0;

        points.forEach((point, pointIndex) => {
          const dx = centerX - point.x;
          const dy = centerY - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const localRadius = radius * (0.82 + point.phase * 0.36) * (pointIndex >= forces ? 1.55 : 1);
          const force = smooth(1 - distance / localRadius) * (pointIndex >= forces ? 1.45 : 1);
          if (force <= strongest) {
            return;
          }

          const normal = Math.max(1, distance);
          strongest = force;
          pushX = (dx / normal) * force;
          pushY = (dy / normal) * force;
          depth = point.z / 120;
        });

        if (strongest < activationThreshold) {
          clearVars(node);
          return;
        }

        const activeForce = smooth((strongest - activationThreshold) / (1 - activationThreshold));
        const direction = variant === "ai" ? 1 : -1;
        const xTravel = variant === "ai" ? 16 : 5;
        const yTravel = variant === "ai" ? 11 : 5;
        node.style.setProperty("--pretext-x", `${(pushX * xTravel * intensity * activeForce).toFixed(2)}px`);
        node.style.setProperty("--pretext-y", `${(pushY * yTravel * intensity * activeForce - activeForce * 1.1).toFixed(2)}px`);
        node.style.setProperty("--pretext-z", `${(activeForce * 18 + depth * 4).toFixed(2)}px`);
        node.style.setProperty("--pretext-rx", `${(-pushY * 4.5 * activeForce).toFixed(2)}deg`);
        node.style.setProperty("--pretext-ry", `${(pushX * 5.5 * activeForce).toFixed(2)}deg`);
        node.style.setProperty("--pretext-rz", `${(pushX * direction * 0.9 * activeForce).toFixed(2)}deg`);
        node.style.setProperty("--pretext-scale-x", `${(1 - activeForce * 0.018).toFixed(3)}`);
        node.style.setProperty("--pretext-glow", activeForce.toFixed(3));
        node.style.setProperty("--pretext-blur", `${(activeForce * (variant === "ai" ? 0.18 : 0.12)).toFixed(2)}px`);
      });

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("scroll", updateFieldRect);
      window.removeEventListener("resize", updateFieldRect);
      if (cursorRepel) {
        field.removeEventListener("pointermove", handlePointerMove);
        field.removeEventListener("pointerleave", handlePointerLeave);
        field.removeEventListener("pointercancel", handlePointerLeave);
      }
    };
  }, [cursorRepel, forceCount, fragments, reduceMotion, variant]);

  if (reduceMotion) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div
      className={cn("pretext-editorial-field", `pretext-editorial-field--${variant}`, className)}
      data-pretext-editorial-field
      data-pretext-variant={variant}
      ref={fieldRef}
      style={{ minHeight: height ? `${height}px` : undefined }}
    >
      <p ref={measureRef} className="pretext-editorial-field__measure">
        {text}
      </p>
      <p className="pretext-editorial-field__static">{text}</p>
      {height > 0 ? (
        <div className="pretext-editorial-field__stage" aria-label={text} style={{ height }}>
          {fragments.map((fragment, index) => (
            <span
              className="pretext-editorial-field__fragment"
              data-pretext-fragment
              key={fragment.id}
              ref={(node) => {
                fragmentRefs.current[index] = node;
              }}
              style={{
                left: `${fragment.x}px`,
                top: `${fragment.y}px`,
                lineHeight: `${fragment.lineHeight}px`,
              }}
            >
              {fragment.text}
            </span>
          ))}
          {objectLabels.map((label, index) => (
            <span
              className={cn(
                "pretext-editorial-field__object",
                "pretext-editorial-field__object--grain",
              )}
              aria-hidden="true"
              data-pretext-force-object
              key={label}
              ref={(node) => {
                objectRefs.current[index] = node;
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default PretextEditorialField;
