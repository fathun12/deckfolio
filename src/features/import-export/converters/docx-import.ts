import * as mammoth from "mammoth";
import { attrsOf, findDeep, kidsOf, parseXml, tagOf, textOf, type XNode } from "./xml";
import type {
  ImportImage,
  ImportSection,
  ImportSlide,
  ImportedDeck,
  Para,
  Run,
} from "@/core/types/import";

const IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGES = 60;

type Marks = { bold?: boolean; italic?: boolean; code?: boolean; href?: string };
type Inline = { runs: Run[]; images: { index: number; alt: string }[] };

function collectInline(nodes: XNode[], marks: Marks, out: Inline) {
  for (const node of nodes) {
    const tag = tagOf(node);
    if (tag === "#text") {
      const text = textOf(node);
      if (text) out.runs.push({ text, ...marks });
      continue;
    }
    const attrs = attrsOf(node);
    switch (tag) {
      case "strong":
      case "b":
        collectInline(kidsOf(node), { ...marks, bold: true }, out);
        break;
      case "em":
      case "i":
        collectInline(kidsOf(node), { ...marks, italic: true }, out);
        break;
      case "code":
        collectInline(kidsOf(node), { ...marks, code: true }, out);
        break;
      case "a":
        collectInline(kidsOf(node), { ...marks, href: attrs["@_href"] ?? marks.href }, out);
        break;
      case "br":
        out.runs.push({ text: "\n" });
        break;
      case "img": {
        const match = /^img:(\d+)$/.exec(attrs["@_src"] ?? "");
        if (match) out.images.push({ index: Number(match[1]), alt: attrs["@_alt"] ?? "" });
        break;
      }
      default:
        collectInline(kidsOf(node), marks, out);
    }
  }
}

function normalize(runs: Run[]): Run[] {
  const list = runs.map((run) => ({ ...run }));
  if (list.length > 0 && list[0].text !== "\n") list[0].text = list[0].text.trimStart();
  const last = list[list.length - 1];
  if (last && last.text !== "\n") last.text = last.text.trimEnd();
  const kept = list.filter((run) => run.text.length > 0);
  return kept.some((run) => run.text.trim().length > 0) ? kept : [];
}

function plain(node: XNode): string {
  const inline: Inline = { runs: [], images: [] };
  collectInline(kidsOf(node), {}, inline);
  return inline.runs
    .map((run) => run.text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function listParas(node: XNode, kind: "bullet" | "ordered", out: Para[]) {
  for (const item of kidsOf(node)) {
    if (tagOf(item) !== "li") continue;
    const kids = kidsOf(item);
    const nested = kids.filter((k) => tagOf(k) === "ul" || tagOf(k) === "ol");
    const content = kids.filter((k) => tagOf(k) !== "ul" && tagOf(k) !== "ol");
    const inline: Inline = { runs: [], images: [] };
    collectInline(content, {}, inline);
    const runs = normalize(inline.runs);
    if (runs.length > 0) out.push({ kind, runs });
    for (const child of nested) listParas(child, tagOf(child) === "ul" ? "bullet" : "ordered", out);
  }
}

export function docxHtmlToDeck(
  html: string,
  fallbackTitle: string,
  images: ImportImage[]
): ImportedDeck {
  const root = parseXml(`<root>${html}</root>`)[0];
  const nodes = root ? kidsOf(root) : [];
  const hasH2 = /<h2[\s>]/i.test(html);

  const sections: ImportSection[] = [];
  const st = {
    section: null as ImportSection | null,
    slide: null as ImportSlide | null,
    pending: [] as Para[],
  };
  let title = "";
  let subtitle = "";

  const currentSection = (): ImportSection => {
    if (!st.section) {
      st.section = { title: null, slides: [] };
      sections.push(st.section);
    }
    return st.section;
  };
  const ensureSlide = (): ImportSlide => {
    if (!st.slide) {
      st.slide = { title: "Introduction", blocks: [] };
      currentSection().slides.push(st.slide);
    }
    return st.slide;
  };
  const flush = () => {
    if (st.pending.length > 0) {
      ensureSlide().blocks.push({ kind: "text", paras: st.pending });
      st.pending = [];
    }
  };
  const startSection = (name: string) => {
    flush();
    st.section = { title: name, slides: [] };
    sections.push(st.section);
    st.slide = null;
  };
  const startSlide = (name: string) => {
    flush();
    st.slide = { title: name, blocks: [] };
    currentSection().slides.push(st.slide);
  };

  for (const node of nodes) {
    const tag = tagOf(node);
    const attrs = attrsOf(node);

    if (tag === "h1") {
      const name = plain(node);
      if (hasH2) startSection(name || "Untitled section");
      else startSlide(name || "Untitled slide");
    } else if (tag === "h2") {
      startSlide(plain(node) || "Untitled slide");
    } else if (/^h[3-6]$/.test(tag)) {
      const text = plain(node);
      if (text) {
        flush();
        const level = tag === "h3" ? 1 : tag === "h4" ? 2 : 3;
        ensureSlide().blocks.push({ kind: "heading", level, text });
      }
    } else if (tag === "p") {
      const cls = attrs["@_class"] ?? "";
      if (cls.includes("deck-title")) {
        title = plain(node);
      } else if (cls.includes("deck-subtitle")) {
        subtitle = plain(node);
      } else {
        const inline: Inline = { runs: [], images: [] };
        collectInline(kidsOf(node), {}, inline);
        const runs = normalize(inline.runs);
        if (runs.length > 0) st.pending.push({ kind: "p", runs });
        for (const image of inline.images) {
          flush();
          ensureSlide().blocks.push({ kind: "image", imageIndex: image.index, alt: image.alt });
        }
      }
    } else if (tag === "ul" || tag === "ol") {
      listParas(node, tag === "ul" ? "bullet" : "ordered", st.pending);
    } else if (tag === "table") {
      for (const row of findDeep(kidsOf(node), "tr")) {
        const cells = kidsOf(row)
          .filter((k) => tagOf(k) === "td" || tagOf(k) === "th")
          .map(plain)
          .filter(Boolean);
        if (cells.length > 0) st.pending.push({ kind: "p", runs: [{ text: cells.join(" | ") }] });
      }
    }
  }
  flush();

  return { title: title || fallbackTitle, subtitle, sections, images };
}

export async function parseDocx(buffer: Buffer, fallbackTitle: string): Promise<ImportedDeck> {
  const images: ImportImage[] = [];

  const result = await mammoth.convertToHtml(
    { buffer },
    {
      styleMap: [
        "p[style-name='Title'] => p.deck-title:fresh",
        "p[style-name='Subtitle'] => p.deck-subtitle:fresh",
      ],
      convertImage: mammoth.images.imgElement(async (image) => {
        const data = await image.read();
        if (
          !IMAGE_MIME.has(image.contentType) ||
          data.length > MAX_IMAGE_BYTES ||
          images.length >= MAX_IMAGES
        ) {
          return { src: "img:skip" };
        }
        images.push({ data: new Uint8Array(data), mime: image.contentType });
        return { src: `img:${images.length - 1}` };
      }),
    }
  );

  return docxHtmlToDeck(result.value, fallbackTitle, images);
}