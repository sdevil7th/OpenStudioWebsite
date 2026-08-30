import { Menu } from "lucide-react";
import MobileNavContent from "@/components/MobileNavContent";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface MobileNavSheetProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pathname: string;
}

const MobileNavSheet = ({ onOpenChange, open, pathname }: MobileNavSheetProps) => (
  <Sheet onOpenChange={onOpenChange} open={open}>
    <SheetTrigger asChild>
      <Button
        aria-label="Open navigation"
        onClick={() =>
          trackEvent("mobile_nav_opened", {
            source: "site_nav",
          })
        }
        size="icon"
        variant="outline"
      >
        <Menu className="h-4 w-4" />
      </Button>
    </SheetTrigger>
    <SheetContent className="panel-surface border-white/10" side="right">
      <SheetHeader className="mb-8">
        <SheetTitle>Navigate OpenStudio</SheetTitle>
        <SheetDescription>
          Product overview, feature breakdown, release surface, GitHub story, and project contact live here.
        </SheetDescription>
      </SheetHeader>
      <MobileNavContent onNavigate={() => onOpenChange(false)} pathname={pathname} />
    </SheetContent>
  </Sheet>
);

export default MobileNavSheet;
