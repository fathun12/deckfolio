import type { Block } from "@/core/types/block";

export type BlockType = Block["type"];

export const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Heading",
  text: "Text",
  image: "Image",
  gallery: "Gallery",
  quote: "Quote",
  stat: "Stats",
  reasoning: "Design reasoning",
  divider: "Divider",
  button: "Button",
  code: "Code",
  bento: "Bento grid",
  embed: "Embed",
};

export const BLOCK_TYPES = Object.keys(BLOCK_LABELS) as BlockType[];

export function createBlock(type: BlockType): Block {
  const id = crypto.randomUUID();

  switch (type) {
    case "heading":
      return { id, type, level: 2, text: "" };
    case "text":
      return { id, type, content: { type: "doc", content: [{ type: "paragraph" }] } };
    case "image":
      return { id, type, url: "", alt: "" };
    case "gallery":
      return { id, type, images: [] };
    case "quote":
      return { id, type, text: "" };
    case "stat":
      return { id, type, items: [{ label: "", value: "" }] };
    case "reasoning":
      return { id, type, title: "Design reasoning", text: "" };
    case "divider":
      return { id, type };
    case "button":
      return { id, type, label: "Button" };
    case "code":
      return { id, type, code: "" };
    case "bento":
      return { id, type, cells: [{ title: "", text: "", alt: "", span: 1 }] };
    case "embed":
      return { id, type, url: "", title: "", ratio: "16:9" };
  }
}