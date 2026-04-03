import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;
const SheetPortal = Dialog.Portal;

const SheetOverlay = React.forwardRef<React.ElementRef<typeof Dialog.Overlay>, React.ComponentPropsWithoutRef<typeof Dialog.Overlay>>(
  ({ className, ...props }, ref) => (
    <Dialog.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-[rgba(3,5,12,0.72)] backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in",
        className,
      )}
      {...props}
    />
  ),
);

SheetOverlay.displayName = "SheetOverlay";

const sheetVariants = cva(
  "fixed z-50 border border-white/10 bg-background/95 p-6 shadow-xl backdrop-blur-xl transition ease-in-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b",
        bottom: "inset-x-0 bottom-0 border-t",
        left: "inset-y-0 left-0 h-full w-[85%] border-r sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-[85%] border-l sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof Dialog.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<React.ElementRef<typeof Dialog.Content>, SheetContentProps>(
  ({ className, children, side = "right", ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <Dialog.Content ref={ref} className={cn(sheetVariants({ className, side }))} {...props}>
        {children}
        <Dialog.Close className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Dialog.Close>
      </Dialog.Content>
    </SheetPortal>
  ),
);

SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
);

const SheetTitle = React.forwardRef<React.ElementRef<typeof Dialog.Title>, React.ComponentPropsWithoutRef<typeof Dialog.Title>>(
  ({ className, ...props }, ref) => (
    <Dialog.Title ref={ref} className={cn("font-display text-xl font-semibold", className)} {...props} />
  ),
);

SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));

SheetDescription.displayName = "SheetDescription";

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger };
