import type { BlockOf } from "@/core/types/block";

export function CodeBlock({ block }: { block: BlockOf<"code"> }) {
  return (
    <div>
      {block.language && <p className="label-mono mb-2 text-muted">{block.language}</p>}
      <pre className="overflow-x-auto border border-line bg-surface p-4 font-mono text-sm">
        <code>{block.code}</code>
      </pre>
    </div>
  );
}