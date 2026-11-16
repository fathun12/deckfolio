"use server";

import { updateTag } from "next/cache";
import type { z } from "zod";
import { getCurrentUser } from "@/server/auth/session";
import {
  deleteSection,
  deleteSlide,
  getProjectSlug,
  insertSection,
  insertSlide,
  moveSlide,
  renameSection,
  renameSlide,
  reorderSections,
  reorderSlides,
} from "@/server/repositories/editor";
import {
  addSectionSchema,
  addSlideSchema,
  deleteSectionSchema,
  deleteSlideSchema,
  moveSlideSchema,
  renameSectionSchema,
  renameSlideSchema,
  reorderSectionsSchema,
  reorderSlidesSchema,
} from "@/core/schemas/editor";
import type { EditorResult } from "@/core/types/editor";

const SESSION_EXPIRED = "Your session has expired. Please sign in again.";

// run mengembalikan: false = tidak ditemukan, true = berhasil, string = id baru
async function mutate<S extends z.ZodType<{ projectId: string }>>(
  schema: S,
  input: unknown,
  failMessage: string,
  run: (data: z.output<S>) => Promise<boolean | string>
): Promise<EditorResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SESSION_EXPIRED };

  try {
    const outcome = await run(parsed.data);
    if (outcome === false) {
      return { ok: false, error: "Item not found. Try reloading the page." };
    }

    // Wajib: supaya halaman publik langsung melihat perubahan
    const { projectId } = parsed.data as { projectId: string };
    const slug = await getProjectSlug(projectId);
    updateTag("projects");
    if (slug) updateTag(`project:${slug}`);

    return { ok: true, id: typeof outcome === "string" ? outcome : undefined };
  } catch {
    return { ok: false, error: failMessage };
  }
}

export async function addSlideAction(input: unknown): Promise<EditorResult> {
  return mutate(addSlideSchema, input, "Could not add the slide. Please try again.", async (d) => {
    const id = await insertSlide(d.projectId, d.sectionId, d.title);
    return id ?? false;
  });
}

export async function renameSlideAction(input: unknown): Promise<EditorResult> {
  return mutate(renameSlideSchema, input, "Could not rename the slide.", (d) =>
    renameSlide(d.projectId, d.id, d.title)
  );
}

export async function deleteSlideAction(input: unknown): Promise<EditorResult> {
  return mutate(deleteSlideSchema, input, "Could not delete the slide.", (d) =>
    deleteSlide(d.projectId, d.id)
  );
}

export async function moveSlideAction(input: unknown): Promise<EditorResult> {
  return mutate(moveSlideSchema, input, "Could not move the slide.", (d) =>
    moveSlide(d.projectId, d.id, d.sectionId)
  );
}

export async function reorderSlidesAction(input: unknown): Promise<EditorResult> {
  return mutate(reorderSlidesSchema, input, "Could not save the new order.", (d) =>
    reorderSlides(d.projectId, d.orderedIds)
  );
}

export async function addSectionAction(input: unknown): Promise<EditorResult> {
  return mutate(addSectionSchema, input, "Could not add the section.", (d) =>
    insertSection(d.projectId, d.title)
  );
}

export async function renameSectionAction(input: unknown): Promise<EditorResult> {
  return mutate(renameSectionSchema, input, "Could not rename the section.", (d) =>
    renameSection(d.projectId, d.id, d.title)
  );
}

export async function deleteSectionAction(input: unknown): Promise<EditorResult> {
  return mutate(deleteSectionSchema, input, "Could not delete the section.", (d) =>
    deleteSection(d.projectId, d.id)
  );
}

export async function reorderSectionsAction(input: unknown): Promise<EditorResult> {
  return mutate(reorderSectionsSchema, input, "Could not save the new order.", (d) =>
    reorderSections(d.projectId, d.orderedIds)
  );
}