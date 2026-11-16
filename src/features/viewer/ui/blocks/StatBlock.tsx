import type { BlockOf } from "@/core/types/block";

export function StatBlock({ block }: { block: BlockOf<"stat"> }) {
  if (block.items.length === 0) return null;
  return (
    <dl className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
      {block.items.map((item, i) => (
        <div key={i} className="bg-surface p-4">
          <dt className="label-mono text-muted">{item.label}</dt>
          <dd className="mt-2 font-display text-3xl font-bold">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}