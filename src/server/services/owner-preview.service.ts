import { getCurrentUser } from "@/server/auth/session";
import { getOwnerProjectRecord } from "@/server/repositories/owner-preview";
import { buildViewerProject } from "./public-project.service";
import { projectIdSchema } from "@/core/schemas/project";
import type { ViewerProject } from "@/core/types/viewer";

// Tanpa cache: pratinjau harus selalu menampilkan data terbaru
export async function getOwnerPreview(projectId: string): Promise<ViewerProject | null> {
  if (!projectIdSchema.safeParse({ id: projectId }).success) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const record = await getOwnerProjectRecord(projectId, user.id);
  return record ? buildViewerProject(record) : null;
}