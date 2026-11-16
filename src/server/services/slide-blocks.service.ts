import { fetchSlideBlocks } from "@/server/repositories/slide-blocks";
import { blockSchema } from "@/core/schemas/block";
import type { Block } from "@/core/types/block";
import type { SlideBlocks } from "@/core/types/slide-blocks";

// Block yang tidak valid dibuang saat dibaca (sama seperti viewer)
export async function getSlideBlocks(projectId: string): Promise<SlideBlocks> {
  const rows = await fetchSlideBlocks(projectId);
  const result: SlideBlocks = {};

  for (const row of rows) {
    const items = Array.isArray(row.blocks) ? row.blocks : [];
    result[row.id] = items.flatMap((item) => {
      const parsed = blockSchema.safeParse(item);
      return parsed.success ? [parsed.data as Block] : [];
    });
  }

  return result;
}