"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { flattenSlides } from "../logic/flattenSlides";
import { usePresenter } from "../logic/usePresenter";
import { PresenterBar } from "./PresenterBar";
import { PresenterSlide } from "./PresenterSlide";
import { PresenterToc } from "./PresenterToc";
import type { ViewerProject } from "@/core/types/viewer";

export function PresenterView({
  project,
  closeHref = `/p/${project.slug}`,
}: {
  project: ViewerProject;
  closeHref?: string;
}) {
  const router = useRouter();

  const slides = useMemo(() => flattenSlides(project), [project]);
  const anchorIds = useMemo(() => slides.map((item) => item.slide.anchorId), [slides]);

  const exit = useCallback(() => router.push(closeHref), [router, closeHref]);
  const presenter = usePresenter(anchorIds, exit);

  const scrollRef = useRef<HTMLElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [presenter.index]);

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-paper">
        <p className="label-mono text-muted">00 / Empty</p>
        <p className="text-xl font-semibold">This project has no slides yet.</p>
        <Link href={closeHref} className="btn-solid">
          Back to project
        </Link>
      </div>
    );
  }

  const current = slides[presenter.index];
  const progress = ((presenter.index + 1) / presenter.total) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-paper text-ink"
      onTouchStart={presenter.swipe.onTouchStart}
      onTouchEnd={presenter.swipe.onTouchEnd}
    >
      <div className="h-0.5 bg-line-soft" role="presentation">
        <div
          className="h-full bg-accent transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Area sensitif di tepi kiri: kursor ke sini membuka daftar isi */}
      <div
        aria-hidden="true"
        onMouseEnter={presenter.openToc}
        className="fixed inset-y-0 left-0 z-10 w-3"
      />

      <main
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <PresenterSlide
          key={current.slide.id}
          item={current}
          slideLinks={project.slideLinks}
        />
      </main>

      <PresenterBar
        index={presenter.index}
        total={presenter.total}
        fullscreen={presenter.fullscreen}
        closeHref={closeHref}
        onPrev={presenter.prev}
        onNext={presenter.next}
        onToc={presenter.toggleToc}
        onFullscreen={presenter.toggleFullscreen}
      />

      <PresenterToc
        items={project.toc}
        activeId={current.slide.anchorId}
        open={presenter.tocOpen}
        onClose={presenter.closeToc}
      />
    </div>
  );
}