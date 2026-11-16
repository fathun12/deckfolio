import type { TocItem } from "@/core/types/viewer";

type TocListProps = {
  items: TocItem[];
  activeId: string | null;
  activeSectionId: string | null;
  onNavigate?: () => void;
};

export function TocList({ items, activeId, activeSectionId, onNavigate }: TocListProps) {
  return (
    <ol className="space-y-1">
      {items.map((item) => {
        const current = item.id === activeId || item.id === activeSectionId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={onNavigate}
              aria-current={current ? "true" : undefined}
              className="toc-link"
            >
              <span className="label-mono">{item.number}</span>
              <span>{item.label}</span>
            </a>
            {item.children.length > 0 && (
              <div className="mt-1 ml-4">
                <TocList
                  items={item.children}
                  activeId={activeId}
                  activeSectionId={activeSectionId}
                  onNavigate={onNavigate}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}