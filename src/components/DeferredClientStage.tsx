import { useEffect, useRef, useState, type ReactNode } from "react";

interface DeferredClientStageProps {
  children: ReactNode;
  className?: string;
  fallback: ReactNode;
  rootMargin?: string;
}

const canLoadHeavyStage = () => {
  if (typeof navigator === "undefined") {
    return true;
  }

  const connection = (navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean };
  }).connection;

  return !connection?.saveData && connection?.effectiveType !== "slow-2g" && connection?.effectiveType !== "2g";
};

const DeferredClientStage = ({
  children,
  className,
  fallback,
  rootMargin = "900px 0px",
}: DeferredClientStageProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender || !canLoadHeavyStage()) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      const id = window.setTimeout(() => setShouldRender(true), 240);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return (
    <div className={className} ref={ref}>
      {shouldRender ? children : fallback}
    </div>
  );
};

export default DeferredClientStage;
