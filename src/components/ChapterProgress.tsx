import { cn } from "@/lib/utils";

interface ChapterProgressItem {
  id: string;
  label: string;
}

interface ChapterProgressProps {
  items: ChapterProgressItem[];
  activeId?: string;
  className?: string;
}

const ChapterProgress = ({ items, activeId, className }: ChapterProgressProps) => (
  <div className={cn("space-y-3", className)}>
    {items.map((item, index) => {
      const active = item.id === activeId;

      return (
        <a
          className={cn(
            "group flex items-center gap-4 rounded-[1.35rem] border px-3 py-3 transition",
            active
              ? "border-white/12 bg-white/[0.05]"
              : "border-transparent hover:border-white/8 hover:bg-white/[0.025]",
          )}
          href={`#${item.id}`}
          key={item.id}
        >
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border font-sans text-[0.7rem] font-medium uppercase tracking-[0.1em] transition",
              active ? "border-primary/45 bg-primary/12 text-primary" : "border-white/10 text-white/40",
            )}
          >
            {index + 1}
          </span>
          <span
            className={cn(
              "font-sans text-[0.72rem] font-medium uppercase tracking-[0.12em] transition",
              active ? "text-white" : "text-white/46 group-hover:text-white/75",
            )}
          >
            {item.label}
          </span>
        </a>
      );
    })}
  </div>
);

export default ChapterProgress;
