import type { TocItem } from "@/core/types/viewer";

type PresenterTocProps = {
  items: TocItem[];
  activeId: string | null;
  open: boolean;
  onClose: () => void;
};

export function PresenterToc({ items, activeId, open, onClose }: PresenterTocProps) {
  if (!open) return null;

  const activeSectionId =
    items.find((item) => item.children.some((child) => child.id === activeId))?.id ?? null;

  return (
    <div className="fixed inset-0 z-20">
      <button
        type="button"
        aria-label="Close contents"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-ink/30"
      />
      <nav
        aria-label="Contents"
        onMouseLeave={onClose}
        className="animate-slide-in-left absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto border-r border-line bg-paper p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="label-mono text-muted">Contents</p>
          <button type="button" onClick={onClose} className="btn-sm">
            Close
          </button>
        </div>

        <ol className="space-y-1">
          {items.map((item) => {
            // Section membuka slide pertamanya
            const target = item.children[0]?.id ?? item.id;
            const current = item.id === activeId || item.id === activeSectionId;
            return (
              <li key={item.id}>
                <a
                  href={`#${target}`}
                  onClick={onClose}
                  aria-current={current ? "true" : undefined}
                  className="toc-link"
                >
                  <span className="label-mono">{item.number}</span>
                  <span>{item.label}</span>
                </a>
                {item.children.length > 0 && (
                  <ol className="mt-1 ml-4 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <a
                          href={`#${child.id}`}
                          onClick={onClose}
                          aria-current={child.id === activeId ? "true" : undefined}
                          className="toc-link"
                        >
                          <span className="label-mono">{child.number}</span>
                          <span>{child.label}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}