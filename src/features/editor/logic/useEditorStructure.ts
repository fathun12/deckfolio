"use client";

import { useState } from "react";
import {
  nextSectionPosition,
  nextSlidePosition,
  slidesOf,
  sortedSections,
} from "./structure";
import type { EditorActions, EditorResult, EditorStructure } from "@/core/types/editor";

const NEW_SLIDE_TITLE = "Untitled slide";
const NEW_SECTION_TITLE = "Untitled section";
const GENERIC_ERROR = "Something went wrong. Please try again.";

export function useEditorStructure(
  projectId: string,
  initial: EditorStructure,
  actions: EditorActions
) {
  const [data, setData] = useState<EditorStructure>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(initial.slides[0]?.id ?? null);

  // Ubah tampilan dulu (optimistik). Kalau server menolak, kembalikan.
  async function commit(next: EditorStructure, call: () => Promise<EditorResult>) {
    const previous = data;
    setData(next);
    setError(null);
    setBusy((n) => n + 1);
    try {
      const result = await call();
      if (!result.ok) {
        setData(previous);
        setError(result.error);
      }
    } catch {
      setData(previous);
      setError(GENERIC_ERROR);
    } finally {
      setBusy((n) => n - 1);
    }
  }

  // Untuk tambah item: id baru datang dari server
  async function create(call: () => Promise<EditorResult>, onCreated: (id: string) => void) {
    setError(null);
    setBusy((n) => n + 1);
    try {
      const result = await call();
      if (!result.ok) {
        setError(result.error);
      } else if (!result.id) {
        setError(GENERIC_ERROR);
      } else {
        onCreated(result.id);
      }
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setBusy((n) => n - 1);
    }
  }

  // ---------- Slide ----------

  function addSlide(sectionId: string | null) {
    return create(
      () => actions.addSlide({ projectId, sectionId, title: NEW_SLIDE_TITLE }),
      (id) => {
        setData((d) => ({
          ...d,
          slides: [
            ...d.slides,
            {
              id,
              sectionId,
              title: NEW_SLIDE_TITLE,
              position: nextSlidePosition(d.slides, sectionId),
            },
          ],
        }));
        setSelectedId(id);
      }
    );
  }

  function renameSlide(id: string, rawTitle: string) {
    const title = rawTitle.trim();
    const current = data.slides.find((s) => s.id === id);
    if (!current || !title || title === current.title) return;
    return commit(
      { ...data, slides: data.slides.map((s) => (s.id === id ? { ...s, title } : s)) },
      () => actions.renameSlide({ projectId, id, title })
    );
  }

  function deleteSlide(id: string) {
    const remaining = data.slides.filter((s) => s.id !== id);
    if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
    return commit({ ...data, slides: remaining }, () => actions.deleteSlide({ projectId, id }));
  }

  function moveSlide(id: string, sectionId: string | null) {
    const current = data.slides.find((s) => s.id === id);
    if (!current || current.sectionId === sectionId) return;
    const position = nextSlidePosition(data.slides, sectionId);
    return commit(
      {
        ...data,
        slides: data.slides.map((s) => (s.id === id ? { ...s, sectionId, position } : s)),
      },
      () => actions.moveSlide({ projectId, id, sectionId })
    );
  }

  function reorderSlides(sectionId: string | null, orderedIds: string[]) {
    const order = new Map(orderedIds.map((id, index) => [id, index]));
    return commit(
      {
        ...data,
        slides: data.slides.map((s) => {
          const index = order.get(s.id);
          return index === undefined ? s : { ...s, position: index };
        }),
      },
      () => actions.reorderSlides({ projectId, sectionId, orderedIds })
    );
  }

  // ---------- Section ----------

  function addSection() {
    return create(
      () => actions.addSection({ projectId, title: NEW_SECTION_TITLE }),
      (id) =>
        setData((d) => ({
          ...d,
          sections: [
            ...d.sections,
            { id, title: NEW_SECTION_TITLE, position: nextSectionPosition(d.sections) },
          ],
        }))
    );
  }

  function renameSection(id: string, rawTitle: string) {
    const title = rawTitle.trim();
    const current = data.sections.find((s) => s.id === id);
    if (!current || !title || title === current.title) return;
    return commit(
      { ...data, sections: data.sections.map((s) => (s.id === id ? { ...s, title } : s)) },
      () => actions.renameSection({ projectId, id, title })
    );
  }

  function deleteSection(id: string) {
    const moving = new Map(
      slidesOf(data.slides, id).map((slide, index) => [
        slide.id,
        nextSlidePosition(data.slides, null) + index,
      ])
    );
    return commit(
      {
        sections: data.sections.filter((s) => s.id !== id),
        slides: data.slides.map((s) => {
          const position = moving.get(s.id);
          return position === undefined ? s : { ...s, sectionId: null, position };
        }),
      },
      () => actions.deleteSection({ projectId, id })
    );
  }

  function moveSection(id: string, direction: -1 | 1) {
    const ordered = sortedSections(data.sections);
    const from = ordered.findIndex((s) => s.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ordered.length) return;

    const swapped = [...ordered];
    [swapped[from], swapped[to]] = [swapped[to], swapped[from]];
    const orderedIds = swapped.map((s) => s.id);
    const order = new Map(orderedIds.map((sectionId, index) => [sectionId, index]));

    return commit(
      {
        ...data,
        sections: data.sections.map((s) => ({ ...s, position: order.get(s.id) ?? s.position })),
      },
      () => actions.reorderSections({ projectId, orderedIds })
    );
  }

  return {
    sections: sortedSections(data.sections),
    slides: data.slides,
    selectedId,
    error,
    saving: busy > 0,
    select: setSelectedId,
    dismissError: () => setError(null),
    addSlide,
    renameSlide,
    deleteSlide,
    moveSlide,
    reorderSlides,
    addSection,
    renameSection,
    deleteSection,
    moveSection,
  };
}