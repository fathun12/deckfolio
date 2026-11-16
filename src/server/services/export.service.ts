import { collectImageUrls, preloadImages } from "./export-assets";
import { buildDocx } from "./export-docx";
import { buildHtml } from "./export-html";
import { buildPptx } from "./export-pptx";
import { getOwnerPreview } from "./owner-preview.service";

export type ExportFormat = "docx" | "pptx" | "html";

const MIME: Record<ExportFormat, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  html: "text/html; charset=utf-8",
};

export async function exportProject(id: string, format: ExportFormat) {
  const project = await getOwnerPreview(id);
  if (!project) return null;

  const images = await preloadImages(collectImageUrls(project));
  const buffer =
    format === "docx"
      ? await buildDocx(project, images)
      : format === "pptx"
        ? await buildPptx(project, images)
        : buildHtml(project, images);

  return { buffer, filename: `${project.slug}.${format}`, mime: MIME[format] };
}