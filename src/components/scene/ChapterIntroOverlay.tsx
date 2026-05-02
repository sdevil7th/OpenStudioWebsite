import { useEffect, useLayoutEffect, useRef } from "react";
import type { FeatureChapter } from "@/data/marketing";
import type { FeatureSceneCompositorState } from "@/components/scene/FeatureSceneCompositor";
import { splitText } from "@/lib/splitText";
import { cn } from "@/lib/utils";

interface ChapterIntroOverlayProps {
  chapters: FeatureChapter[];
  stateRef: React.MutableRefObject<FeatureSceneCompositorState>;
  className?: string;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const span = edge1 - edge0;
  if (span <= 0) {
    return value >= edge1 ? 1 : 0;
  }
  const t = clamp01((value - edge0) / span);
  return t * t * (3 - 2 * t);
};

const ChapterIntroOverlay = ({ chapters, stateRef, className }: ChapterIntroOverlayProps) => {
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const numeralRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const titleRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const taglineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const ruleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const wordsByChapter = useRef<HTMLElement[][]>([]);

  useLayoutEffect(() => {
    const reverts: Array<() => void> = [];

    wordsByChapter.current = chapters.map((_, index) => {
      const layer = layerRefs.current[index];
      const titleNode = layer?.querySelector<HTMLHeadingElement>("[data-intro-title]");
      if (!titleNode) {
        return [];
      }
      const result = splitText(titleNode, false);
      reverts.push(result.revert);
      return result.words;
    });

    return () => {
      reverts.forEach((revert) => revert());
    };
  }, [chapters]);

  useEffect(() => {
    let rafId = 0;

    const render = () => {
      const state = stateRef.current;
      const activeIndex = state.activeIndex ?? 0;
      const intro = clamp01(state.introProgress ?? 0);
      const scene = clamp01(state.sceneProgress ?? 0);
      const pointerActive = clamp01(state.pointerActive ?? 0) * (1 - clamp01(state.burnProgress ?? 0) * 0.42);
      const pointerX = clamp01((state.pointerX ?? 0) * 0.5 + 0.5) * 2 - 1;
      const pointerY = clamp01((state.pointerY ?? 0) * 0.5 + 0.5) * 2 - 1;
      const driftX = pointerX * pointerActive;
      const driftY = pointerY * pointerActive;

      layerRefs.current.forEach((layer, index) => {
        if (!layer) {
          return;
        }

        const isActive = index === activeIndex;
        let opacity = 0;

        if (isActive) {
          const fadeIn = smoothstep(0, 0.25, intro);
          const fadeOut = 1 - smoothstep(0.64, 0.92, intro) * (0.82 + scene * 0.18);
          opacity = fadeIn * Math.max(0, fadeOut);
        }

        layer.style.opacity = String(opacity);
        layer.style.pointerEvents = "none";
        layer.style.transform = `translate3d(${driftX * (10 + index * 2)}px, ${driftY * (8 + index * 2)}px, 0)`;

        const numeral = numeralRefs.current[index];
        if (numeral) {
          const reveal = isActive ? smoothstep(0, 0.55, intro) : 0;
          numeral.style.opacity = String(reveal);
          numeral.style.transform = `translate3d(${driftX * 20}px, ${(1 - reveal) * 24 + driftY * 16}px, 0) scale(${0.82 + reveal * 0.18})`;
          numeral.style.letterSpacing = `${-0.02 + (1 - reveal) * 0.04}em`;
        }

        const rule = ruleRefs.current[index];
        if (rule) {
          const reveal = isActive ? smoothstep(0.2, 0.6, intro) : 0;
          rule.style.opacity = String(0.9 * reveal);
          rule.style.transform = `translate3d(${driftX * 8}px, ${driftY * 6}px, 0) scaleX(${reveal})`;
        }

        const title = titleRefs.current[index];
        if (title) {
          title.style.transform = `translate3d(${driftX * 14}px, ${driftY * 10}px, 0)`;
        }

        const words = wordsByChapter.current[index] ?? [];
        const wordCount = Math.max(1, words.length);
        const perWord = 0.7 / wordCount;
        words.forEach((word, wordIndex) => {
          const start = 0.22 + wordIndex * perWord;
          const end = start + 0.32;
          const reveal = isActive ? smoothstep(start, end, intro) : 0;
          word.style.clipPath = `inset(0 ${(1 - reveal) * 100}% 0 0)`;
          word.style.transform = `translate3d(0, ${(1 - reveal) * 28}px, 0)`;
          word.style.opacity = String(Math.max(0.0001, reveal));
        });

        const tagline = taglineRefs.current[index];
        if (tagline) {
          const reveal = isActive ? smoothstep(0.55, 0.95, intro) : 0;
          tagline.style.opacity = String(reveal);
          tagline.style.transform = `translate3d(${driftX * 10}px, ${(1 - reveal) * 18 + driftY * 8}px, 0)`;
          tagline.style.letterSpacing = `${0.24 + (1 - reveal) * 0.12}em`;
        }
      });

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [stateRef, chapters]);

  return (
    <div aria-hidden="true" className={cn("chapter-intro-overlay", className)}>
      {chapters.map((chapter, index) => {
        const accent = chapter.accent ?? "lavender";
        const numeral = chapter.numeral ?? String(index + 1);
        const introTitle = chapter.introTitle ?? chapter.label;

        return (
          <div
            className="chapter-intro-overlay__layer"
            data-chapter-id={chapter.id}
            key={chapter.id}
            ref={(element) => {
              layerRefs.current[index] = element;
            }}
          >
            <span
              className="chapter-intro-overlay__numeral"
              data-accent={accent}
              ref={(element) => {
                numeralRefs.current[index] = element;
              }}
            >
              {numeral}
            </span>
            <span
              aria-hidden="true"
              className="chapter-intro-overlay__rule"
              ref={(element) => {
                ruleRefs.current[index] = element;
              }}
            />
            <h2
              className="chapter-intro-overlay__title"
              data-intro-title
              ref={(element) => {
                titleRefs.current[index] = element;
              }}
            >
              {introTitle}
            </h2>
            {chapter.introTagline ? (
              <p
                className="chapter-intro-overlay__tagline"
                ref={(element) => {
                  taglineRefs.current[index] = element;
                }}
              >
                {chapter.introTagline}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default ChapterIntroOverlay;
