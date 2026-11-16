import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProject } from "@/server/services/public-project.service";
import { PresenterView } from "@/features/presenter/ui/PresenterView";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) return { title: "Not found" };
  return { title: `${project.title} (Presentation)` };
}

async function PresentView({ params }: PageProps) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) notFound();
  return <PresenterView project={project} />;
}

export default function PresentPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper">
          <p className="label-mono text-muted">Loading presentation...</p>
        </div>
      }
    >
      <PresentView params={params} />
    </Suspense>
  );
}