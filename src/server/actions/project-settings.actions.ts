"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectSlug } from "@/server/repositories/editor";
import { updateProjectVisibility } from "@/server/repositories/projects";
import { updateProjectSettings } from "@/server/repositories/project-settings";
import { saveSettingsSchema, setVisibilityInputSchema } from "@/core/schemas/project-settings";
import type { EditorResult } from "@/core/types/editor";

const SESSION_EXPIRED = "Your session has expired. Please sign in again.";

export async function saveProjectSettingsAction(input: unknown): Promise<EditorResult> {
  const parsed = saveSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SESSION_EXPIRED };

  const { projectId, ...settings } = parsed.data;

  try {
    const oldSlug = await getProjectSlug(projectId);
    const outcome = await updateProjectSettings(projectId, settings);
    if (outcome === "slug_taken") {
      return { ok: false, error: "This address is already used by another project." };
    }
    if (outcome === "not_found") {
      return { ok: false, error: "Project not found. Try reloading the page." };
    }

    revalidatePath("/dashboard");
    updateTag("projects");
    updateTag(`project:${settings.slug}`);
    if (oldSlug && oldSlug !== settings.slug) updateTag(`project:${oldSlug}`);

    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save the settings. Please try again." };
  }
}

export async function setProjectVisibilityAction(input: unknown): Promise<EditorResult> {
  const parsed = setVisibilityInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SESSION_EXPIRED };

  const { projectId, visibility } = parsed.data;

  try {
    const found = await updateProjectVisibility(projectId, visibility);
    if (!found) return { ok: false, error: "Project not found. Try reloading the page." };

    const slug = await getProjectSlug(projectId);
    revalidatePath("/dashboard");
    updateTag("projects");
    if (slug) updateTag(`project:${slug}`);

    return { ok: true };
  } catch {
    return { ok: false, error: "Could not change the visibility. Please try again." };
  }
}