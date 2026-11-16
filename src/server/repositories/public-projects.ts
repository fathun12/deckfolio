import { createPublicClient } from "@/server/supabase/public";
import { COLUMNS, toProject, type ProjectRow } from "./projects";
import type { Project } from "@/core/types/project";

export type SectionRow = { id: string; title: string; position: number };
export type SlideRow = {
  id: string;
  section_id: string | null;
  title: string;
  position: number;
  blocks: unknown;
};
export type PublicProjectRecord = {
  project: Project;
  sections: SectionRow[];
  slides: SlideRow[];
};

export async function listPublicProjects(): Promise<Project[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .eq("visibility", "public")
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ProjectRow[]).map(toProject);
}

export async function getPublicProjectRecord(
  slug: string
): Promise<PublicProjectRecord | null> {
  const supabase = createPublicClient();

  const { data: row, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("visibility", "public")
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