import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOwnerPreview } from "@/server/services/owner-preview.service";
import { ViewerPage } from "@/features/viewer/ui/ViewerPage";

export const metadata = { title: "Preview", robots: { index: false, follow: false } };

type PageProps = { params: Promise<{ id: string }> };

async function Preview({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const project = await getOwnerPreview(id);
  if (!project) notFound();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-inverse px-4 py-2 text-inverse-ink print:hidden">
        <p className="label-mono">Preview / only you can see this page</p>
        <Link href={`/dashboard/projects/${id}/edit`} className="btn-accent">
          Back to editor
        </Link>
      </div>
      <ViewerPage project={project} presentHref={`/dashboard/projects/${id}/preview/present`} />
    </>
  );
}

export default function PreviewPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <p className="label-mono mx-auto max-w-6xl px-4 py-16 text-muted">Loading preview...</p>
      }
    >
      <Preview params={params} />
    </Suspense>
  );
}