"use client";

import { useToc } from "../logic/useToc";
import { TocDrawer } from "./TocDrawer";
import { TocRail } from "./TocRail";
import type { TocItem } from "@/core/types/viewer";

export function Toc({ items }: { items: TocItem[] }) {
  const toc = useToc(items);

  return (
    <>
      <TocRail items={items} activeId={toc.activeId} activeSectionId={toc.activeSectionId} />
      <TocDrawer
        items={items}
        activeId={toc.activeId}
        activeSectionId={toc.activeSectionId}
        open={toc.open}
        onOpen={toc.openDrawer}
        onClose={toc.closeDrawer}
      />
    </>
  );
}