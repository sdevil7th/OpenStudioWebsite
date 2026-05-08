import { useEffect, useRef } from "react";

const ScrollProgress = () => {
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frameId = 0;

    const updateProgress = () => {
      frameId = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      progressRef.current?.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, progress))));
    };

    const scheduleUpdate = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-primary via-secondary to-accent"
      ref={progressRef}
      style={{ transform: "scaleX(var(--scroll-progress, 0))" }}
    />
  );
};

export default ScrollProgress;
