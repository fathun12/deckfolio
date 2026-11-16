import { cn } from "@/lib/utils";
import type { Block } from "@/core/types/block";

type BentoBlockProps = { block: Extract<Block, { type: "bento" }> };

export function BentoBlock({ block }: BentoBlockProps) {
  return (
    <div className="grid grid-cols-1 border-t border-l border-line sm:grid-cols-2 lg:grid-cols-3">
      {block.cells.map((cell, index) => (
        <div
          key={index}
          className={cn(
            "border-r border-b border-line bg-surface p-6",
            cell.span === 2 && "sm:col-span-2"
          )}
        >
          {cell.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cell.imageUrl}
              alt={cell.alt}
              loading="lazy"
              className="mb-4 aspect-video w-full object-cover"
            />
          )}
          <p className="label-mono mb-2 text-muted">{String(index + 1).padStart(2, "0")}</p>
          {cell.title && <h3 className="text-xl font-semibold">{cell.title}</h3>}
          {cell.text && (
            <p className="mt-2 text-sm whitespace-pre-line text-muted">{cell.text}</p>
          )}
        </div>
      ))}
    </div>
  );
}