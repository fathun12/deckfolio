"use client";

import { BlockField } from "./BlockField";
import { UploadButton } from "./UploadButton";
import type { BlockOf, EditorProps } from "./types";

type Cell = BlockOf<"bento">["cells"][number];

export function BentoEditor({ block, onChange }: EditorProps<"bento">) {
  const setCell = (index: number, patch: Partial<Cell>) =>
    onChange({
      ...block,
      cells: block.cells.map((cell, i) => (i === index ? { ...cell, ...patch } : cell)),
    });

  return (
    <div className="flex flex-col gap-4">
      {block.cells.map((cell, index) => (
        <div key={index} className="rule flex flex-col gap-3 pt-4 first:border-t-0 first:pt-0">
          <div className="flex items-center justify-between">
            <p className="label-mono text-muted">Cell {String(index + 1).padStart(2, "0")}</p>
            <button
              type="button"
              className="btn-sm"
              onClick={() =>
                onChange({ ...block, cells: block.cells.filter((_, i) => i !== index) })
              }
            >
              Remove
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
            <BlockField label="Width" htmlFor={`${block.id}-${index}-span`}>
              <select
                id={`${block.id}-${index}-span`}
                className="input"
                value={cell.span}
                onChange={(e) => setCell(index, { span: Number(e.target.value) as 1 | 2 })}
              >
                <option value={1}>Narrow</option>
                <option value={2}>Wide</option>
              </select>
            </BlockField>
            <BlockField label="Title" htmlFor={`${block.id}-${index}-title`}>
              <input
                id={`${block.id}-${index}-title`}
                className="input"
                value={cell.title}
                maxLength={120}
                onChange={(e) => setCell(index, { title: e.target.value })}
              />
            </BlockField>
          </div>

          <BlockField label="Text" htmlFor={`${block.id}-${index}-text`}>
            <textarea
              id={`${block.id}-${index}-text`}
              className="input min-h-20"
              value={cell.text}
              maxLength={600}
              onChange={(e) => setCell(index, { text: e.target.value })}
            />
          </BlockField>

          <BlockField label="Image address (optional)" htmlFor={`${block.id}-${index}-image`}>
            <input
              id={`${block.id}-${index}-image`}
              className="input"
              value={cell.imageUrl ?? ""}
              placeholder="https://..."
              maxLength={8192}
              onChange={(e) => setCell(index, { imageUrl: e.target.value.trim() || undefined })}
            />
          </BlockField>
          <UploadButton onUploaded={(url) => setCell(index, { imageUrl: url })} />

          {cell.imageUrl && (
            <BlockField label="Alt text" htmlFor={`${block.id}-${index}-alt`}>
              <input
                id={`${block.id}-${index}-alt`}
                className="input"
                value={cell.alt}
                maxLength={300}
                onChange={(e) => setCell(index, { alt: e.target.value })}
              />
            </BlockField>
          )}
        </div>
      ))}

      <div>
        <button
          type="button"
          className="btn-sm disabled:opacity-40"
          disabled={block.cells.length >= 12}
          onClick={() =>
            onChange({
              ...block,
              cells: [...block.cells, { title: "", text: "", alt: "", span: 1 }],
            })
          }
        >
          Add cell
        </button>
      </div>
    </div>
  );
}