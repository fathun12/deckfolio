import { createClient } from "@/server/supabase/server";

const BUCKET = "project-assets";

// Hapus semua gambar milik satu proyek: {ownerId}/{projectId}/*
export async function removeProjectAssets(ownerId: string, projectId: string): Promise<void> {
  const supabase = await createClient();
  const folder = `${ownerId}/${projectId}`;

  const { data, error } = await supabase.storage.from(BUCKET).list(folder, { limit: 1000 });
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return;

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(data.map((file) => `${folder}/${file.name}`));
  if (removeError) throw new Error(removeError.message);
}