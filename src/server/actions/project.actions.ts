"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getCurrentUser } from "@/server/auth/session";
import { removeProjectAssets } from "@/server/repositories/assets";
import {
  deleteProjectById,
  insertProject,
  updateProjectVisibility,
} from "@/server/repositories/projects";
import {
  createProjectSchema,
  projectIdSchema,
  visibilitySchema,
} from "@/core/schemas/project";
import type { ProjectActionState } from "@/core/types/project";

const SESSION_EXPIRED = "Your session has expired. Please sign in again.";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createProjectAction(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const raw = { title: text(formData, "title"), subtitle: text(formData, "subtitle") };
  const parsed = createProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, values: raw };
  }

  const user = await getCurrentUser();
  if (!user) return { error: SESSION_EXPIRED, values: raw };

  try {
    await insertProject(user.id, parsed.data);
  } catch {
    return { error: "Could not create the project. Please try again.", values: raw };
  }

  revalidatePath("/dashboard");
  return { message: "Project created." };
}

export async function setVisibilityAction(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const parsed = visibilitySchema.safeParse({
    id: text(formData, "id"),
    visibility: text(formData, "visibility"),
  });
  if (!parsed.success) return { error: "Invalid request." };

  const user = await getCurrentUser();
  if (!user) return { error: SESSION_EXPIRED };

  try {
    const found = await updateProjectVisibility(parsed.data.id, parsed.data.visibility);
    if (!found) return { error: "Project not found." };
  } catch {
    return { error: "Could not update the project. Please try again." };
  }

  revalidatePath("/dashboard");
  updateTag("projects");
  return null;
}

export async function deleteProjectAction(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const parsed = projectIdSchema.safeParse({ id: text(formData, "id") });
  if (!parsed.success) return { error: "Invalid request." };

  const user = await getCurrentUser();
  if (!user) return { error: SESSION_EXPIRED };

  try {
    const found = await deleteProjectById(parsed.data.id);
    if (!found) return { error: "Project not found." };
    // Gagal hapus gambar tidak membatalkan penghapusan proyek
    await removeProjectAssets(user.id, parsed.data.id).catch(() => undefined);
  } catch {
    return { error: "Could not delete the project. Please try again." };
  }

  revalidatePath("/dashboard");
  updateTag("projects");
  return null;
}