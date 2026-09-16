import { useState, type ImgHTMLAttributes } from "react";
import { generatedImageSeoIndex } from "@/lib/generatedImageSeoIndex";
import { generatedResponsiveWidths } from "@/lib/generatedResponsiveWidths";
import { generatedImagePath, withVersionQuery } from "../../shared/asset-image-plan";

interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

/** Browser-selected variants, with the original image retained as a network-error fallback. */
export function ResponsiveImage({
  src,
  alt,
  sizes = "(max-width: 640px) calc(100vw - 40px), (max-width: 1240px) calc(100vw - 68px), 1172px",
  loading = "lazy",
  decoding = "async",
  onError,
  ...props
}: ResponsiveImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const clean = src.split(/[?#]/)[0];
  const metadata = generatedImageSeoIndex[clean as keyof typeof generatedImageSeoIndex];
  const widths: readonly number[] | undefined =
    generatedResponsiveWidths[clean as keyof typeof generatedResponsiveWidths];
  const srcSet =
    failedSource !== src &&
    widths?.map((width) => `${withVersionQuery(generatedImagePath(clean, width), metadata?.[2])} ${width}w`).join(", ");
  return (
    <img
      width={metadata?.[0]}
      height={metadata?.[1] ? Math.round(metadata[0] / metadata[1]) : undefined}
      {...props}
      alt={alt}
      decoding={decoding}
      loading={loading}
      sizes={srcSet ? sizes : undefined}
      src={src}
      srcSet={srcSet || undefined}
      onError={(event) => {
        if (srcSet) setFailedSource(src);
        else onError?.(event);
      }}
    />
  );
}
