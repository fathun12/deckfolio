import type { BlockOf } from "@/core/types/block";

type ButtonBlockProps = {
  block: BlockOf<"button">;
  slideLinks: Record<string, string>;
};

export function ButtonBlock({ block, slideLinks }: ButtonBlockProps) {
  const target = block.slideId ? slideLinks[block.slideId] : block.href;

  // Slide tujuan sudah dihapus atau tidak ada tujuan: tampil sebagai teks biasa
  if (!target) {
    return <span className="label-mono text-muted">{block.label}</span>;
  }

  const external = target.startsWith("http");

  return (
    <a
      href={target}
      className="btn-solid"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {block.label}
      {external ? " ↗" : " →"}
    </a>
  );
}