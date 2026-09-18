import { useEffect, useRef } from "react";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { createAuraPainter, AURA_WIDTH, AURA_HEIGHT } from "@/features/hero-aura/renderer";
import { AURA_REST_FRAME } from "@/features/hero-aura/generatedRestFrame";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Local light curtains, with the renderer's exact first frame as the fallback. */
const HeroAuraBackdrop = () => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const backdrop = backdropRef.current;
    const canvas = canvasRef.current;
    if (!backdrop || !canvas || reducedMotion || !("IntersectionObserver" in window)) return;
    const paint = createAuraPainter(canvas);
    if (!paint) return;
    paint(0);
    backdrop.dataset.ready = "true";

    let intersecting = false;
    let frame: number | null = null;
    let previous = 0;
    let elapsed = 0;
    const tick = (now: number) => {
      if (now - previous >= 1000 / 30) {
        elapsed += Math.min(now - previous, 100) / 1000;
        previous = now;
        paint(elapsed);
      }
      frame = requestAnimationFrame(tick);
    };
    const updatePlayback = () => {
      const playing = intersecting && document.visibilityState === "visible";
      backdrop.dataset.playing = String(playing);
      if (playing && frame === null) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!playing && frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      updatePlayback();
    });
    observer.observe(backdrop);
    document.addEventListener("visibilitychange", updatePlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      if (frame !== null) cancelAnimationFrame(frame);
      delete backdrop.dataset.ready;
      delete backdrop.dataset.playing;
    };
  }, [reducedMotion]);

  return (
    <div aria-hidden="true" className="sp-hero-aura__bg" ref={backdropRef}>
      <ResponsiveImage
        src={AURA_REST_FRAME}
        alt=""
        width={AURA_WIDTH}
        height={AURA_HEIGHT}
        loading="eager"
        sizes="100vw"
        className="sp-hero-aura__rest"
      />
      <canvas ref={canvasRef} className="sp-hero-aura__canvas" />
    </div>
  );
};

export default HeroAuraBackdrop;
