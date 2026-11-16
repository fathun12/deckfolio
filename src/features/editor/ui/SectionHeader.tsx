"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { ConfirmButton } from "./ConfirmButton";
import type { EditorSection } from "@/core/types/editor";

type SectionHeaderProps = {
  section: EditorSection;
  isFirst: boolean;
  isLast: boolean;
  onRename: (title: string) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
};

export function SectionHeader({
  section,
  isFirst,
  isLast,
  onRename,
  onMove,
  onDelete,
}: SectionHeaderProps) {
  return (
    <div className="mb-2 flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <input
          key={section.title}
          defaultValue={section.title}
          maxLength={200}
          aria-label="Section title"
          className="input min-w-0 flex-1"
          onBlur={(e) => {
            const value = e.currentTarget.value.trim();
            if (!value) e.currentTarget.value = section.title;
            else onRename(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
        <button
          type="button"
          className="btn-sm disabled:opacity-40"
          aria-label="Move section up"
          disabled={isFirst}
          onClick={() => onMove(-1)}
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          className="btn-sm disabled:opacity-40"
          aria-label="Move section down"
          disabled={isLast}
          onClick={() => onMove(1)}
        >
          <ChevronDown size={14} />
        </button>
      </div>
      <ConfirmButton
        label="Delete section"
        confirmLabel="Confirm delete"
        hint="Slides in this section are kept and moved out of it."
        onConfirm={onDelete}
      />
    </div>
  );
}