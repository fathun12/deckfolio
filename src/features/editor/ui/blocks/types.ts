import type { Block } from "@/core/types/block";

export type BlockOf<T extends Block["type"]> = Extract<Block, { type: T }>;

export type EditorProps<T extends Block["type"]> = {
  block: BlockOf<T>;
  onChange: (next: Block) => void;
};

export type SlideOption = { id: string; title: string };