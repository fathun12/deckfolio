"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { blockSchema } from "@/core/schemas/block";
import { createBlock, type BlockType } from "./blockDefaults";
import type { Block } from "@/core/types/block";
import type { SaveBlocksAction, SlideBlocks } from "@/core/types/slide-blocks";

const DEBOUNCE_MS = 800;
const GENERIC_ERROR = "Could not save your changes. Please try again.";

export type SaveStatus = "saved" | "pending" | "saving" | "error";

// Hanya block yang valid yang dikirim. Block yang belum lengkap tetap ada di layar.
function validBlocks(blocks: Block[]): Block[] {
  return blocks.flatMap((block) => {
    const result = blockSchema.safeParse(block);
    return result.success ? [result.data as Block] : [];
  });
}

function countIncomplete(data: SlideBlocks): number {
  let total = 0;
  for (const blocks of Object.values(data)) {
    for (const block of blocks) {
      if (!blockSchema.safeParse(block).success) total += 1;
    }
  }
  return total;
}

export function useSlideBlocks(projectId: string, initial: SlideBlocks, save: SaveBlocksAction) {
  const [data, setData] = useState<SlideBlocks>(initial);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [error, setError] = useState<string | null>(null);

  const latest = useRef<SlideBlocks>(initial);
  const dirty = useRef<Set<string>>(new Set());
  const inflight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (inflight.current || dirty.current.size === 0) return;

    inflight.current = true;
    setStatus("saving");
    let failure: string | null = null;

    while (!failure) {
      const next = dirty.current.values().next();
      if (next.done) break;
      const slideId = next.value;
      dirty.current.delete(slideId);

      try {
        const result = await save({
          projectId,
          slideId,
          blocks: validBlocks(latest.current[slideId] ?? []),
        });
        if (!result.ok) {
          failure = result.error;
          dirty.current.add(slideId);
        }
      } catch {
        failure = GENERIC_ERROR;
        dirty.current.add(slideId);
      }
    }

    inflight.current = false;
    if (failure) {
      setError(failure);
      setStatus("error");
    } else {
      setError(null);
      setStatus("saved");
    }
  }, [projectId, save]);

  // Simpan sisa perubahan saat halaman editor ditutup
  useEffect(() => {
    return () => {
      void flush();
    };
  }, [flush]);

  // Peringatan browser kalau ada perubahan yang belum tersimpan
  useEffect(() => {
    if (status === "saved") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  function touch(slideId: string, next: Block[]) {
    latest.current = { ...latest.current, [slideId]: next };
    dirty.current.add(slideId);
    setData(latest.current);
    setStatus((current) => (current === "saving" ? current : "pending"));

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void flush();
    }, DEBOUNCE_MS);
  }

  function addBlock(slideId: string, type: BlockType) {
    touch(slideId, [...(latest.current[slideId] ?? []), createBlock(type)]);
  }

  function updateBlock(slideId: string, next: Block) {
    touch(
      slideId,
      (latest.current[slideId] ?? []).map((block) => (block.id === next.id ? next : block))
    );
  }

  function removeBlock(slideId: string, blockId: string) {
    touch(
      slideId,
      (latest.current[slideId] ?? []).filter((block) => block.id !== blockId)
    );
  }

  function moveBlock(slideId: string, blockId: string, direction: -1 | 1) {
    const list = [...(latest.current[slideId] ?? [])];
    const from = list.findIndex((block) => block.id === blockId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= list.length) return;
    [list[from], list[to]] = [list[to], list[from]];
    touch(slideId, list);
  }

  // Dipanggil sebelum slide dihapus: batalkan simpanan yang tertunda untuk slide itu
  function discardPending(slideId: string) {
    dirty.current.delete(slideId);
  }

  return {
    data,
    status,
    error,
    incomplete: countIncomplete(data),
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    discardPending,
    retry: flush,
  };
}