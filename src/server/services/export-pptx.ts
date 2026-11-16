import PptxGenJS from "pptxgenjs";
import { tiptapToParas } from "@/features/import-export/converters/richtext";
import type { ExportImage } from "./export-assets";
import type { Block } from "@/core/types/block";
import type { Para } from "@/core/types/import";
import type { ViewerProject, ViewerSlide } from "@/core/types/viewer";

// Warna file PPTX (bukan bagian dari desain web)
const PAPER = "F7F5F0";
const INK = "0A0A0A";
const ACCENT = "C2410C";
const MUTED = "6B6B66";
const SANS = "Arial";
const MONO = "Courier New";

type Item = PptxGenJS.TextProps;
type Pic = { image: ExportImage; alt: string; caption?: string };

const isWeb = (value: string) => /^https?:\/\//i.test(value);

function paraItems(paras: Para[], size: number): Item[] {
  const items: Item[] = [];
  for (const para of paras) {
    const runs = para.runs.length > 0 ? para.runs : [{ text: " " }];
    runs.forEach((run, index) => {
      const options: PptxGenJS.TextPropsOptions = {
        fontSize: size,
        color: INK,
        bold: run.bold,
        italic: run.italic,
        fontFace: run.code ? MONO : SANS,
        hyperlink: run.href && isWeb(run.href) ? { url: run.href } : undefined,
        breakLine: index === runs.length - 1,
        paraSpaceAfter: 6,
      };
      if (index === 0 && para.kind === "bullet") options.bullet = true;
      if (index === 0 && para.kind === "ordered") options.bullet = { type: "number" };
      items.push({ text: run.text === "\n" ? " " : run.text, options });
    });
  }
  return items;
}

function line(text: string, options: PptxGenJS.TextPropsOptions = {}): Item {
  return { text, options: { fontSize: 16, color: INK, fontFace: SANS, breakLine: true, paraSpaceAfter: 6, ...options } };
}

function collect(blocks: Block[], images: Map<string, ExportImage>) {
  const items: Item[] = [];
  const pics: Pic[] = [];

  const addPic = (url: string, alt: string, caption?: string) => {
    const image = images.get(url);
    if (image) pics.push({ image, alt, caption });
    else items.push(line(alt || url, { hyperlink: isWeb(url) ? { url } : undefined }));
  };

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        items.push(line(block.text, { bold: true, fontSize: block.level === 1 ? 24 : block.level === 2 ? 20 : 18 }));
        break;
      case "text":
        items.push(...paraItems(tiptapToParas(block.content), 16));
        break;
      case "image":
        addPic(block.url, block.alt, block.caption);
        break;
      case "gallery":
        block.images.forEach((image) => addPic(image.url, image.alt, image.caption));
        break;
      case "quote":
        items.push(line(block.text, { italic: true }));
        if (block.cite) items.push(line(`— ${block.cite}`, { fontSize: 13, color: MUTED }));
        break;
      case "stat":
        block.items.forEach((item) => {
          items.push({ text: `${item.label}: `, options: { bold: true, fontSize: 16, color: INK, fontFace: SANS } });
          items.push(line(item.value));
        });
        break;
      case "reasoning":
        items.push(line(block.title, { bold: true, color: ACCENT }));
        items.push(line(block.text));
        break;
      case "divider":
        items.push(line(" ", { fontSize: 8 }));
        break;
      case "button":
        items.push(
          line(block.label, { bold: true, color: ACCENT, hyperlink: block.href && isWeb(block.href) ? { url: block.href } : undefined })
        );
        break;
      case "code":
        block.code.split("\n").forEach((codeLine) => items.push(line(codeLine || " ", { fontFace: MONO, fontSize: 12 })));
        break;
      case "bento":
        block.cells.forEach((cell) => {
          if (cell.title) items.push(line(cell.title, { bold: true }));
          if (cell.text) items.push(line(cell.text));
          if (cell.imageUrl) addPic(cell.imageUrl, cell.alt);
        });
        break;
      case "embed":
        items.push(line(block.title || block.url, { color: ACCENT, hyperlink: isWeb(block.url) ? { url: block.url } : undefined }));
        break;
      default:
        break;
    }
  }
  return { items, pics };
}

