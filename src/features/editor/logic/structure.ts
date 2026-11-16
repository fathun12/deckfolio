import type { EditorSection, EditorSlide } from "@/core/types/editor";

export function slidesOf(slides: EditorSlide[], sectionId: string | null): EditorSlide[] {
  return slides
    .filter((slide) => slide.sectionId === sectionId)
    .sort((a, b) => a.position - b.position);
}

export function sortedSections(sections: EditorSection[]): EditorSection[] {
  return [...sections].sort((a, b) => a.position - b.position);
}

export function nextSlidePosition(slides: EditorSlide[], sectionId: string | null): number {
  const group = slidesOf(slides, sectionId);
  return group.length > 0 ? group[group.length - 1].position + 1 : 0;
}

export function nextSectionPosition(sections: EditorSection[]): number {
  const sorted = sortedSections(sections);
  return sorted.length > 0 ? sorted[sorted.length - 1].position + 1 : 0;
}