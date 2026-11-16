import { getCurrentUser } from "@/server/auth/session";
import { fetchEditorProject } from "@/server/repositories/editor";
import { projectIdSchema } from "@/core/schemas/project";
import type { EditorProject } from "@/core/types/editor";

export async function getEditorProject(projectId: string): Promise<EditorProject | null> {
  if (!projectIdSchema.safeParse({ id: projectId }).success) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  return fetchEditorProject(projectId, user.id);
}