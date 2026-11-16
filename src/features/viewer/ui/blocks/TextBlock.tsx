import { RichText } from "../RichText";
import type { BlockOf } from "@/core/types/block";

type TextBlockProps = {
  block: BlockOf<"text">;
  slideLinks: Record<string, string>;
};

export function TextBlock({ block, slideLinks }: TextBlockProps) {
  return <RichText content={block.content} slideLinks={slideLinks} />;
}