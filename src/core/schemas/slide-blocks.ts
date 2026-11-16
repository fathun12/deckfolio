import { z } from "zod";
import { blockSchema } from "./block";

export const saveBlocksSchema = z.object({
  projectId: z.string().uuid("Invalid request."),
  slideId: z.string().uuid("Invalid request."),
  blocks: z.array(blockSchema).max(200, "A slide can have at most 200 blocks."),
});