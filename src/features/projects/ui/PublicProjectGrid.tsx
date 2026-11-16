import { PublicProjectCard } from "./PublicProjectCard";
import type { Project } from "@/core/types/project";

export function PublicProjectGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="cell py-16 text-center">
        <p className="label-mono mb-3 text-muted">00 / Empty</p>
        <p className="text-xl font-semibold">Nothing published yet.</p>
        <p className="mt-1 text-sm text-muted">Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, i) => (
        <PublicProjectCard key={project.id} project={project} featured={i === 0} />
      ))}
    </div>
  );
}