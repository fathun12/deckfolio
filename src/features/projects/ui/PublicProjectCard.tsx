import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { Project } from "@/core/types/project";

type PublicProjectCardProps = {
  project: Project;
  featured?: boolean;
};

export function PublicProjectCard({ project, featured = false }: PublicProjectCardProps) {
  return (
    <Link
      href={`/p/${project.slug}`}
      className={cn(
        "cell group flex min-h-56 flex-col justify-between gap-8 transition-colors hover:bg-inverse hover:text-inverse-ink",
        featured && "md:col-span-2"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="label-mono text-accent">Project</span>
        {project.publishedAt && (
          <span className="label-mono text-muted group-hover:text-inverse-ink/70">
            {formatDate(project.publishedAt)}
          </span>
        )}
      </div>

      <div>
        <h2
          className={cn(
            "leading-tight font-bold wrap-break-word uppercase",
            featured ? "text-4xl md:text-5xl" : "text-2xl"
          )}
        >
          {project.title}
        </h2>
        {project.subtitle && (
          <p className="mt-2 text-sm text-muted group-hover:text-inverse-ink/70">
            {project.subtitle}
          </p>
        )}
        {project.stats.length > 0 && (
          <p className="label-mono mt-4 text-muted group-hover:text-inverse-ink/70">
            {project.stats.join(" / ")}
          </p>
        )}
      </div>
    </Link>
  );
}