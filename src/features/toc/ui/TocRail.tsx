import { TocList } from "./TocList";
import type { TocItem } from "@/core/types/viewer";

type TocRailProps = {
  items: TocItem[];
  activeId: string | null;
  activeSectionId: string | null;
};

export function TocRail({ items, activeId, activeSectionId }: TocRailProps) {
  return (
    <aside
      aria-label="Contents"
      className="sticky top-8 hidden max-h-[calc(100dvh-4rem)] self-start overflow-y-auto lg:block"
    >
      <p className="label-mono mb-4 text-muted">Contents</p>
      <nav>
        <TocList items={items} activeId={activeId} activeSectionId={activeSectionId} />
      </nav>
    </aside>
  );
}