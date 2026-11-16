import { collectImageUrls, preloadImages } from "./export-assets";
import { buildDocx } from "./export-docx";
import { buildPptx } from "./export-pptx";
import { getOwnerPreview } from "./owner-preview.service";

export type ExportFormat = "docx" | "pptx";

const MIME: Record<ExportFormat, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export async function exportProject(id: string, format: ExportFormat) {
  const project = await getOwnerPreview(id);
  if (!project) return null;

  const images = await preloadImages(collectImageUrls(project));
  const buffer =
    format === "docx" ? await buildDocx(project, images) : await buildPptx(project, images);

  return { buffer, filename: `${project.slug}.${format}`, mime: MIME[format] };
}