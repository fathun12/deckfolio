import type { Block } from "./block";
import type { EditorResult } from "./editor";

// Kunci = id slide
export type SlideBlocks = Record<string, Block[]>;

export type SaveBlocksAction = (input: {
  projectId: string;
  slideId: string;
  blocks: Block[];
}) => Promise<EditorResult>;