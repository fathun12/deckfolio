import { Suspense } from "react";
import { connection } from "next/server";
import { getOwnProjects } from "@/server/services/project.service";
import { signOutAction } from "@/server/actions/auth.actions";
import {
  createProjectAction,
  deleteProjectAction,
  setVisibilityAction,
} from "@/server/actions/project.actions";
import { ImportProject } from "@/features/import-export/ui/ImportProject";
import { NewProjectForm } from "@/features/projects/ui/NewProjectForm";
import { ProjectGrid } from "@/features/projects/ui/ProjectGrid";
import { Brand } from "@/ui/layout/Brand";
import { SiteFooter } from "@/ui/layout/SiteFooter";

export const metadata = { title: "Dashboard" };

async function Projects() {
  await connection();
  const projects = await getOwnProjects();

  return (
    <>
      <div className="mt-10 mb-6 flex items-end justify-between">
        <h2 className="text-3xl font-bold">Projects</h2>
        <p className="label-mono text-muted">
          {String(projects.length).padStart(2, "0")} total
        </p>
      </div>
      <ProjectGrid
        projects={projects}
        visibilityAction={setVisibilityAction}
        deleteAction={deleteProjectAction}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4">
      <header className="flex h-16 items-center justify-between">
        <Brand />
        <form action={signOutAction}>
          <button type="submit" className="btn-outline">
            Sign out
          </button>
        </form>
      </header>

      <main className="flex-1 py-8">
        <h1 className="mb-6 text-5xl font-bold">Dashboard</h1>
        <NewProjectForm action={createProjectAction} />
        <ImportProject />
        <Suspense
          fallback={<p className="label-mono mt-10 text-muted">Loading projects...</p>}
        >
          <Projects />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}