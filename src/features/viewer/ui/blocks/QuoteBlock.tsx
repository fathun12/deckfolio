import type { BlockOf } from "@/core/types/block";

export function QuoteBlock({ block }: { block: BlockOf<"quote"> }) {
  return (
    <blockquote className="border-l border-line pl-6">
      <p className="font-display text-2xl leading-snug">{block.text}</p>
      {block.cite && <footer className="label-mono mt-3 text-muted">{block.cite}</footer>}
    </blockquote>
  );
}