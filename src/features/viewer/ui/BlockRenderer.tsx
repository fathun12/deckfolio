import { BentoBlock } from "./blocks/BentoBlock";
import { ButtonBlock } from "./blocks/ButtonBlock";
import { CodeBlock } from "./blocks/CodeBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { EmbedBlock } from "./blocks/EmbedBlock";
import { GalleryBlock } from "./blocks/GalleryBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { QuoteBlock } from "./blocks/QuoteBlock";
import { ReasoningBlock } from "./blocks/ReasoningBlock";
import { StatBlock } from "./blocks/StatBlock";
import { TextBlock } from "./blocks/TextBlock";
import type { Block } from "@/core/types/block";

type BlockRendererProps = {
  block: Block;
  slideLinks: Record<string, string>;
};

export function BlockRenderer({ block, slideLinks }: BlockRendererProps) {
  switch (block.type) {
    case "heading":
      return <HeadingBlock block={block} />;
    case "text":
      return <TextBlock block={block} slideLinks={slideLinks} />;
    case "image":
      return <ImageBlock block={block} />;
    case "gallery":
      return <GalleryBlock block={block} />;
    case "quote":
      return <QuoteBlock block={block} />;
    case "stat":
      return <StatBlock block={block} />;
    case "reasoning":
      return <ReasoningBlock block={block} />;
    case "divider":
      return <DividerBlock />;
    case "button":
      return <ButtonBlock block={block} slideLinks={slideLinks} />;
    case "code":
      return <CodeBlock block={block} />;
    case "bento":
      return <BentoBlock block={block} />;
    case "embed":
      return <EmbedBlock block={block} />;
    default:
      return null;
  }
}