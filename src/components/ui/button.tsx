import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-white/15 bg-[linear-gradient(135deg,rgba(164,142,255,0.95),rgba(123,255,171,0.9))] px-6 py-3 font-headline text-primary-foreground shadow-[0_20px_50px_rgba(164,142,255,0.24)] hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(123,255,171,0.18)]",
        outline:
          "border-white/12 bg-white/[0.04] px-6 py-3 font-headline text-foreground hover:-translate-y-1 hover:border-primary/45 hover:bg-white/[0.08]",
        ghost: "border-transparent bg-transparent px-3 py-2 font-headline text-muted-foreground hover:text-foreground",
        secondary:
          "border-secondary/30 bg-secondary/15 px-6 py-3 font-headline text-secondary-foreground hover:-translate-y-1 hover:bg-secondary/20",
        link: "border-transparent bg-transparent px-0 py-0 font-headline text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12 rounded-2xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ className, variant, size }))} ref={ref} {...props} />;
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
