"use client";

import { BlockField } from "./BlockField";
import type { EditorProps } from "./types";

export function HeadingEditor({ block, onChange }: EditorProps<"heading">) {
  return (
    <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
      <BlockField label="Level" htmlFor={`${block.id}-level`}>
        <select
          id={`${block.id}-level`}
          className="input"
          value={block.level}
          onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 1 | 2 | 3 })}
        >
          <option value={1}>Heading 1</option>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
        </select>
      </BlockField>
      <BlockField label="Text" htmlFor={`${block.id}-text`}>
        <input
          id={`${block.id}-text`}
          className="input"
          value={block.text}
          maxLength={300}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      </BlockField>
    </div>
  );
}

export function QuoteEditor({ block, onChange }: EditorProps<"quote">) {
  return (
    <div className="flex flex-col gap-4">
      <BlockField label="Quote" htmlFor={`${block.id}-text`}>
        <textarea
          id={`${block.id}-text`}
          className="input min-h-24"
          value={block.text}
          maxLength={1000}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      </BlockField>
      <BlockField label="Source (optional)" htmlFor={`${block.id}-cite`}>
        <input
          id={`${block.id}-cite`}
          className="input"
          value={block.cite ?? ""}
          maxLength={200}
          onChange={(e) => onChange({ ...block, cite: e.target.value || undefined })}
        />
      </BlockField>
    </div>
  );
}

export function ReasoningEditor({ block, onChange }: EditorProps<"reasoning">) {
  return (
    <div className="flex flex-col gap-4">
      <BlockField label="Title" htmlFor={`${block.id}-title`}>
        <input
          id={`${block.id}-title`}
          className="input"
          value={block.title}
          maxLength={80}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
        />
      </BlockField>
      <BlockField label="Text" htmlFor={`${block.id}-text`}>
        <textarea
          id={`${block.id}-text`}
          className="input min-h-28"
          value={block.text}
          maxLength={2000}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      </BlockField>
    </div>
  );
}

export function CodeEditor({ block, onChange }: EditorProps<"code">) {
  return (
    <div className="flex flex-col gap-4">
      <BlockField label="Language (optional)" htmlFor={`${block.id}-language`}>
        <input
          id={`${block.id}-language`}
          className="input"
          value={block.language ?? ""}
          maxLength={40}
          placeholder="e.g. ts"
          onChange={(e) => onChange({ ...block, language: e.target.value || undefined })}
        />
      </BlockField>
      <BlockField label="Code" htmlFor={`${block.id}-code`}>
        <textarea
          id={`${block.id}-code`}
          className="input min-h-32 font-mono"
          value={block.code}
          maxLength={20000}
          spellCheck={false}
          onChange={(e) => onChange({ ...block, code: e.target.value })}
        />
      </BlockField>
    </div>
  );
}

export function DividerEditor() {
  return <p className="text-sm text-muted">A horizontal divider line. No settings.</p>;
}