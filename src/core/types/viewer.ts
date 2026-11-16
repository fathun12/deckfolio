import type { Block } from "./block";

export type ViewerSlide = {
  id: string;
  anchorId: string;
  number: string;
  title: string;
  blocks: Block[];
};

export type ViewerEntry =
  | { kind: "slide"; slide: ViewerSlide }
  | {
      kind: "section";
      id: string;
      anchorId: string;
      number: string;
      title: string;
      slides: ViewerSlide[];
    };

export type TocItem = {
  id: string; // id anchor di halaman
  number: string;
  label: string;
  children: TocItem[];
};

export type ViewerProject = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  stats: string[];
  entries: ViewerEntry[];
  toc: TocItem[];
  // slideId -> "#slide-{id}" (hanya untuk slide yang masih ada)
  slideLinks: Record<string, string>;
  slideCount: number;
};