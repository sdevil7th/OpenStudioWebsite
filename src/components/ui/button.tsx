import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "openstudio-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border text-sm font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "openstudio-button--primary px-6 py-3 font-headline font-semibold text-slate-950 [text-shadow:0_1px_0_rgba(255,255,255,0.35)]",
        outline:
          "openstudio-button--outline px-6 py-3 font-headline text-foreground",
        ghost: "openstudio-button--quiet px-3 py-2 font-headline text-muted-foreground",
        secondary:
          "openstudio-button--secondary px-6 py-3 font-headline text-secondary-foreground",
        link: "openstudio-button--link px-0 py-0 font-headline text-primary underline-offset-4",
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

const isManuallyWrapped = (node: React.ReactNode) =>
  React.isValidElement(node) &&
  typeof (node.props as { className?: unknown }).className === "string" &&
  ((node.props as { className: string }).className.includes("openstudio-button__"));

function decorateChildren(children: React.ReactNode): React.ReactNode {
  if (React.Children.toArray(children).some(isManuallyWrapped)) {
    return children;
  }
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return <span className="openstudio-button__label">{child}</span>;
    }
    return child;
  });
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onPointerMove, onPointerDown, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    let content: React.ReactNode = children;
    if (asChild) {
      if (React.isValidElement(children) && React.Children.count(children) === 1) {
        const element = children as React.ReactElement<{ children?: React.ReactNode }>;
        content = React.cloneElement(element, {
          children: decorateChildren(element.props.children),
        });
      }
    } else {
      content = decorateChildren(children);
    }

    const updatePointer = (event: React.PointerEvent<HTMLElement>) => {
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--openstudio-button-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      target.style.setProperty("--openstudio-button-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
      updatePointer(event);
      onPointerMove?.(event as React.PointerEvent<HTMLButtonElement>);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
      updatePointer(event);
      const target = event.currentTarget;
      target.dataset.pressed = "true";
      window.setTimeout(() => {
        if (target.isConnected) {
          delete target.dataset.pressed;
        }
      }, 420);
      onPointerDown?.(event as React.PointerEvent<HTMLButtonElement>);
    };

    return (
      <Comp
        className={cn(buttonVariants({ className, variant, size }))}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        ref={ref}
        {...props}
      >
        {content}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
