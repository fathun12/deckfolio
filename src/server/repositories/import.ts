import { createClient } from "@/server/supabase/server";

const BUCKET = "project-assets";

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

export async function uploadImportImage(
  ownerId: string,
  projectId: string,
  data: Uint8Array,
  mime: string
): Promise<string | null> {
  const extension = EXTENSIONS[mime];
  if (!extension) return null;

  const supabase = await createClient();
  const path = `${ownerId}/${projectId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, data, {
    contentType: mime,
    cacheControl: "31536000",
  });
  if (error) return null;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Mengembalikan id section sesuai urutan titles
export async function insertSections(projectId: string, titles: string[]): Promise<string[]> {
  if (titles.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .insert(titles.map((title, position) => ({ project_id: projectId, title, position })))
    .select("id, position");
  if (error) throw new Error(error.message);

  return ((data ?? []) as { id: string; position: number }[])
    .sort((a, b) => a.position - b.position)
    .map((row) => row.id);
}

export type NewSlideRow = {
  project_id: string;
  section_id: string | null;
  title: string;
  position: number;
  blocks: unknown[];
  schema_version: number;
};

export async function insertSlides(rows: NewSlideRow[]): Promise<void> {
  if (rows.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("slides").insert(rows);
  if (error) throw new Error(error.message);
}