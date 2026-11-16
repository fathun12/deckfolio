import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProject } from "@/server/services/public-project.service";
import { ViewerPage } from "@/features/viewer/ui/ViewerPage";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) return { title: "Not found" };

  const description = project.subtitle ?? undefined;
  return {
    title: project.title,
    description,
    openGraph: {
      title: project.title,
      description,
      images: project.coverUrl ? [project.coverUrl] : undefined,
    },
  };
}

async function ProjectView({ params }: PageProps) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) notFound();
  return <ViewerPage project={project} />;
}

export default function ProjectPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <p className="label-mono mx-auto max-w-6xl px-4 py-16 text-muted">Loading project...</p>
      }
    >
      <ProjectView params={params} />
    </Suspense>
  );
}