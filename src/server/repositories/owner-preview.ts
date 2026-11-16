import { createClient } from "@/server/supabase/server";
import { COLUMNS, toProject, type ProjectRow } from "./projects";
import type {
  PublicProjectRecord,
  SectionRow,
  SlideRow,
} from "./public-projects";

// Memakai client dengan cookies: RLS + filter owner_id memastikan hanya milik sendiri
export async function getOwnerProjectRecord(
  projectId: string,
  ownerId: string
): Promise<PublicProjectRecord | null> {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) return null;

  const project = toProject(row as ProjectRow);

  const [sectionsRes, slidesRes] = await Promise.all([
    supabase
      .from("sections")
      .select("id, title, position")
      .eq("project_id", project.id)
      .order("position", { ascending: true }),
    supabase
      .from("slides")
      .select("id, section_id, title, position, blocks")
      .eq("project_id", project.id)
      .order("position", { ascending: true }),
  ]);

  if (sectionsRes.error) throw new Error(sectionsRes.error.message);
  if (slidesRes.error) throw new Error(slidesRes.error.message);

  return {
    project,
    sections: (sectionsRes.data ?? []) as SectionRow[],
    slides: (slidesRes.data ?? []) as SlideRow[],
  };
}