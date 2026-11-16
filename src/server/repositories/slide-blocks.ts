import { createClient } from "@/server/supabase/server";
import { BLOCK_SCHEMA_VERSION } from "@/core/schemas/block";

export async function fetchSlideBlocks(
  projectId: string
): Promise<{ id: string; blocks: unknown }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("slides")
    .select("id, blocks")
    .eq("project_id", projectId);
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: string; blocks: unknown }[];
}

// Hasil false = slide tidak ditemukan
export async function saveSlideBlocks(
  projectId: string,
  slideId: string,
  blocks: unknown[]
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("slides")
    .update({ blocks, schema_version: BLOCK_SCHEMA_VERSION })
    .eq("id", slideId)
    .eq("project_id", projectId)
    .select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}