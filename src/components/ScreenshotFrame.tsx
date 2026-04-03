import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import type { ScreenshotAsset } from "@/data/screenshots";

interface ScreenshotFrameProps {
  screenshot: ScreenshotAsset;
  ratio?: number;
  className?: string;
  variant?: "hero" | "chapter" | "atlas" | "gallery" | "minimal";
}

const ScreenshotFrame = ({ screenshot, ratio = 16 / 10, className, variant = "chapter" }: ScreenshotFrameProps) => {
  const [hasError, setHasError] = useState(false);
  const heightClass =
    variant === "hero" ? "rounded-[2rem]" : variant === "gallery" ? "rounded-[1.75rem]" : "rounded-[1.6rem]";
  const minimal = variant === "minimal";
  const fitMode = screenshot.fit ?? (minimal ? "contain" : "cover");

  return (
    <div className={cn(minimal ? "overflow-hidden" : "spotlight-border panel-surface overflow-hidden", heightClass, className)}>
      <AspectRatio ratio={ratio}>
        <div className={cn("relative h-full w-full overflow-hidden", minimal ? "bg-black" : "bg-[radial-gradient(circle_at_top,_rgba(42,227,255,0.16),_transparent_36%),radial-gradient(circle_at_82%_20%,_rgba(110,100,255,0.12),_transparent_24%),linear-gradient(180deg,_rgba(10,16,31,0.97),_rgba(6,10,22,0.94))]")}>
          {!minimal ? <div className="noise-overlay absolute inset-0" /> : null}
          {!minimal ? <div className="scanlines absolute inset-0" /> : null}
          {!minimal ? <div className="grid-overlay absolute inset-0 opacity-30" /> : null}
          {!hasError ? (
            <motion.img
              src={screenshot.src}
              alt={screenshot.alt}
              className={cn(
                "h-full w-full",
                fitMode === "contain" ? "object-contain p-2 md:p-3" : "object-cover",
              )}
              initial={{ scale: 1.08, opacity: 0.74, rotateX: -5 }}
              style={{ objectPosition: screenshot.focalPosition ?? "center center" }}
              whileInView={{ scale: 1, opacity: 1, rotateX: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
              onError={() => setHasError(true)}
            />
          ) : null}
          {!minimal ? <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,4,12,0.02)_0%,rgba(1,4,12,0.08)_100%)]" /> : null}
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary">
                <AlertCircle className="h-4 w-4" />
                Screenshot placeholder
              </div>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">{screenshot.alt}</p>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-white/55">{screenshot.src}</p>
            </div>
          ) : null}
        </div>
      </AspectRatio>
    </div>
  );
};

export default ScreenshotFrame;
