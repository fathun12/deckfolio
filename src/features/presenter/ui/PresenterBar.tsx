import Link from "next/link";
import { ThemeToggle } from "@/ui/theme/ThemeToggle";

type PresenterBarProps = {
  index: number;
  total: number;
  fullscreen: boolean;
  closeHref: string;
  onPrev: () => void;
  onNext: () => void;
  onToc: () => void;
  onFullscreen: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function PresenterBar({
  index,
  total,
  fullscreen,
  closeHref,
  onPrev,
  onNext,
  onToc,
  onFullscreen,
}: PresenterBarProps) {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
      <div className="flex items-center gap-4">
        <p className="label-mono">
          {pad(index + 1)} / {pad(total)}
        </p>
        <p className="label-mono hidden text-muted lg:block">
          ← → Slides &nbsp; T Contents &nbsp; F Fullscreen &nbsp; Esc Exit
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={index === 0}
          className="btn-sm disabled:opacity-40"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={index >= total - 1}
          className="btn-sm disabled:opacity-40"
        >
          Next →
        </button>
        <button type="button" onClick={onToc} className="btn-sm">
          Contents
        </button>
        <button type="button" onClick={onFullscreen} className="btn-sm">
          {fullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
        <Link href={closeHref} className="btn-sm">
          Close
        </Link>
        <ThemeToggle />
      </div>
    </footer>
  );
}