"use client";

import { useEffect, useMemo, useState } from "react";
import { useActiveSection } from "@/features/viewer/logic/useActiveSection";
import type { TocItem } from "@/core/types/viewer";

export function useToc(items: TocItem[]) {
  const slideIds = useMemo(
    () =>
      items.flatMap((item) =>
        item.children.length > 0 ? item.children.map((c) => c.id) : [item.id]
      ),
    [items]
  );

  const activeId = useActiveSection(slideIds);

  const activeSectionId = useMemo(
    () => items.find((item) => item.children.some((c) => c.id === activeId))?.id ?? null,
    [items, activeId]
  );

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return {
    activeId,
    activeSectionId,
    open,
    openDrawer: () => setOpen(true),
    closeDrawer: () => setOpen(false),
  };
}