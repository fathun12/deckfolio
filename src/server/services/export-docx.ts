import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { tiptapToParas } from "@/features/import-export/converters/richtext";
import type { ExportImage } from "./export-assets";
import type { Block } from "@/core/types/block";
import type { Para, Run } from "@/core/types/import";
import type { ViewerProject, ViewerSlide } from "@/core/types/viewer";

type Ctx = { images: Map<string, ExportImage>; orderedRefs: string[] };
type Inline = TextRun | ExternalHyperlink;

const isWeb = (value: string) => /^https?:\/\//i.test(value);

function linkOrText(text: string, href: string): Inline {
  return isWeb(href)
    ? new ExternalHyperlink({ link: href, children: [new TextRun({ text, style: "Hyperlink" })] })
    : new TextRun({ text });
}

function runsToChildren(runs: Run[]): Inline[] {
  return runs.map((run) => {
    if (run.text === "\n") return new TextRun({ break: 1 });
    const text = new TextRun({
      text: run.text,
      bold: run.bold,
      italics: run.italic,
      font: run.code ? "Courier New" : undefined,
      style: run.href && isWeb(run.href) ? "Hyperlink" : undefined,
    });
    return run.href && isWeb(run.href) ? new ExternalHyperlink({ link: run.href, children: [text] }) : text;
  });
}

function parasToDocx(paras: Para[], ctx: Ctx): Paragraph[] {
  const out: Paragraph[] = [];
  let ref: string | null = null;

  for (const para of paras) {
    const children = runsToChildren(para.runs);
    if (para.kind === "ordered") {
      if (!ref) {
        ref = `ordered-${ctx.orderedRefs.length}`;
        ctx.orderedRefs.push(ref);
      }
      out.push(new Paragraph({ children, numbering: { reference: ref, level: 0 } }));
    } else {
      ref = null;
      out.push(
        new Paragraph(
          para.kind === "bullet"
            ? { children, bullet: { level: 0 } }
            : { children, spacing: { after: 120 } }
        )
      );
    }
  }
  return out;
}

function imageParagraphs(url: string, alt: string, caption: string | undefined, ctx: Ctx): Paragraph[] {
  const image = ctx.images.get(url);
  if (!image) {
    return [new Paragraph({ children: [linkOrText(alt || url, url)], spacing: { after: 120 } })];
  }

  const scale = Math.min(1, 600 / image.width);
  const out = [
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new ImageRun({
          type: image.mime === "image/png" ? "png" : image.mime === "image/gif" ? "gif" : "jpg",
          data: image.data,
          transformation: {
            width: Math.round(image.width * scale),
            height: Math.round(image.height * scale),
          },
        }),
      ],
    }),
  ];
  if (caption) {
    out.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({ text: caption, italics: true, size: 20 })],
      })
    );
  }
  return out;
}

function blockToDocx(block: Block, ctx: Ctx): Paragraph[] {
  switch (block.type) {
    case "heading": {
      const heading =
        block.level === 1
          ? HeadingLevel.HEADING_3
          : block.level === 2
            ? HeadingLevel.HEADING_4
            : HeadingLevel.HEADING_5;
      return [new Paragraph({ heading, text: block.text })];
    }
    case "text":
      return parasToDocx(tiptapToParas(block.content), ctx);
    case "image":
      return imageParagraphs(block.url, block.alt, block.caption, ctx);
    case "gallery":
      return block.images.flatMap((image) => imageParagraphs(image.url, image.alt, image.caption, ctx));
    case "quote": {
      const out = [
        new Paragraph({
          indent: { left: 540 },
          spacing: { after: 80 },
          children: [new TextRun({ text: block.text, italics: true })],
        }),
      ];
      if (block.cite) {
        out.push(
          new Paragraph({
            indent: { left: 540 },
            spacing: { after: 160 },
            children: [new TextRun({ text: `— ${block.cite}`, size: 20 })],
          })
        );
      }
      return out;
    }
    case "stat":
      return block.items.map(
        (item) =>
          new Paragraph({
            children: [
              new TextRun({ text: `${item.label}: `, bold: true }),
              new TextRun({ text: item.value }),
            ],
          })
      );
    case "reasoning":
      return [
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({ text: block.title, bold: true })],
        }),
        new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: block.text })] }),
      ];
    case "divider":
      return [
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 1 } },
        }),
      ];
    case "button":
      return [
        new Paragraph({
          children: [block.href ? linkOrText(block.label, block.href) : new TextRun({ text: block.label })],
        }),
      ];
    case "code":
      return block.code.split("\n").map(
        (line) =>
          new Paragraph({
            children: [new TextRun({ text: line, font: "Courier New", size: 20 })],
          })
      );
    case "bento":
      return block.cells.flatMap((cell) => {
        const out: Paragraph[] = [];
        if (cell.title) {
          out.push(new Paragraph({ children: [new TextRun({ text: cell.title, bold: true })] }));
        }
        if (cell.text) out.push(new Paragraph({ children: [new TextRun({ text: cell.text })] }));
        if (cell.imageUrl) out.push(...imageParagraphs(cell.imageUrl, cell.alt, undefined, ctx));
        return out;
      });
    case "embed":
      return [new Paragraph({ children: [linkOrText(block.title || block.url, block.url)] })];
    default:
      return [];
  }
}

function slideToDocx(slide: ViewerSlide, ctx: Ctx): Paragraph[] {
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_2, text: slide.title }),
    ...slide.blocks.flatMap((block) => blockToDocx(block, ctx)),
  ];
}

export async function buildDocx(
  project: ViewerProject,
  images: Map<string, ExportImage>
): Promise<Buffer> {
  const ctx: Ctx = { images, orderedRefs: [] };
  const children: Paragraph[] = [new Paragraph({ heading: HeadingLevel.TITLE, text: project.title })];

  if (project.subtitle) {
    children.push(new Paragraph({ style: "Subtitle", text: project.subtitle }));
  }
  if (project.coverUrl) children.push(...imageParagraphs(project.coverUrl, "", undefined, ctx));

  for (const entry of project.entries) {
    if (entry.kind === "section") {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, text: entry.title }));
      entry.slides.forEach((slide) => children.push(...slideToDocx(slide, ctx)));
    } else {
      children.push(...slideToDocx(entry.slide, ctx));
    }
  }

  const doc = new Document({
    title: project.title,
    numbering: {
      config: ctx.orderedRefs.map((reference) => ({
        reference,
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START },
        ],
      })),
    },
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}