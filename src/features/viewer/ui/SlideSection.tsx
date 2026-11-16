import { BlockRenderer } from "./BlockRenderer";
import type { ViewerSlide } from "@/core/types/viewer";

type SlideSectionProps = {
  slide: ViewerSlide;
  slideLinks: Record<string, string>;
  nested?: boolean;
};

export function SlideSection({ slide, slideLinks, nested = false }: SlideSectionProps) {
  const Title = nested ? "h3" : "h2";

  return (
    <section id={slide.anchorId} className="scroll-mt-8 border-t border-line pt-6">
      <p className="label-mono text-accent">{slide.number}</p>
      <Title
        className={
          nested
            ? "mt-2 text-3xl font-bold uppercase"
            : "mt-2 text-4xl font-bold uppercase"
        }
      >
        {slide.title}
      </Title>

      {slide.blocks.length > 0 && (
        <div className="mt-8 space-y-8">
          {slide.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} slideLinks={slideLinks} />
          ))}
        </div>
      )}
    </section>
  );
}