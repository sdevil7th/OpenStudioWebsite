import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

interface SectionRevealProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
}

const SectionReveal = ({ children, className, delay = 0, style, ...props }: SectionRevealProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(Boolean(prefersReducedMotion));

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.18 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div
      className={cn("section-reveal", className)}
      data-section-reveal={visible ? "visible" : "hidden"}
      ref={ref}
      style={{ ...style, ["--section-reveal-delay" as string]: `${delay}s` } as CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
};

export default SectionReveal;
