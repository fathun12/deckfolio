"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type TouchEvent,
} from "react";

function subscribeHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
const getHash = () => window.location.hash;
const getServerHash = () => "";

function subscribeFullscreen(callback: () => void) {
  document.addEventListener("fullscreenchange", callback);
  return () => document.removeEventListener("fullscreenchange", callback);
}
const getFullscreen = () => document.fullscreenElement !== null;
const getServerFullscreen = () => false;

// anchorIds: id anchor tiap slide, urut. Posisi slide disimpan di hash URL (#slide-{id}).
export function usePresenter(anchorIds: string[], onExit: () => void) {
  const total = anchorIds.length;
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const fullscreen = useSyncExternalStore(
    subscribeFullscreen,
    getFullscreen,
    getServerFullscreen
  );
  const [tocOpen, setTocOpen] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const found = anchorIds.indexOf(hash.slice(1));
  const index = found >= 0 ? found : 0;

  const go = useCallback(
    (target: number) => {
      if (total === 0) return;
      const clamped = Math.min(Math.max(target, 0), total - 1);
      // replace: tidak menambah riwayat browser untuk setiap slide
      window.location.replace(`#${anchorIds[clamped]}`);
    },
    [anchorIds, total]
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  const openToc = useCallback(() => setTocOpen(true), []);
  const closeToc = useCallback(() => setTocOpen(false), []);
  const toggleToc = useCallback(() => setTocOpen((open) => !open), []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  // Keluar dari presentasi = keluar dari fullscreen
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      // Saat galeri difokus, panah dipakai untuk menggeser galeri
      const inGallery = Boolean(target?.closest("[role='region']"));

      switch (event.key) {
        case "ArrowRight":
          if (inGallery) return;
          event.preventDefault();
          next();
          break;
        case "ArrowLeft":
          if (inGallery) return;
          event.preventDefault();
          prev();
          break;
        case "PageDown":
          event.preventDefault();
          next();
          break;
        case "PageUp":
          event.preventDefault();
          prev();
          break;
        case " ":
          if (target?.closest("a, button")) return;
          event.preventDefault();
          next();
          break;
        case "Home":
          event.preventDefault();
          go(0);
          break;
        case "End":
          event.preventDefault();
          go(total - 1);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "t":
        case "T":
          toggleToc();
          break;
        case "Escape":
          if (tocOpen) setTocOpen(false);
          else onExit();
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, total, toggleFullscreen, toggleToc, tocOpen, onExit]);

  const onTouchStart = (event: TouchEvent) => {
    if ((event.target as HTMLElement).closest("[role='region']")) {
      touch.current = null;
      return;
    }
    const point = event.touches[0];
    touch.current = { x: point.clientX, y: point.clientY };
  };

  const onTouchEnd = (event: TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;

    const point = event.changedTouches[0];
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next();
      else prev();
    }
  };

  return {
    index,
    total,
    next,
    prev,
    tocOpen,
    openToc,
    closeToc,
    toggleToc,
    fullscreen,
    toggleFullscreen,
    swipe: { onTouchStart, onTouchEnd },
  };
}