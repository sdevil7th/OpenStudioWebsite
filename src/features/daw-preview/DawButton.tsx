// Props-only fork of OpenStudio frontend/src/components/ui/Button (Button.tsx +
// Button.types.ts @ d2056151222fefcede123ef614ec38c6893cbfd5). The class maps
// are copied verbatim; loading/icon-slot behaviour the showcase never uses is
// dropped, and `classnames` becomes the site's `cn`.
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DawButtonSize = "xs" | "sm" | "md" | "lg" | "icon-xs" | "icon-sm" | "icon-md" | "icon-lg";
export type DawButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "orange"
  | "emerald"
  | "ghost";
export type DawButtonShape = "default" | "circle" | "square";
export type DawActiveStyle = "solid" | "glow" | "subtle";

const buttonSizeStyles: Record<DawButtonSize, string> = {
  xs: "h-5 px-1.5 text-[10px]",
  sm: "h-6 px-2 text-[11px]",
  md: "h-8 px-3 text-sm",
  lg: "h-10 px-4 text-base",
  "icon-xs": "w-4 h-6 text-[10px]",
  "icon-sm": "w-6 h-6 text-[10px]",
  "icon-md": "w-7 h-7 text-xs",
  "icon-lg": "w-8 h-8 text-sm",
};

const buttonVariantStyles: Record<DawButtonVariant, string> = {
  default:
    "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700/50 hover:text-neutral-200 hover:border-neutral-600",
  primary: "bg-blue-600 text-white hover:bg-blue-500 font-medium",
  secondary: "bg-daw-dark border border-daw-border text-daw-text hover:bg-daw-lighter",
  success:
    "bg-neutral-800 text-green-500 border border-neutral-700 hover:bg-green-900/40 hover:text-green-400 hover:border-green-700",
  warning:
    "bg-neutral-800 text-yellow-500 border border-neutral-700 hover:bg-yellow-900/40 hover:text-yellow-400 hover:border-yellow-700",
  danger:
    "bg-neutral-800 text-red-500 border border-neutral-700 hover:bg-red-900/40 hover:text-red-400 hover:border-red-700",
  purple:
    "bg-neutral-800 text-purple-500 border border-neutral-700 hover:bg-purple-900/40 hover:text-purple-400 hover:border-purple-700",
  orange:
    "bg-neutral-800 text-orange-400 border border-neutral-600 hover:bg-orange-900/40 hover:text-orange-300 hover:border-orange-700",
  emerald: "bg-emerald-700 border border-emerald-600 text-white hover:bg-emerald-600",
  ghost: "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/40",
};

const buttonActiveStyles: Record<DawButtonVariant, string> = {
  default: "bg-neutral-600 text-white border border-neutral-400 hover:bg-neutral-500",
  primary: "bg-blue-700 text-white hover:bg-blue-600",
  secondary: "bg-daw-lighter text-white",
  success: "bg-green-700 text-white border border-green-600 hover:bg-green-600",
  warning: "bg-yellow-500 text-black border border-yellow-600 hover:bg-yellow-400",
  danger: "bg-red-600 text-white border border-red-500 hover:bg-red-500 hover:border-red-400",
  purple: "bg-purple-700 text-white border border-purple-600 hover:bg-purple-600",
  orange: "bg-orange-500 text-black border border-orange-400 hover:bg-orange-400",
  emerald: "bg-emerald-600 text-white hover:bg-emerald-500",
  ghost: "bg-neutral-600 text-white hover:bg-neutral-500",
};

const activeEffectStyles: Record<DawActiveStyle, string> = {
  solid: "",
  glow: "shadow-[0_0_8px_rgba(229,57,53,0.5)]",
  subtle: "shadow-[0_0_5px_rgba(255,255,255,0.1)]",
};

const shapeStyles: Record<DawButtonShape, string> = {
  default: "rounded",
  circle: "rounded-full",
  square: "rounded-none",
};

export interface DawButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: DawButtonVariant;
  size?: DawButtonSize;
  shape?: DawButtonShape;
  active?: boolean;
  activeStyle?: DawActiveStyle;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

export const DawButton = ({
  variant = "default",
  size = "md",
  shape = "default",
  active = false,
  activeStyle = "solid",
  fullWidth = false,
  disabled = false,
  className,
  children,
  type = "button",
  ...rest
}: DawButtonProps) => (
  <button
    type={type}
    disabled={disabled}
    aria-pressed={active || undefined}
    className={cn(
      "inline-flex items-center justify-center font-bold transition-all hover:cursor-pointer active:scale-[0.97]",
      "select-none",
      buttonSizeStyles[size],
      active ? buttonActiveStyles[variant] : buttonVariantStyles[variant],
      active && activeEffectStyles[activeStyle],
      shapeStyles[shape],
      fullWidth && "w-full",
      disabled && "opacity-50 cursor-not-allowed hover:cursor-not-allowed active:scale-100",
      className,
    )}
    {...rest}
  >
    {children}
  </button>
);
