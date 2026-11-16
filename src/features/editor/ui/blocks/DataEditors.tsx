"use client";

import { BlockField } from "./BlockField";
import type { EditorProps, SlideOption } from "./types";

export function StatEditor({ block, onChange }: EditorProps<"stat">) {
  const setItem = (index: number, patch: Partial<{ label: string; value: string }>) =>
    onChange({
      ...block,
      items: block.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });

  return (
    <div className="flex flex-col gap-3">
      {block.items.map((item, index) => (
        <div key={index} className="grid items-center gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            className="input"
            aria-label="Stat label"
            placeholder="Label (e.g. Floors)"
            value={item.label}
            maxLength={80}
            onChange={(e) => setItem(index, { label: e.target.value })}
          />
          <input
            className="input"
            aria-label="Stat value"
            placeholder="Value (e.g. 255 m2)"
            value={item.value}
            maxLength={80}
            onChange={(e) => setItem(index, { value: e.target.value })}
          />
          <button
            type="button"
            className="btn-sm"
            onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== index) })}
          >
            Remove
          </button>
        </div>
      ))}
      <div>
        <button
          type="button"
          className="btn-sm disabled:opacity-40"
          disabled={block.items.length >= 12}
          onClick={() => onChange({ ...block, items: [...block.items, { label: "", value: "" }] })}
        >
          Add stat
        </button>
      </div>
    </div>
  );
}

type ButtonEditorProps = EditorProps<"button"> & { slideOptions: SlideOption[] };

export function ButtonEditor({ block, onChange, slideOptions }: ButtonEditorProps) {
  const mode = block.slideId !== undefined ? "slide" : "link";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <BlockField label="Label" htmlFor={`${block.id}-label`}>
        <input
          id={`${block.id}-label`}
          className="input"
          value={block.label}
          maxLength={80}
          onChange={(e) => onChange({ ...block, label: e.target.value })}
        />
      </BlockField>

      <BlockField label="Links to" htmlFor={`${block.id}-mode`}>
        <select
          id={`${block.id}-mode`}
          className="input"
          value={mode}
          onChange={(e) =>
            e.target.value === "slide"
              ? onChange({ ...block, href: undefined, slideId: slideOptions[0]?.id })
              : onChange({ ...block, slideId: undefined })
          }
        >
          <option value="link">External address</option>
          <option value="slide" disabled={slideOptions.length === 0}>
            Another slide
          </option>
        </select>
      </BlockField>

      {mode === "slide" ? (
        <BlockField label="Slide" htmlFor={`${block.id}-slide`}>
          <select
            id={`${block.id}-slide`}
            className="input"
            value={block.slideId ?? ""}
            onChange={(e) => onChange({ ...block, href: undefined, slideId: e.target.value })}
          >
            {slideOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </BlockField>
      ) : (
        <BlockField label="Address" htmlFor={`${block.id}-href`}>
          <input
            id={`${block.id}-href`}
            className="input"
            value={block.href ?? ""}
            placeholder="https://..."
            maxLength={2048}
            onChange={(e) => onChange({ ...block, href: e.target.value.trim() || undefined })}
          />
        </BlockField>
      )}
    </div>
  );
}