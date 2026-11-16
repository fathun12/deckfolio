import { ProjectCard } from "./ProjectCard";
import type { ProjectAction } from "../logic/useProjectAction";
import type { Project } from "@/core/types/project";

type ProjectGridProps = {
  projects: Project[];
  visibilityAction: ProjectAction;
  deleteAction: ProjectAction;
};

export function ProjectGrid({ projects, visibilityAction, deleteAction }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="cell py-16 text-center">
        <p className="label-mono mb-3 text-muted">00 / Empty</p>
        <p className="text-xl font-semibold">No projects yet.</p>
        <p className="mt-1 text-sm text-muted">
          Create your first project in the box above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          visibilityAction={visibilityAction}
          deleteAction={deleteAction}
        />
      ))}
    </div>
  );
}