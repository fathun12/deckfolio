"use client";

import { BlockField } from "./BlockField";
import type { EditorProps } from "./types";

export function EmbedEditor({ block, onChange }: EditorProps<"embed">) {
  return (
    <div className="flex flex-col gap-4">
      <BlockField label="Address" htmlFor={`${block.id}-url`}>
        <input
          id={`${block.id}-url`}
          className="input"
          value={block.url}
          placeholder="https://www.youtube.com/watch?v=..."
          maxLength={2048}
          onChange={(e) => onChange({ ...block, url: e.target.value.trim() })}
        />
      </BlockField>
      <p className="label-mono text-muted">
        Supported: YouTube, Vimeo, Loom, Figma, Google Maps (embed link).
      </p>
      <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
        <BlockField label="Shape" htmlFor={`${block.id}-ratio`}>
          <select
            id={`${block.id}-ratio`}
            className="input"
            value={block.ratio}
            onChange={(e) =>
              onChange({ ...block, ratio: e.target.value as "16:9" | "4:3" | "1:1" })
            }
          >
            <option value="16:9">Wide 16:9</option>
            <option value="4:3">Standard 4:3</option>
            <option value="1:1">Square</option>
          </select>
        </BlockField>
        <BlockField label="Title (for accessibility)" htmlFor={`${block.id}-title`}>
          <input
            id={`${block.id}-title`}
            className="input"
            value={block.title}
            maxLength={200}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
          />
        </BlockField>
      </div>
    </div>
  );
}