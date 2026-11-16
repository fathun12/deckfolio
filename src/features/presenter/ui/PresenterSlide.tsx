import { BlockRenderer } from "@/features/viewer/ui/BlockRenderer";
import type { PresenterSlideItem } from "../logic/flattenSlides";

type PresenterSlideProps = {
  item: PresenterSlideItem;
  slideLinks: Record<string, string>;
};

export function PresenterSlide({ item, slideLinks }: PresenterSlideProps) {
  const { slide, sectionLabel } = item;

  return (
    <article className="animate-fade-in mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12 md:px-12">
      {sectionLabel && <p className="label-mono text-muted">{sectionLabel}</p>}
      <p className="label-mono mt-2 text-accent">{slide.number}</p>
      <h2 className="mt-3 text-5xl leading-none font-bold uppercase md:text-7xl">
        {slide.title}
      </h2>

      {slide.blocks.length > 0 && (
        <div className="mt-10 space-y-8 text-lg md:text-xl">
          {slide.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} slideLinks={slideLinks} />
          ))}
        </div>
      )}
    </article>
  );
}