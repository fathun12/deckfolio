"use client";

import { SectionHeader } from "./SectionHeader";
import { SlideGroup } from "./SlideGroup";
import { slidesOf } from "../logic/structure";
import type { EditorSection, EditorSlide } from "@/core/types/editor";

type StructurePanelProps = {
  sections: EditorSection[];
  slides: EditorSlide[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddSlide: (sectionId: string | null) => void;
  onAddSection: () => void;
  onReorderSlides: (sectionId: string | null, orderedIds: string[]) => void;
  onRenameSection: (id: string, title: string) => void;
  onMoveSection: (id: string, direction: -1 | 1) => void;
  onDeleteSection: (id: string) => void;
};

export function StructurePanel({
  sections,
  slides,
  selectedId,
  onSelect,
  onAddSlide,
  onAddSection,
  onReorderSlides,
  onRenameSection,
  onMoveSection,
  onDeleteSection,
}: StructurePanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="label-mono text-muted">Slides</p>
          <button type="button" className="btn-sm" onClick={() => onAddSlide(null)}>
            Add slide
          </button>
        </div>
        <SlideGroup
          groupId="group-none"
          slides={slidesOf(slides, null)}
          selectedId={selectedId}
          onSelect={onSelect}
          onReorder={(ids) => onReorderSlides(null, ids)}
        />
      </div>

      {sections.map((section, index) => (
        <div key={section.id} className="rule pt-4">
          <SectionHeader
            section={section}
            isFirst={index === 0}
            isLast={index === sections.length - 1}
            onRename={(title) => onRenameSection(section.id, title)}
            onMove={(direction) => onMoveSection(section.id, direction)}
            onDelete={() => onDeleteSection(section.id)}
          />
          <SlideGroup
            groupId={`group-${section.id}`}
            slides={slidesOf(slides, section.id)}
            selectedId={selectedId}
            onSelect={onSelect}
            onReorder={(ids) => onReorderSlides(section.id, ids)}
          />
          <button type="button" className="btn-sm mt-2" onClick={() => onAddSlide(section.id)}>
            Add slide
          </button>
        </div>
      ))}

      <button type="button" className="btn-outline" onClick={onAddSection}>
        Add section
      </button>
    </div>
  );
}