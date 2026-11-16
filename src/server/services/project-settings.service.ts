import { fetchProjectSettings } from "@/server/repositories/project-settings";
import type { ProjectSettings } from "@/core/types/project-settings";

export async function getProjectSettings(projectId: string): Promise<ProjectSettings | null> {
  return fetchProjectSettings(projectId);
}