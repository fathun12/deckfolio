"use client";
/* eslint-disable @next/next/no-img-element */

import { useCarousel } from "../logic/useCarousel";
import type { BlockOf } from "@/core/types/block";

type GalleryProps = {
  images: BlockOf<"gallery">["images"];
  label: string;
};

export function Gallery({ images, label }: GalleryProps) {
  const { ref, prev, next } = useCarousel();

  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        <button type="button" onClick={prev} aria-label="Previous images" className="btn-sm">
          ←
        </button>
        <button type="button" onClick={next} aria-label="Next images" className="btn-sm">
          →
        </button>
      </div>

      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
      >
        {images.map((image, i) => (
          <figure key={i} className="shrink-0 basis-[85%] snap-start md:basis-[48%]">
            <img
              src={image.url}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className="aspect-[3/2] w-full border border-line object-cover"
            />
            {image.caption && (
              <figcaption className="label-mono mt-2 text-muted">{image.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}