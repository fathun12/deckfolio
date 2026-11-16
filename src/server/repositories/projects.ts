import { createClient } from "@/server/supabase/server";
import { randomSuffix, slugify } from "@/lib/slug";
import type { Project, ProjectVisibility } from "@/core/types/project";

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  cover_url: string | null;
  stats: unknown;
  visibility: ProjectVisibility;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export const COLUMNS =
  "id, slug, title, subtitle, cover_url, stats, visibility, published_at, created_at, updated_at";

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    coverUrl: row.cover_url,
    stats: Array.isArray(row.stats)
      ? row.stats.filter((s): s is string => typeof s === "string")
      : [],
    visibility: row.visibility,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProjectsByOwner(ownerId: string): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ProjectRow[]).map(toProject);
}

export async function insertProject(
  ownerId: string,
  input: { title: string; subtitle: string }
): Promise<{ id: string }> {
  const supabase = await createClient();
  const base = slugify(input.title);

  // Kalau slug sudah dipakai (kode 23505), coba lagi dengan akhiran acak
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${randomSuffix()}`;

    const { data, error } = await supabase
      .from("projects")
      .insert({
        owner_id: ownerId,
        slug,
        title: input.title,
        subtitle: input.subtitle || null,
      })
      .select("id")
      .single();

    if (!error) return { id: (data as { id: string }).id };
    if (error.code !== "23505") throw new Error(error.message);
  }

  throw new Error("Could not generate a unique address for this project.");
}

// RLS memastikan hanya milik sendiri yang bisa diubah. Hasil false = tidak ditemukan.
export async function updateProjectVisibility(
  id: string,
  visibility: ProjectVisibility
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ visibility })
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function deleteProjectById(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}