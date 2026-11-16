import type { BlockOf } from "@/core/types/block";

export function ReasoningBlock({ block }: { block: BlockOf<"reasoning"> }) {
  return (
    <aside className="border-l-2 border-accent pl-4">
      <p className="label-mono text-accent">{block.title}</p>
      <p className="mt-2 leading-relaxed">{block.text}</p>
    </aside>
  );
}