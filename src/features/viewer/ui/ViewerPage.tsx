import Link from "next/link";
import { PrintButton } from "./PrintButton";
import { ProjectHeader } from "./ProjectHeader";
import { SlideSection } from "./SlideSection";
import { Toc } from "@/features/toc/ui/Toc";
import { Brand } from "@/ui/layout/Brand";
import { SiteFooter } from "@/ui/layout/SiteFooter";
import type { ViewerProject } from "@/core/types/viewer";

export function ViewerPage({
  project,
  presentHref,
}: {
  project: ViewerProject;
  presentHref?: string;
}) {
  const { entries, slideLinks } = project;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4">
      <header className="flex h-16 items-center justify-between print:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <PrintButton />
          <Link href="/" className="btn-outline">
            All projects
          </Link>
        </div>
      </header>

      <main className="flex-1 py-8">
        <ProjectHeader project={project} presentHref={presentHref} />

        {entries.length === 0 ? (
          <div className="cell mt-12 py-16 text-center">
            <p className="label-mono mb-3 text-muted">00 / Empty</p>
            <p className="text-xl font-semibold">No content yet.</p>
          </div>
        ) : (
          <div className="mt-12 gap-12 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]">
            <div className="print:hidden">
              <Toc items={project.toc} />
            </div>

            <div className="space-y-16">
              {entries.map((entry) =>
                entry.kind === "slide" ? (
                  <SlideSection
                    key={entry.slide.id}
                    slide={entry.slide}
                    slideLinks={slideLinks}
                  />
                ) : (
                  <div key={entry.id} id={entry.anchorId} className="scroll-mt-8 space-y-12">
                    <div>
                      <p className="label-mono text-accent">{entry.number} / Section</p>
                      <h2 className="mt-2 text-5xl font-bold uppercase">{entry.title}</h2>
                    </div>
                    {entry.slides.map((slide) => (
                      <SlideSection
                        key={slide.id}
                        slide={slide}
                        slideLinks={slideLinks}
                        nested
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}