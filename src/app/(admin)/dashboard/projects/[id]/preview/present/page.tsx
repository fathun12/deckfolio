import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getOwnerPreview } from "@/server/services/owner-preview.service";
import { PresenterView } from "@/features/presenter/ui/PresenterView";

export const metadata = { title: "Preview (Presentation)", robots: { index: false, follow: false } };

type PageProps = { params: Promise<{ id: string }> };

async function PresentPreview({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const project = await getOwnerPreview(id);
  if (!project) notFound();

  return <PresenterView project={project} closeHref={`/dashboard/projects/${id}/preview`} />;
}

export default function PresentPreviewPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper">
          <p className="label-mono text-muted">Loading presentation...</p>
        </div>
      }
    >
      <PresentPreview params={params} />
    </Suspense>
  );
}