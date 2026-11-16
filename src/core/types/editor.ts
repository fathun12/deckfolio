import type { ProjectVisibility } from "./project";

export type EditorSection = { id: string; title: string; position: number };

export type EditorSlide = {
  id: string;
  sectionId: string | null;
  title: string;
  position: number;
};

export type EditorStructure = {
  sections: EditorSection[];
  slides: EditorSlide[];
};

export type EditorProject = EditorStructure & {
  id: string;
  slug: string;
  title: string;
  visibility: ProjectVisibility;
};

export type EditorResult = { ok: true; id?: string } | { ok: false; error: string };

export type EditorActions = {
  addSlide: (input: {
    projectId: string;
    sectionId: string | null;
    title: string;
  }) => Promise<EditorResult>;
  renameSlide: (input: { projectId: string; id: string; title: string }) => Promise<EditorResult>;
  deleteSlide: (input: { projectId: string; id: string }) => Promise<EditorResult>;
  moveSlide: (input: {
    projectId: string;
    id: string;
    sectionId: string | null;
  }) => Promise<EditorResult>;
  reorderSlides: (input: {
    projectId: string;
    sectionId: string | null;
    orderedIds: string[];
  }) => Promise<EditorResult>;
  addSection: (input: { projectId: string; title: string }) => Promise<EditorResult>;
  renameSection: (input: { projectId: string; id: string; title: string }) => Promise<EditorResult>;
  deleteSection: (input: { projectId: string; id: string }) => Promise<EditorResult>;
  reorderSections: (input: { projectId: string; orderedIds: string[] }) => Promise<EditorResult>;
};