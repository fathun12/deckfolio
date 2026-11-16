import { Gallery } from "../Gallery";
import type { BlockOf } from "@/core/types/block";

export function GalleryBlock({ block }: { block: BlockOf<"gallery"> }) {
  if (block.images.length === 0) return null;
  return <Gallery images={block.images} label="Image gallery" />;
}