"use client";

import { BentoEditor } from "./blocks/BentoEditor";
import { ButtonEditor, StatEditor } from "./blocks/DataEditors";
import { EmbedEditor } from "./blocks/EmbedEditor";
import { GalleryEditor, ImageEditor } from "./blocks/ImageEditors";
import { RichTextEditor } from "./blocks/RichTextEditor";
import {
  CodeEditor,
  DividerEditor,
  HeadingEditor,
  QuoteEditor,
  ReasoningEditor,
} from "./blocks/TextualEditors";
import type { SlideOption } from "./blocks/types";
import type { Block } from "@/core/types/block";

type BlockEditorProps = {
  block: Block;
  slideOptions: SlideOption[];
  onChange: (next: Block) => void;
};

export function BlockEditor({ block, slideOptions, onChange }: BlockEditorProps) {
  switch (block.type) {
    case "heading":
      return <HeadingEditor block={block} onChange={onChange} />;
    case "text":
      return <RichTextEditor block={block} onChange={onChange} />;
    case "image":
      return <ImageEditor block={block} onChange={onChange} />;
    case "gallery":
      return <GalleryEditor block={block} onChange={onChange} />;
    case "quote":
      return <QuoteEditor block={block} onChange={onChange} />;
    case "stat":
      return <StatEditor block={block} onChange={onChange} />;
    case "reasoning":
      return <ReasoningEditor block={block} onChange={onChange} />;
    case "divider":
      return <DividerEditor />;
    case "button":
      return <ButtonEditor block={block} onChange={onChange} slideOptions={slideOptions} />;
    case "code":
      return <CodeEditor block={block} onChange={onChange} />;
    case "bento":
      return <BentoEditor block={block} onChange={onChange} />;
    case "embed":
      return <EmbedEditor block={block} onChange={onChange} />;
    default:
      return null;
  }
}