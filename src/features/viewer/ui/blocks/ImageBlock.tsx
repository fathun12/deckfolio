/* eslint-disable @next/next/no-img-element */
import type { BlockOf } from "@/core/types/block";

export function ImageBlock({ block }: { block: BlockOf<"image"> }) {
  return (
    <figure>
      <img
        src={block.url}
        alt={block.alt}
        loading="lazy"
        decoding="async"
        className="w-full border border-line"
      />
      {block.caption && (
        <figcaption className="label-mono mt-2 text-muted">{block.caption}</figcaption>
      )}
    </figure>
  );
}