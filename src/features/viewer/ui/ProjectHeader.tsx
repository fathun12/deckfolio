/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ViewerProject } from "@/core/types/viewer";

export function ProjectHeader({
  project,
  presentHref = `/p/${project.slug}/present`,
}: {
  project: ViewerProject;
  presentHref?: string;
}) {
  return (
    <>
      <section className="cell-inverse animate-fade-up p-8 md:p-12">
        <p className="label-mono flex items-center gap-2">
          <span className="inline-block h-2 w-2 bg-accent" />
          Project
        </p>
        <h1 className="mt-8 text-5xl leading-none font-bold uppercase md:text-7xl">
          {project.title}
        </h1>
        {project.subtitle && (
          <p className="mt-4 max-w-2xl text-xl text-inverse-ink/80">{project.subtitle}</p>
        )}
        {project.stats.length > 0 && (
          <>
            <div className="my-8 border-t border-inverse-ink/30" />
            <p className="label-mono">{project.stats.join(" / ")}</p>
          </>
        )}
        {project.slideCount > 0 && (
          <Link href={presentHref} className="btn-accent mt-8">
            Start presentation
          </Link>
        )}
      </section>

      {project.coverUrl && (
        <img
          src={project.coverUrl}
          alt=""
          decoding="async"
          className="mt-6 w-full border border-line"
        />
      )}
    </>
  );
}