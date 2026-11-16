import { Suspense, type ReactNode } from "react";
import { Brand } from "@/ui/layout/Brand";
import { SiteFooter } from "@/ui/layout/SiteFooter";
import { AuthQueryNotice } from "./AuthQueryNotice";

const POINTS = [
  "One source, two modes",
  "Read it as a page, present it as a deck",
  "Link any slide to anything",
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4">
      <header className="flex h-16 items-center">
        <Brand />
      </header>

      <main className="grid flex-1 content-start gap-10 py-8 md:grid-cols-2 md:gap-16">
        <aside className="hidden min-h-136 flex-col justify-between border border-line bg-inverse p-8 text-inverse-ink md:flex">
          <Brand />
          <div>
            <h2 className="text-4xl leading-tight font-bold">
              Slides that live on the web.
            </h2>
            <div className="my-6 border-t border-inverse-ink/30" />
            <ul className="space-y-3">
              {POINTS.map((point, i) => (
                <li key={point} className="label-mono">
                  {String(i + 1).padStart(2, "0")} / {point}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="w-full max-w-sm md:pt-8">
          <Suspense fallback={null}>
            <AuthQueryNotice />
          </Suspense>
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}