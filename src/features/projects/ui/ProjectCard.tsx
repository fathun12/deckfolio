"use client";

import Link from "next/link";
import { useConfirm } from "../logic/useConfirm";
import { useProjectAction, type ProjectAction } from "../logic/useProjectAction";
import { Notice } from "@/ui/primitives/Notice";
import { formatDate } from "@/lib/format";
import type { Project } from "@/core/types/project";

type ProjectCardProps = {
  project: Project;
  visibilityAction: ProjectAction;
  deleteAction: ProjectAction;
};

export function ProjectCard({ project, visibilityAction, deleteAction }: ProjectCardProps) {
  const isPublic = project.visibility === "public";
  const visibility = useProjectAction(visibilityAction);
  const remove = useProjectAction(deleteAction);
  const confirm = useConfirm();
  const error = visibility.state?.error ?? remove.state?.error;

  return (
    <article className="cell flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className={isPublic ? "tag-live" : "tag"}>
          {isPublic ? "Public" : "Private"}
        </span>
        <span className="label-mono text-muted">
          Updated {formatDate(project.updatedAt)}
        </span>
      </div>

      <div>
        <h2 className="text-2xl leading-tight font-semibold wrap-break-word">
          {project.title}
        </h2>
        {project.subtitle && (
          <p className="mt-1 text-sm text-muted">{project.subtitle}</p>
        )}
      </div>

      <p className="label-mono break-all text-muted">/p/{project.slug}</p>

      {error && <Notice tone="error">{error}</Notice>}

      <div className="rule mt-auto flex flex-wrap items-center gap-2 pt-4">
        <Link href={`/dashboard/projects/${project.id}/edit`} className="btn-sm">
          Edit
        </Link>
        {isPublic ? (
          <Link href={`/p/${project.slug}`} className="btn-sm">
            View
          </Link>
        ) : (
          <Link href={`/dashboard/projects/${project.id}/preview`} className="btn-sm">
            Preview
          </Link>
        )}
        <form action={visibility.formAction}>
          <input type="hidden" name="id" value={project.id} />
          <input
            type="hidden"
            name="visibility"
            value={isPublic ? "private" : "public"}
          />
          <button
            type="submit"
            disabled={visibility.pending}
            className="btn-sm disabled:opacity-60"
          >
            {visibility.pending ? "Saving..." : isPublic ? "Make private" : "Publish"}
          </button>
        </form>

        {confirm.armed ? (
          <form action={remove.formAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={project.id} />
            <button
              type="submit"
              disabled={remove.pending}
              className="btn-sm-danger disabled:opacity-60"
            >
              {remove.pending ? "Deleting..." : "Confirm delete"}
            </button>
            <button type="button" onClick={confirm.cancel} className="btn-sm">
              Cancel
            </button>
            <span className="label-mono w-full text-accent">
              This also deletes all slides.
            </span>
          </form>
        ) : (
          <button type="button" onClick={confirm.arm} className="btn-sm">
            Delete
          </button>
        )}
      </div>
    </article>
  );
}