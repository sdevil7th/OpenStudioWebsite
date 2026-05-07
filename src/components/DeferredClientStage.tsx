import { useEffect, useRef, useState, type ReactNode } from "react";
import { scheduleAfterInitialLoad } from "@/lib/initialLoad";

interface DeferredClientStageProps {
  children: ReactNode;
  className?: string;
  fallback: ReactNode;
  idle?: boolean;
  idleDelay?: number;
  idleTimeout?: number;
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
  idle = true,
  idleDelay = 1800,
  idleTimeout = 3200,
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

    let cancelIdleSchedule: (() => void) | undefined;
    let fallbackTimer = 0;

    const queueRender = () => {
      if (cancelIdleSchedule) {
        return;
      }

      if (!idle) {
        setShouldRender(true);
        return;
      }

      cancelIdleSchedule = scheduleAfterInitialLoad(
        () => setShouldRender(true),
        { delay: idleDelay, runOnInput: false, timeout: idleTimeout },
      );
    };

    if (!("IntersectionObserver" in window)) {
      fallbackTimer = window.setTimeout(queueRender, 240);
      return () => {
        window.clearTimeout(fallbackTimer);
        cancelIdleSchedule?.();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          queueRender();
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(element);
    return () => {
      window.clearTimeout(fallbackTimer);
      cancelIdleSchedule?.();
      observer.disconnect();
    };
  }, [idle, idleDelay, idleTimeout, rootMargin, shouldRender]);

  return (
    <div className={className} ref={ref}>
      {shouldRender ? children : fallback}
    </div>
  );
};

export default DeferredClientStage;