function placeImage(slide: PptxGenJS.Slide, pic: Pic, box: { x: number; y: number; w: number; h: number }) {
  const ratio = Math.min(box.w / pic.image.width, box.h / pic.image.height);
  const w = pic.image.width * ratio;
  const h = pic.image.height * ratio;
  slide.addImage({
    data: `${pic.image.mime};base64,${Buffer.from(pic.image.data).toString("base64")}`,
    x: box.x + (box.w - w) / 2,
    y: box.y,
    w,
    h,
    altText: pic.alt || undefined,
  });
}

export async function buildPptx(
  project: ViewerProject,
  images: Map<string, ExportImage>
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = project.title;

  const dark = (label: string, title: string, extra?: string) => {
    const slide = pptx.addSlide();
    slide.background = { color: INK };
    slide.addText(label, { x: 0.7, y: 1.8, w: 11.9, h: 0.4, fontSize: 12, fontFace: MONO, color: ACCENT, charSpacing: 3 });
    slide.addText(title, { x: 0.7, y: 2.3, w: 11.9, h: 1.8, fontSize: 44, bold: true, fontFace: SANS, color: PAPER, valign: "top", fit: "shrink" });
    if (extra) {
      slide.addText(extra, { x: 0.7, y: 4.3, w: 11.9, h: 1.2, fontSize: 18, fontFace: SANS, color: PAPER, valign: "top", fit: "shrink" });
    }
    return slide;
  };

  const frame = (title: string, label: string) => {
    const slide = pptx.addSlide();
    slide.background = { color: PAPER };
    slide.addText(label, { x: 0.7, y: 0.35, w: 11.9, h: 0.3, fontSize: 11, fontFace: MONO, color: ACCENT, charSpacing: 2 });
    slide.addText(title, { x: 0.7, y: 0.7, w: 11.9, h: 0.9, fontSize: 30, bold: true, fontFace: SANS, color: INK, valign: "top", fit: "shrink" });
    slide.addShape(pptx.ShapeType.rect, { x: 0.7, y: 1.65, w: 11.9, h: 0.02, fill: { color: INK }, line: { type: "none" } });
    return slide;
  };

  const content = (slide: ViewerSlide, parent?: string) => {
    const label = parent ? `${slide.number} / ${parent}` : slide.number;
    const { items, pics } = collect(slide.blocks, images);
    const page = frame(slide.title, label);

    const first = pics[0];
    if (items.length > 0) {
      page.addText(items, {
        x: 0.7, y: 1.9, w: first ? 6.6 : 11.9, h: 5.0,
        valign: "top", margin: 0, fit: "shrink",
      });
    }
    if (first) {
      placeImage(page, first, { x: items.length > 0 ? 7.6 : 0.7, y: 1.9, w: items.length > 0 ? 5.0 : 11.9, h: 4.8 });
      if (first.caption) {
        page.addText(first.caption, { x: 7.6, y: 6.8, w: 5.0, h: 0.4, fontSize: 11, italic: true, fontFace: SANS, color: MUTED });
      }
    }

    // Gambar tambahan: satu slide per gambar
    pics.slice(1).forEach((pic) => {
      const extra = frame(`${slide.title} (cont.)`, label);
      placeImage(extra, pic, { x: 0.7, y: 1.9, w: 11.9, h: 4.8 });
      if (pic.caption) {
        extra.addText(pic.caption, { x: 0.7, y: 6.8, w: 11.9, h: 0.4, fontSize: 11, italic: true, fontFace: SANS, color: MUTED });
      }
    });
  };

  dark("PROJECT", project.title, [project.subtitle, project.stats.join(" / ")].filter(Boolean).join("\n"));

  for (const entry of project.entries) {
    if (entry.kind === "section") {
      dark(`${entry.number} / SECTION`, entry.title);
      entry.slides.forEach((slide) => content(slide, entry.title));
    } else {
      content(entry.slide);
    }
  }

  const output = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(output as unknown as ArrayBuffer);
}