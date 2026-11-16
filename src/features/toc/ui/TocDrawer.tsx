import { TocList } from "./TocList";
import type { TocItem } from "@/core/types/viewer";

type TocDrawerProps = {
  items: TocItem[];
  activeId: string | null;
  activeSectionId: string | null;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function TocDrawer({
  items,
  activeId,
  activeSectionId,
  open,
  onOpen,
  onClose,
}: TocDrawerProps) {
  return (
    <div className="lg:hidden">
      <button type="button" onClick={onOpen} className="btn-solid fixed bottom-4 left-4 z-30">
        Contents
      </button>

      {open && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close contents"
            onClick={onClose}
            className="animate-fade-in absolute inset-0 bg-ink/40"
          />
          <nav
            aria-label="Contents"
            className="animate-slide-in-left absolute inset-y-0 left-0 w-72 max-w-[85%] overflow-y-auto border-r border-line bg-paper p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="label-mono text-muted">Contents</p>
              <button type="button" onClick={onClose} className="btn-sm">
                Close
              </button>
            </div>
            <TocList
              items={items}
              activeId={activeId}
              activeSectionId={activeSectionId}
              onNavigate={onClose}
            />
          </nav>
        </div>
      )}
    </div>
  );
}