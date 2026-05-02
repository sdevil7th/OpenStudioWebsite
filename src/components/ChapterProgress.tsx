import { cn } from "@/lib/utils";

interface ChapterProgressItem {
  id: string;
  label: string;
  numeral?: string;
}

interface ChapterProgressProps {
  items: ChapterProgressItem[];
  activeId?: string;
  className?: string;
  progressById?: Record<string, number>;
}

const clampProgress = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
};

const ChapterProgress = ({ items, activeId, className, progressById }: ChapterProgressProps) => (
  <nav className={cn("chapter-rail", className)}>
    <span aria-hidden="true" className="chapter-rail__spine" />
    <ol className="chapter-rail__list">
      {items.map((item, index) => {
        const active = item.id === activeId;
        const progress = clampProgress(progressById?.[item.id]);
        const numeral = item.numeral ?? String(index + 1);

        return (
          <li className="chapter-rail__item" key={item.id}>
            <a
              className={cn(
                "chapter-rail__link group",
                active ? "chapter-rail__link--active" : undefined,
              )}
              data-active={active ? "true" : "false"}
              href={`#${item.id}`}
            >
              <span aria-hidden="true" className="chapter-rail__tick" />
              <span className="chapter-rail__numeral" data-active={active ? "true" : "false"}>
                {numeral}
              </span>
              <span className="chapter-rail__label">{item.label}</span>
              {active ? (
                <span
                  aria-hidden="true"
                  className="chapter-rail__underline"
                  style={{ width: `${Math.max(4, progress * 100)}%` }}
                />
              ) : null}
            </a>
          </li>
        );
      })}
    </ol>
  </nav>
);

export default ChapterProgress;
