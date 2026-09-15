// Display-only fork of the closed state of OpenStudio
// frontend/src/components/ui/Select (Select.tsx + Select.types.ts
// @ d2056151222fefcede123ef614ec38c6893cbfd5): the `xs` size and the
// `compact` / `accent` variant classes are copied; the native <select> and its
// option list become a static box with the same chevron.
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const variantStyles = {
  compact: "bg-neutral-800 border border-neutral-700 text-neutral-400",
  accent: "bg-emerald-700 border border-emerald-600 text-white",
} as const;

export interface SelectLiteProps {
  value: string;
  variant?: keyof typeof variantStyles;
  /** Box width in px; the label truncates like the native control does. */
  width: number;
  title?: string;
  className?: string;
}

export const SelectLite = ({ value, variant = "compact", width, title, className }: SelectLiteProps) => (
  <span className={cn("relative inline-flex min-w-0 shrink-0", className)} style={{ width }} title={title ?? value}>
    <span
      className={cn("w-full h-5 pl-1.5 pr-5 py-0.5 text-[10px] leading-4 rounded overflow-hidden whitespace-nowrap text-clip", variantStyles[variant])}
      role="combobox"
      aria-expanded={false}
      aria-label={title ?? value}
    >
      {value}
    </span>
    <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
  </span>
);
