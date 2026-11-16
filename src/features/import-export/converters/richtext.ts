import { isSafeHref } from "@/core/schemas/url";
import type { Para, Run } from "@/core/types/import";

type TNode = {
  type?: string;
  text?: string;
  marks?: { type?: string; attrs?: { href?: unknown } }[];
  content?: TNode[];
};

// ---------- Tiptap JSON -> paragraf (untuk export) ----------

function inlineRuns(nodes: TNode[] | undefined): Run[] {
  const runs: Run[] = [];
  for (const node of nodes ?? []) {
    if (node.type === "hardBreak") {
      runs.push({ text: "\n" });
    } else if (node.type === "text" && node.text) {
      const run: Run = { text: node.text };
      for (const mark of node.marks ?? []) {
        if (mark.type === "bold") run.bold = true;
        if (mark.type === "italic") run.italic = true;
        if (mark.type === "code") run.code = true;
        if (mark.type === "link" && typeof mark.attrs?.href === "string") {
          run.href = mark.attrs.href;
        }
      }
      runs.push(run);
    }
  }
  return runs;
}

export function tiptapToParas(doc: unknown): Para[] {
  const out: Para[] = [];

  const walk = (nodes: TNode[] | undefined, kind: Para["kind"]) => {
    for (const node of nodes ?? []) {
      switch (node.type) {
        case "paragraph":
          out.push({ kind, runs: inlineRuns(node.content) });
          break;
        case "heading":
          out.push({
            kind: "p",
            runs: inlineRuns(node.content).map((run) => ({ ...run, bold: true })),
          });
          break;
        case "bulletList":
        case "orderedList":
          for (const item of node.content ?? []) {
            walk(item.content, node.type === "bulletList" ? "bullet" : "ordered");
          }
          break;
        default:
          walk(node.content, kind);
      }
    }
  };

  const root = doc as TNode | null;
  walk(root?.content, "p");
  return out.filter((para) => para.runs.length > 0);
}

// ---------- paragraf -> Tiptap JSON (untuk import) ----------

function runsToNodes(runs: Run[]): unknown[] {
  const nodes: unknown[] = [];
  for (const run of runs) {
    const parts = run.text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) nodes.push({ type: "hardBreak" });
      if (!part) return;
      const marks: unknown[] = [];
      if (run.bold) marks.push({ type: "bold" });
      if (run.italic) marks.push({ type: "italic" });
      if (run.code) marks.push({ type: "code" });
      if (run.href && isSafeHref(run.href)) {
        marks.push({ type: "link", attrs: { href: run.href } });
      }
      nodes.push(marks.length > 0 ? { type: "text", text: part, marks } : { type: "text", text: part });
    });
  }
  return nodes;
}

export function parasToTiptap(paras: Para[]): unknown {
  const content: unknown[] = [];
  const state: { type: string; items: unknown[] } | null[] = [];
  let open: { type: string; items: unknown[] } | null = null;

  for (const para of paras) {
    const inline = runsToNodes(para.runs);
    const paragraph = inline.length > 0 ? { type: "paragraph", content: inline } : { type: "paragraph" };

    if (para.kind === "p") {
      if (open) content.push({ type: open.type, content: open.items });
      open = null;
      content.push(paragraph);
      continue;
    }

    const type = para.kind === "bullet" ? "bulletList" : "orderedList";
    if (open && open.type !== type) {
      content.push({ type: open.type, content: open.items });
      open = null;
    }
    if (!open) open = { type, items: [] };
    open.items.push({ type: "listItem", content: [paragraph] });
  }

  if (open) content.push({ type: open.type, content: open.items });
  void state;
  return { type: "doc", content: content.length > 0 ? content : [{ type: "paragraph" }] };
}