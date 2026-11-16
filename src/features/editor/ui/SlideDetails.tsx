"use client";

import { ConfirmButton } from "./ConfirmButton";
import type { EditorSection, EditorSlide } from "@/core/types/editor";

type SlideDetailsProps = {
  slide: EditorSlide | null;
  sections: EditorSection[];
  onRename: (title: string) => void;
  onMove: (sectionId: string | null) => void;
  onDelete: () => void;
};

export function SlideDetails({ slide, sections, onRename, onMove, onDelete }: SlideDetailsProps) {
  if (!slide) {
    return (
      <div className="cell py-16 text-center">
        <p className="label-mono mb-3 text-muted">00 / Empty</p>
        <p className="text-xl font-semibold">No slide selected.</p>
        <p className="mt-1 text-sm text-muted">Add a slide on the left to get started.</p>
      </div>
    );
  }

  return (
    <div className="cell flex flex-col gap-6">
      <p className="label-mono text-muted">Slide settings</p>

      <div>
        <label className="field-label" htmlFor="slide-title">
          Title
        </label>
        <input
          id="slide-title"
          key={`${slide.id}:${slide.title}`}
          defaultValue={slide.title}
          maxLength={200}
          className="input"
          onBlur={(e) => {
            const value = e.currentTarget.value.trim();
            if (!value) e.currentTarget.value = slide.title;
            else onRename(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
      </div>

      <div>
        <label className="field-label" htmlFor="slide-section">
          Section
        </label>
        <select
          id="slide-section"
          className="input"
          value={slide.sectionId ?? ""}
          onChange={(e) => onMove(e.target.value || null)}
        >
          <option value="">No section</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.title}
            </option>
          ))}
        </select>
      </div>

      <div className="rule pt-4">
        <ConfirmButton label="Delete slide" confirmLabel="Confirm delete" onConfirm={onDelete} />
      </div>
    </div>
  );
}