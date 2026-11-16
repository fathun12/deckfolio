"use server";

import { updateTag } from "next/cache";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectSlug } from "@/server/repositories/editor";
import { saveSlideBlocks } from "@/server/repositories/slide-blocks";
import { saveBlocksSchema } from "@/core/schemas/slide-blocks";
import type { EditorResult } from "@/core/types/editor";

const SESSION_EXPIRED = "Your session has expired. Please sign in again.";

export async function saveSlideBlocksAction(input: unknown): Promise<EditorResult> {
  const parsed = saveBlocksSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SESSION_EXPIRED };

  const { projectId, slideId, blocks } = parsed.data;

  try {
    const found = await saveSlideBlocks(projectId, slideId, blocks);
    if (!found) return { ok: false, error: "Slide not found. Try reloading the page." };

    // Wajib: supaya halaman publik langsung melihat perubahan
    const slug = await getProjectSlug(projectId);
    updateTag("projects");
    if (slug) updateTag(`project:${slug}`);

    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save your changes. Please try again." };
  }
}