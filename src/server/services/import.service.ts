import { getCurrentUser } from "@/server/auth/session";
import { removeProjectAssets } from "@/server/repositories/assets";
import { insertSections, insertSlides, uploadImportImage, type NewSlideRow } from "@/server/repositories/import";
import { deleteProjectById, insertProject } from "@/server/repositories/projects";
import { BLOCK_SCHEMA_VERSION, blockSchema } from "@/core/schemas/block";
import { parseDocx } from "@/features/import-export/converters/docx-import";
import { parsePptx } from "@/features/import-export/converters/pptx-import";
import { parasToTiptap } from "@/features/import-export/converters/richtext";
import type { ImportBlock, ImportResult, ImportedDeck } from "@/core/types/import";

const MAX_BYTES = 20 * 1024 * 1024;
const MAX_SLIDES = 200;

const fail = (error: string): ImportResult => ({ ok: false, error });

function clean(value: string, max: number, fallback: string): string {
  return value.trim().slice(0, max) || fallback;
}

function toBlocks(blocks: ImportBlock[], urls: (string | null)[]): unknown[] {
  const out: unknown[] = [];

  for (const block of blocks) {
    const id = crypto.randomUUID();
    let candidate: unknown = null;

    if (block.kind === "heading") {
      candidate = { id, type: "heading", level: block.level, text: block.text.slice(0, 300) };
    } else if (block.kind === "text") {
      candidate = { id, type: "text", content: parasToTiptap(block.paras) };
    } else {
      const url = urls[block.imageIndex];
      if (url) candidate = { id, type: "image", url, alt: block.alt.slice(0, 300) };
    }

    const parsed = candidate ? blockSchema.safeParse(candidate) : null;
    if (parsed?.success) out.push(parsed.data);
    if (out.length >= 200) break;
  }
  return out;
}

async function uploadAll(ownerId: string, projectId: string, deck: ImportedDeck) {
  const urls: (string | null)[] = [];
  for (let i = 0; i < deck.images.length; i += 4) {
    const chunk = deck.images.slice(i, i + 4);
    urls.push(
      ...(await Promise.all(
        chunk.map((image) => uploadImportImage(ownerId, projectId, image.data, image.mime))
      ))
    );
  }
  return urls;
}

export async function importProjectFromFile(file: File): Promise<ImportResult> {
  const user = await getCurrentUser();
  if (!user) return fail("Your session has expired. Please sign in again.");

  const lower = file.name.toLowerCase();
  const kind = lower.endsWith(".docx") ? "docx" : lower.endsWith(".pptx") ? "pptx" : null;
  if (!kind) return fail("Use a .docx or .pptx file.");
  if (file.size > MAX_BYTES) return fail("File must be 20 MB or smaller.");

  const fallbackTitle = file.name.replace(/\.(docx|pptx)$/i, "").trim() || "Imported project";
  const buffer = Buffer.from(await file.arrayBuffer());

  let deck: ImportedDeck;
  try {
    deck = kind === "docx" ? await parseDocx(buffer, fallbackTitle) : await parsePptx(buffer, fallbackTitle);
  } catch {
    return fail("Could not read this file. Make sure it is a valid Word or PowerPoint file.");
  }

  const slideCount = deck.sections.reduce((sum, section) => sum + section.slides.length, 0);
  if (slideCount === 0) return fail("No content was found in this file.");
  if (slideCount > MAX_SLIDES) return fail(`This file has too many slides (max ${MAX_SLIDES}).`);

  let projectId: string | null = null;
  try {
    const created = await insertProject(user.id, {
      title: clean(deck.title, 200, "Imported project"),
      subtitle: deck.subtitle.trim().slice(0, 300),
    });
    projectId = created.id;

    const urls = await uploadAll(user.id, projectId, deck);

    const named = deck.sections.filter((section) => section.title !== null);
    const sectionIds = await insertSections(
      projectId,
      named.map((section) => clean(section.title ?? "", 200, "Untitled section"))
    );

    const rows: NewSlideRow[] = [];
    let sectionIndex = 0;
    for (const section of deck.sections) {
      const sectionId = section.title === null ? null : (sectionIds[sectionIndex++] ?? null);
      section.slides.forEach((slide, position) => {
        rows.push({
          project_id: projectId as string,
          section_id: sectionId,
          title: clean(slide.title, 200, "Untitled slide"),
          position,
          blocks: toBlocks(slide.blocks, urls),
          schema_version: BLOCK_SCHEMA_VERSION,
        });
      });
    }
    await insertSlides(rows);

    return { ok: true, id: projectId };
  } catch {
    if (projectId) {
      await deleteProjectById(projectId).catch(() => false);
      await removeProjectAssets(user.id, projectId).catch(() => undefined);
    }
    return fail("Import failed. Please try again.");
  }
}