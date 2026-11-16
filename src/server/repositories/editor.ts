import { createClient } from "@/server/supabase/server";
import type { EditorProject } from "@/core/types/editor";
import type { ProjectVisibility } from "@/core/types/project";

type Client = Awaited<ReturnType<typeof createClient>>;
type EditorProjectRow = { id: string; slug: string; title: string; visibility: ProjectVisibility };
type SectionRow = { id: string; title: string; position: number };
type SlideRow = { id: string; section_id: string | null; title: string; position: number };

function failIfError(results: { error: { message: string } | null }[]) {
  for (const result of results) {
    if (result.error) throw new Error(result.error.message);
  }
}

async function nextSlidePosition(
  supabase: Client,
  projectId: string,
  sectionId: string | null
): Promise<number> {
  const base = supabase.from("slides").select("position").eq("project_id", projectId);
  const scoped = sectionId ? base.eq("section_id", sectionId) : base.is("section_id", null);
  const { data, error } = await scoped.order("position", { ascending: false }).limit(1);
  if (error) throw new Error(error.message);
  const last = (data as { position: number }[] | null)?.[0]?.position;
  return typeof last === "number" ? last + 1 : 0;
}

async function nextSectionPosition(supabase: Client, projectId: string): Promise<number> {
  const { data, error } = await supabase
    .from("sections")
    .select("position")
    .eq("project_id", projectId)
    .order("position", { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  const last = (data as { position: number }[] | null)?.[0]?.position;
  return typeof last === "number" ? last + 1 : 0;
}

// Pastikan section memang milik project yang sama
async function sectionBelongs(
  supabase: Client,
  projectId: string,
  sectionId: string | null
): Promise<boolean> {
  if (!sectionId) return true;
  const { data, error } = await supabase
    .from("sections")
    .select("id")
    .eq("id", sectionId)
    .eq("project_id", projectId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function fetchEditorProject(
  projectId: string,
  ownerId: string
): Promise<EditorProject | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title, visibility")
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const project = data as EditorProjectRow;

  const [sections, slides] = await Promise.all([
    supabase
      .from("sections")
      .select("id, title, position")
      .eq("project_id", projectId)
      .order("position", { ascending: true }),
    supabase
      .from("slides")
      .select("id, section_id, title, position")
      .eq("project_id", projectId)
      .order("position", { ascending: true }),
  ]);
  failIfError([sections, slides]);

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    visibility: project.visibility,
    sections: ((sections.data ?? []) as SectionRow[]).map((s) => ({
      id: s.id,
      title: s.title,
      position: s.position,
    })),
    slides: ((slides.data ?? []) as SlideRow[]).map((s) => ({
      id: s.id,
      sectionId: s.section_id,
      title: s.title,
      position: s.position,
    })),
  };
}

export async function getProjectSlug(projectId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as { slug: string } | null)?.slug ?? null;
}

// ---------- Slide ----------

// Hasil null = section tujuan tidak ditemukan
export async function insertSlide(
  projectId: string,
  sectionId: string | null,
  title: string
): Promise<string | null> {
  const supabase = await createClient();
  if (!(await sectionBelongs(supabase, projectId, sectionId))) return null;
  const position = await nextSlidePosition(supabase, projectId, sectionId);

  const { data, error } = await supabase
    .from("slides")
    .insert({ project_id: projectId, section_id: sectionId, title, position, blocks: [] })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

export async function renameSlide(projectId: string, id: string, title: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("slides")
    .update({ title })
    .eq("id", id)
    .eq("project_id", projectId)
    .select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function deleteSlide(projectId: string, id: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("slides")
    .delete()
    .eq("id", id)
    .eq("project_id", projectId)
    .select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function moveSlide(
  projectId: string,
  id: string,
  sectionId: string | null
): Promise<boolean> {
  const supabase = await createClient();
  if (!(await sectionBelongs(supabase, projectId, sectionId))) return false;
  const position = await nextSlidePosition(supabase, projectId, sectionId);

  const { data, error } = await supabase
    .from("slides")
    .update({ section_id: sectionId, position })
    .eq("id", id)
    .eq("project_id", projectId)
    .select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function reorderSlides(projectId: string, orderedIds: string[]): Promise<boolean> {
  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("slides").update({ position: index }).eq("id", id).eq("project_id", projectId)
    )
  );
  failIfError(results);
  return true;
}

// ---------- Section ----------

export async function insertSection(projectId: string, title: string): Promise<string> {
  const supabase = await createClient();
  const position = await nextSectionPosition(supabase, projectId);

  const { data, error } = await supabase
    .from("sections")
    .insert({ project_id: projectId, title, position })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

export async function renameSection(
  projectId: string,
  id: string,
  title: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .update({ title })
    .eq("id", id)
    .eq("project_id", projectId)
    .select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

// Slide di dalam section dipindah ke grup "tanpa section" (tidak ikut terhapus)
export async function deleteSection(projectId: string, id: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: moving, error: movingError } = await supabase
    .from("slides")
    .select("id")
    .eq("project_id", projectId)
    .eq("section_id", id)
    .order("position", { ascending: true });
  if (movingError) throw new Error(movingError.message);

  const base = await nextSlidePosition(supabase, projectId, null);
  const results = await Promise.all(
    ((moving ?? []) as { id: string }[]).map((slide, index) =>
      supabase
        .from("slides")
        .update({ section_id: null, position: base + index })
        .eq("id", slide.id)
        .eq("project_id", projectId)
    )
  );
  failIfError(results);

  const { data, error } = await supabase
    .from("sections")
    .delete()
    .eq("id", id)
    .eq("project_id", projectId)
    .select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function reorderSections(projectId: string, orderedIds: string[]): Promise<boolean> {
  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("sections")
        .update({ position: index })
        .eq("id", id)
        .eq("project_id", projectId)
    )
  );
  failIfError(results);
  return true;
}