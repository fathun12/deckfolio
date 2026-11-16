import type { ViewerProject, ViewerSlide } from "@/core/types/viewer";

export type PresenterSlideItem = {
  slide: ViewerSlide;
  sectionLabel: string | null;
};

// Meratakan section + slide menjadi satu daftar urut (satu item = satu layar)
export function flattenSlides(project: ViewerProject): PresenterSlideItem[] {
  const out: PresenterSlideItem[] = [];

  for (const entry of project.entries) {
    if (entry.kind === "slide") {
      out.push({ slide: entry.slide, sectionLabel: null });
    } else {
      for (const slide of entry.slides) {
        out.push({ slide, sectionLabel: `${entry.number} / ${entry.title}` });
      }
    }
  }

  return out;
}