import { createClient } from "@/server/supabase/server";
import type { ProjectSettings } from "@/core/types/project-settings";

type Row = {
  slug: string;
  title: string;
  subtitle: string | null;
  cover_url: string | null;
  stats: unknown;
};

export async function fetchProjectSettings(projectId: string): Promise<ProjectSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("slug, title, subtitle, cover_url, stats")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as Row;
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? "",
    coverUrl: row.cover_url ?? "",
    stats: Array.isArray(row.stats)
      ? row.stats.filter((s): s is string => typeof s === "string")
      : [],
  };
}

export type UpdateSettingsOutcome = "ok" | "not_found" | "slug_taken";

export async function updateProjectSettings(
  projectId: string,
  settings: ProjectSettings
): Promise<UpdateSettingsOutcome> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      slug: settings.slug,
      title: settings.title,
      subtitle: settings.subtitle || null,
      cover_url: settings.coverUrl || null,
      stats: settings.stats,
    })
    .eq("id", projectId)
    .select("id");

  if (error) {
    if (error.code === "23505") return "slug_taken";
    throw new Error(error.message);
  }
  return (data?.length ?? 0) > 0 ? "ok" : "not_found";
}