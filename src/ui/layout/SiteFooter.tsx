import { ThemeToggle } from "@/ui/theme/ThemeToggle";
import { Brand } from "./Brand";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="flex flex-wrap items-center justify-between gap-4 py-8">
        <div>
          <Brand />
          <p className="mt-2 max-w-xs text-xs text-muted">
            Presentations that live on the web.
          </p>
        </div>
        <ThemeToggle />
      </div>
    </footer>
  );
}