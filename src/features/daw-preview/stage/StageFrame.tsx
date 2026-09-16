import "@/styles/daw.css";
import { type ReactNode, type RefObject, useContext, useEffect, useLayoutEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { StaticRenderContext } from "@/lib/staticRender";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Below this scale the 7–9 px labels stop being legible; show the static frame. */
export const MIN_ANIMATED_SCALE = 0.6;

/**
 * Fits a fixed design width to the element's current width, in both
 * directions: a column wider than the design scales the stage up so it fills
 * the frame like the screenshot it replaces (the UI is vector apart from the
 * 96 px knob sprites, which stay crisp to about 1.6×).
 */
export const useStageScale = (ref: RefObject<HTMLElement>, designWidth: number) => {
  const [scale, setScale] = useState(1);

  useBrowserLayoutEffect(() => {
    const outer = ref.current;
    if (!outer) return;
    const measure = () => setScale(outer.clientWidth / designWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    return () => observer.disconnect();
  }, [ref, designWidth]);

  return scale;
};

/**
 * Lays a stage out at the frame's own width instead of scaling a fixed design:
 * controls keep their size and the panels get wider. Below `minWidth` the
 * stage stays at `minWidth` and scales down like the other stages.
 */
export const useStageFit = (ref: RefObject<HTMLElement>, minWidth: number) => {
  const [available, setAvailable] = useState(minWidth);

  useBrowserLayoutEffect(() => {
    const outer = ref.current;
    if (!outer) return;
    const measure = () => setAvailable(outer.clientWidth || minWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    return () => observer.disconnect();
  }, [ref, minWidth]);

  const width = Math.max(minWidth, Math.round(available));
  return { width, scale: Math.min(1, available / width) };
};

interface StageFrameProps {
  outerRef: RefObject<HTMLDivElement>;
  width: number;
  height: number;
  scale: number;
  /** Read by assistive tech; the stage itself is an image, not a control. */
  label: string;
  className?: string;
  children: ReactNode;
  /** Free-form data attributes for the wrapper (e.g. `data-transport`). */
  data?: Record<string, string | number | boolean | undefined>;
}

/**
 * A DAW stage laid out at a fixed design size and CSS-scaled to the column it
 * sits in. Watched, not operated: `.daw-session--showcase` turns pointer
 * events off for the whole stage (see daw.css).
 */
export const StageFrame = ({ outerRef, width, height, scale, label, className, children, data }: StageFrameProps) => {
  const staticRender = useContext(StaticRenderContext);
  const dataAttributes = Object.fromEntries(
    Object.entries(data ?? {})
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key.startsWith("data-") ? key : `data-${key}`, String(value)]),
  );

  const stage = (
    <div
      {...{ inert: "" }}
      aria-hidden="true"
      className="daw-session__stage absolute top-0 left-0 flex flex-col bg-daw-dark text-daw-text"
      style={{ width, height, transform: `scale(${staticRender ? 1 : scale})`, transformOrigin: "top left" }}
    >
      {children}
    </div>
  );

  return (
    <div
      ref={outerRef}
      className={cn("daw-session daw-session--showcase relative w-full overflow-hidden", className)}
      style={{ height: staticRender ? "100%" : Math.round(height * scale) }}
      role="img"
      aria-label={label}
      data-static-frame={staticRender ? "true" : undefined}
      {...dataAttributes}
    >
      {staticRender ? (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          <foreignObject width={width} height={height}>{stage}</foreignObject>
        </svg>
      ) : stage}
    </div>
  );
};
