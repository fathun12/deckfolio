"use client";

import { BlockCard } from "./BlockCard";
import { BlockEditor } from "./BlockEditor";
import { BLOCK_LABELS, BLOCK_TYPES, type BlockType } from "../logic/blockDefaults";
import { blockSchema } from "@/core/schemas/block";
import type { SlideOption } from "./blocks/types";
import type { Block } from "@/core/types/block";

type BlockListProps = {
  blocks: Block[];
  slideOptions: SlideOption[];
  onAdd: (type: BlockType) => void;
  onChange: (next: Block) => void;
  onRemove: (blockId: string) => void;
  onMove: (blockId: string, direction: -1 | 1) => void;
};

export function BlockList({
  blocks,
  slideOptions,
  onAdd,
  onChange,
  onRemove,
  onMove,
}: BlockListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold">Content</h2>
        <p className="label-mono text-muted">{String(blocks.length).padStart(2, "0")} blocks</p>
      </div>

      {blocks.length === 0 && (
        <div className="cell py-10 text-center">
          <p className="label-mono mb-2 text-muted">00 / Empty</p>
          <p className="text-sm text-muted">This slide has no content yet. Add a block below.</p>
        </div>
      )}

      {blocks.map((block, index) => {
        const check = blockSchema.safeParse(block);
        const issue = check.success ? null : (check.error.issues[0]?.message ?? "Invalid block.");

        return (
          <BlockCard
            key={block.id}
            index={index}
            label={BLOCK_LABELS[block.type]}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
            issue={issue}
            onMove={(direction) => onMove(block.id, direction)}
            onRemove={() => onRemove(block.id)}
          >
            <BlockEditor block={block} slideOptions={slideOptions} onChange={onChange} />
          </BlockCard>
        );
      })}

      <div className="cell">
        <p className="label-mono mb-3 text-muted">Add block</p>
        <div className="flex flex-wrap gap-2">
          {BLOCK_TYPES.map((type) => (
            <button key={type} type="button" className="btn-sm" onClick={() => onAdd(type)}>
              {BLOCK_LABELS[type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}