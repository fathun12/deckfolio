import type { BlockOf } from "@/core/types/block";

const STYLES = {
  1: "text-3xl font-bold",
  2: "text-2xl font-semibold",
  3: "text-lg font-semibold",
} as const;

export function HeadingBlock({ block }: { block: BlockOf<"heading"> }) {
  const Tag = block.level === 1 ? "h3" : block.level === 2 ? "h4" : "h5";
  return <Tag className={STYLES[block.level]}>{block.text}</Tag>;
}