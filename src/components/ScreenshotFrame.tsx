import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getResponsiveImageAttributes } from "@/lib/assetLoading";
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
  const imageAttributes = getResponsiveImageAttributes(
    screenshot.src,
    variant === "hero" ? "hero/eager" : "below-fold",
    {
      maxWidth: variant === "hero" ? 1600 : 1280,
      sizes: variant === "hero" ? "(min-width: 1024px) 52vw, 100vw" : "(min-width: 1024px) 42vw, 100vw",
    },
  );

  return (
    <div className={cn(minimal ? "overflow-hidden" : "spotlight-border panel-surface overflow-hidden", heightClass, className)}>
      <AspectRatio ratio={ratio}>
        <div className={cn("relative h-full w-full overflow-hidden", minimal ? "bg-black" : "bg-[radial-gradient(circle_at_top,_rgba(42,227,255,0.16),_transparent_36%),radial-gradient(circle_at_82%_20%,_rgba(110,100,255,0.12),_transparent_24%),linear-gradient(180deg,_rgba(10,16,31,0.97),_rgba(6,10,22,0.94))]")}>
          {!minimal ? <div className="noise-overlay absolute inset-0" /> : null}
          {!minimal ? <div className="scanlines absolute inset-0" /> : null}
          {!minimal ? <div className="grid-overlay absolute inset-0 opacity-30" /> : null}
          {!hasError ? (
            <img
              {...imageAttributes}
              alt={screenshot.alt}
              className={cn(
                "screenshot-frame__image h-full w-full",
                fitMode === "contain" ? "object-contain p-2 md:p-3" : "object-cover",
              )}
              style={{ objectPosition: screenshot.focalPosition ?? "center center" }}
              onError={() => setHasError(true)}
            />
          ) : null}
          {!minimal ? <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,4,12,0.02)_0%,rgba(1,4,12,0.08)_100%)]" /> : null}
          {hasError ? <div className="absolute inset-0 bg-black" aria-hidden="true" /> : null}
        </div>
      </AspectRatio>
    </div>
  );
};

export default ScreenshotFrame;
