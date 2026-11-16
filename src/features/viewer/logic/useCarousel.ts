"use client";

import { useCallback, useRef } from "react";

export function useCarousel() {
  const ref = useRef<HTMLDivElement>(null);

  const scrollPage = useCallback((direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  const prev = useCallback(() => scrollPage(-1), [scrollPage]);
  const next = useCallback(() => scrollPage(1), [scrollPage]);

  return { ref, prev, next };
}