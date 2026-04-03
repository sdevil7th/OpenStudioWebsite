import { useEffect, useMemo, useRef, useState } from "react";
import type { Variants } from "framer-motion";
import {
  clearCache,
  layoutWithLines,
  prepareWithSegments,
} from "@chenglou/pretext";

export const PRETEXT_ENGINE = "@chenglou/pretext";

export const pretextContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.03,
    },
  },
};

export const pretextLine: Variants = {
  hidden: {
    opacity: 0,
    y: 48,
    rotateX: -26,
    filter: "blur(18px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.92,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const pretextCaption: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    clipPath: "inset(0 0 100% 0)",
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0 0 0% 0)",
    filter: "blur(0px)",
    transition: {
      duration: 0.62,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const pretextMedia: Variants = {
  hidden: {
    opacity: 0,
    y: 34,
    scale: 0.94,
    rotateX: -8,
    filter: "blur(20px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const pretextTrustNote: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    letterSpacing: "0.28em",
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    letterSpacing: "0.16em",
    filter: "blur(0px)",
    transition: {
      duration: 0.72,
      ease: [0.2, 0.8, 0.2, 1],
    },
  },
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

const fallbackSplit = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.:])\s+|,\s+(?=[A-Z])/)
    .filter(Boolean);

const preparedTextCache = new Map<string, ReturnType<typeof prepareWithSegments>>();

const getPreparedText = (text: string, font: string, whiteSpace: "normal" | "pre-wrap") => {
  const cacheKey = `${font}::${whiteSpace}::${text}`;
  const cached = preparedTextCache.get(cacheKey);
  if (cached) return cached;

  const prepared = prepareWithSegments(text, font, { whiteSpace });
  preparedTextCache.set(cacheKey, prepared);
  return prepared;
};

const getLineHeightFromStyle = (style: CSSStyleDeclaration) => {
  const parsedLineHeight = Number.parseFloat(style.lineHeight);
  const parsedFontSize = Number.parseFloat(style.fontSize);
  const fallbackLineHeight = parsedFontSize * 1.08;
  return Number.isFinite(parsedLineHeight) ? parsedLineHeight : fallbackLineHeight;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface UsePretextLinesOptions {
  text: string;
  whiteSpace?: "normal" | "pre-wrap";
}

export const usePretextLines = ({ text, whiteSpace = "normal" }: UsePretextLinesOptions) => {
  const measureRef = useRef<HTMLElement | null>(null);
  const [lines, setLines] = useState<string[]>(() => fallbackSplit(text));

  useEffect(() => {
    const node = measureRef.current;
    if (!node || typeof window === "undefined") {
      return;
    }

    let active = true;

    const measure = () => {
      if (!active || !measureRef.current) {
        return;
      }

      const width = measureRef.current.clientWidth;
      if (width <= 0) {
        return;
      }

      try {
        const style = window.getComputedStyle(measureRef.current);
        const font = buildFontShorthand(style);
        const lineHeight = getLineHeightFromStyle(style);
        const prepared = getPreparedText(text, font, whiteSpace);
        const result = layoutWithLines(prepared, width, lineHeight);
        const nextLines = result.lines.map((line) => line.text).filter(Boolean);
        if (nextLines.length > 0) {
          setLines(nextLines);
        }
      } catch {
        setLines(fallbackSplit(text));
      }
    };

    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(node);
    void document.fonts.ready.then(() => {
      measure();
    });
    measure();

    return () => {
      active = false;
      resizeObserver.disconnect();
      clearCache();
    };
  }, [text, whiteSpace]);

  return {
    measureRef,
    lines,
  };
};

export const splitHeadline = (headline: string) => {
  const fallback = fallbackSplit(headline);
  return fallback.length > 0 ? fallback : [headline];
};

export const usePretextHeadline = (text: string) => {
  const fallback = useMemo(() => splitHeadline(text), [text]);
  const { measureRef, lines } = usePretextLines({ text });

  return {
    measureRef,
    lines: lines.length > 0 ? lines : fallback,
  };
};
