import { toEmbedUrl } from "@/core/schemas/embed";
import type { Block } from "@/core/types/block";

type EmbedBlockProps = { block: Extract<Block, { type: "embed" }> };

const RATIO_CLASS = {
  "16:9": "aspect-video",
  "4:3": "aspect-4/3",
  "1:1": "aspect-square",
} as const;

export function EmbedBlock({ block }: EmbedBlockProps) {
  const src = toEmbedUrl(block.url);
  if (!src) return null;

  return (
    <div className={`relative w-full border border-line ${RATIO_CLASS[block.ratio]}`}>
      <iframe
        src={src}
        title={block.title || "Embedded content"}
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        className="absolute inset-0 size-full"
      />
    </div>
  );
}