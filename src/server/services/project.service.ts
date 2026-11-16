import { getCurrentUser } from "@/server/auth/session";
import { listProjectsByOwner } from "@/server/repositories/projects";
import type { Project } from "@/core/types/project";

export async function getOwnProjects(): Promise<Project[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return listProjectsByOwner(user.id);
}