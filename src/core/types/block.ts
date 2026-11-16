import type { z } from "zod";
import type { blockSchema } from "@/core/schemas/block";

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];
export type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;