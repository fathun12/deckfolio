import { Suspense } from "react";
import Link from "next/link";
import { getPublicProjects } from "@/server/services/public-project.service";
import { PublicProjectGrid } from "@/features/projects/ui/PublicProjectGrid";
import { Brand } from "@/ui/layout/Brand";
import { SiteFooter } from "@/ui/layout/SiteFooter";

async function PublicProjects() {
  const projects = await getPublicProjects();

  return (
    <>
      <div className="mt-12 mb-6 flex items-end justify-between">
        <h2 className="text-3xl font-bold">Projects</h2>
        <p className="label-mono text-muted">
          {String(projects.length).padStart(2, "0")} published
        </p>
      </div>
      <PublicProjectGrid projects={projects} />
    </>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4">
      <header className="flex h-16 items-center justify-between">
        <Brand />
        <Link href="/sign-in" className="btn-outline">
          Sign in
        </Link>
      </header>

      <main className="flex-1 py-8">
        <section className="cell-inverse animate-fade-up p-8 md:p-12">
          <p className="label-mono flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-accent" />
            Deckfolio
          </p>
          <h1 className="mt-8 max-w-3xl text-5xl leading-none font-bold md:text-7xl">
            Slides that live on the web.
          </h1>
          <p className="mt-4 max-w-xl text-inverse-ink/70">
            Read each project as a page, or present it full screen.
          </p>
          <div className="my-8 border-t border-inverse-ink/30" />
          <p className="label-mono">01 / Read &nbsp; 02 / Present &nbsp; 03 / Link</p>
        </section>

        <Suspense
          fallback={<p className="label-mono mt-12 text-muted">Loading projects...</p>}
        >
          <PublicProjects />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}