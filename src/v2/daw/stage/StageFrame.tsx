import "@/styles/daw.css";
import { type ReactNode, type RefObject, useLayoutEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Below this scale the 7–9 px labels stop being legible; show the static frame. */
export const MIN_ANIMATED_SCALE = 0.6;

/** Fits a fixed design width into the element's current width, never enlarging. */
export const useStageScale = (ref: RefObject<HTMLElement>, designWidth: number) => {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const outer = ref.current;
    if (!outer) return;
    const measure = () => setScale(Math.min(1, outer.clientWidth / designWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    return () => observer.disconnect();
  }, [ref, designWidth]);

  return scale;
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
  const dataAttributes = Object.fromEntries(
    Object.entries(data ?? {})
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key.startsWith("data-") ? key : `data-${key}`, String(value)]),
  );

  return (
    <div
      ref={outerRef}
      className={cn("daw-session daw-session--showcase relative w-full overflow-hidden", className)}
      style={{ height: Math.round(height * scale) }}
      role="img"
      aria-label={label}
      {...dataAttributes}
    >
      <div
        className="daw-session__stage absolute top-0 left-0 flex flex-col bg-daw-dark text-daw-text"
        style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
};
