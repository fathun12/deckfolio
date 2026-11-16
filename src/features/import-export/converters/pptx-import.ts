import path from "node:path";
import JSZip from "jszip";
import { isSafeHref } from "@/core/schemas/url";
import { attrsOf, findDeep, kidsOf, parseXml, tagOf, textOf, type XNode } from "./xml";
import type {
  ImportBlock,
  ImportImage,
  ImportSlide,
  ImportedDeck,
  Para,
  Run,
} from "@/core/types/import";

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGES = 60;
const TITLE_TYPES = new Set(["title", "ctrTitle"]);

type Rel = { target: string; external: boolean };

function relMap(nodes: XNode[]): Map<string, Rel> {
  const map = new Map<string, Rel>();
  for (const node of findDeep(nodes, "Relationship")) {
    const a = attrsOf(node);
    if (a["@_Id"] && a["@_Target"]) {
      map.set(a["@_Id"], { target: a["@_Target"], external: a["@_TargetMode"] === "External" });
    }
  }
  return map;
}

function resolve(baseDir: string, target: string): string {
  return target.startsWith("/")
    ? target.slice(1)
    : path.posix.normalize(path.posix.join(baseDir, target));
}

function paragraphsOf(shape: XNode, rels: Map<string, Rel>): Para[] {
  const out: Para[] = [];

  for (const p of findDeep(kidsOf(shape), "a:p")) {
    const kids = kidsOf(p);
    const pPr = kids.find((k) => tagOf(k) === "a:pPr");
    const kind: Para["kind"] =
      pPr && findDeep(kidsOf(pPr), "a:buAutoNum").length > 0
        ? "ordered"
        : pPr && findDeep(kidsOf(pPr), "a:buChar").length > 0
          ? "bullet"
          : "p";

    const runs: Run[] = [];
    for (const kid of kids) {
      const tag = tagOf(kid);
      if (tag === "a:br") {
        runs.push({ text: "\n" });
      } else if (tag === "a:r" || tag === "a:fld") {
        const text = findDeep(kidsOf(kid), "a:t")
          .map((t) => kidsOf(t).map(textOf).join(""))
          .join("");
        if (!text) continue;

        const rPr = kidsOf(kid).find((k) => tagOf(k) === "a:rPr");
        const a = rPr ? attrsOf(rPr) : {};
        const run: Run = { text };
        if (a["@_b"] === "1") run.bold = true;
        if (a["@_i"] === "1") run.italic = true;

        const link = rPr ? findDeep(kidsOf(rPr), "a:hlinkClick")[0] : undefined;
        const rel = link ? rels.get(attrsOf(link)["@_r:id"] ?? "") : undefined;
        if (rel?.external && isSafeHref(rel.target)) run.href = rel.target;

        runs.push(run);
      }
    }

    if (runs.some((run) => run.text.trim().length > 0)) out.push({ kind, runs });
  }
  return out;
}

function shapesOf(nodes: XNode[]): XNode[] {
  return nodes.flatMap((node) => {
    const tag = tagOf(node);
    if (tag === "p:grpSp") return shapesOf(kidsOf(node));
    return tag === "p:sp" || tag === "p:pic" ? [node] : [];
  });
}

export async function parsePptx(buffer: Buffer, fallbackTitle: string): Promise<ImportedDeck> {
  const zip = await JSZip.loadAsync(buffer);
  const read = async (file: string) => (await zip.file(file)?.async("string")) ?? null;

  const presentation = await read("ppt/presentation.xml");
  const presentationRels = await read("ppt/_rels/presentation.xml.rels");
  if (!presentation || !presentationRels) throw new Error("Not a PowerPoint file.");

  const rels = relMap(parseXml(presentationRels));
  const slidePaths = findDeep(parseXml(presentation), "p:sldId")
    .map((node) => rels.get(attrsOf(node)["@_r:id"] ?? "")?.target)
    .filter((target): target is string => Boolean(target))
    .map((target) => resolve("ppt", target));

  const images: ImportImage[] = [];
  const imageCache = new Map<string, number | null>();

  const imageIndex = async (file: string): Promise<number | null> => {
    if (imageCache.has(file)) return imageCache.get(file) ?? null;
    let index: number | null = null;
    const mime = MIME_BY_EXT[path.posix.extname(file).slice(1).toLowerCase()];
    const entry = zip.file(file);
    if (mime && entry && images.length < MAX_IMAGES) {
      const data = await entry.async("uint8array");
      if (data.length <= MAX_IMAGE_BYTES) {
        images.push({ data, mime });
        index = images.length - 1;
      }
    }
    imageCache.set(file, index);
    return index;
  };

  const slides: ImportSlide[] = [];

  for (let i = 0; i < slidePaths.length; i++) {
    const slidePath = slidePaths[i];
    const xml = await read(slidePath);
    if (!xml) continue;

    const relsPath = `${path.posix.dirname(slidePath)}/_rels/${path.posix.basename(slidePath)}.rels`;
    const slideRels = relMap(parseXml((await read(relsPath)) ?? "<Relationships/>"));
    const tree = findDeep(parseXml(xml), "p:spTree")[0];
    const shapes = tree ? shapesOf(kidsOf(tree)) : [];

    let title = "";
    const blocks: ImportBlock[] = [];

    for (const shape of shapes) {
      if (tagOf(shape) === "p:pic") {
        const blip = findDeep(kidsOf(shape), "a:blip")[0];
        const rel = blip ? slideRels.get(attrsOf(blip)["@_r:embed"] ?? "") : undefined;
        if (!rel || rel.external) continue;
        const index = await imageIndex(resolve(path.posix.dirname(slidePath), rel.target));
        if (index === null) continue;
        const props = findDeep(kidsOf(shape), "p:cNvPr")[0];
        blocks.push({ kind: "image", imageIndex: index, alt: props ? (attrsOf(props)["@_descr"] ?? "") : "" });
        continue;
      }

      const paras = paragraphsOf(shape, slideRels);
      if (paras.length === 0) continue;

      const placeholder = findDeep(kidsOf(shape), "p:ph")[0];
      const type = placeholder ? attrsOf(placeholder)["@_type"] : undefined;

      if (type && TITLE_TYPES.has(type) && !title) {
        title = paras
          .map((para) => para.runs.map((run) => run.text).join(""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
      } else {
        blocks.push({ kind: "text", paras });
      }
    }

    // Tanpa placeholder judul: paragraf pertama dijadikan judul
    if (!title) {
      const first = blocks.find((b) => b.kind === "text");
      if (first && first.kind === "text" && first.paras.length > 0) {
        const para = first.paras.shift();
        title = (para?.runs.map((run) => run.text).join("") ?? "").trim();
        if (first.paras.length === 0) blocks.splice(blocks.indexOf(first), 1);
      }
    }

    slides.push({ title: title || `Slide ${i + 1}`, blocks });
  }

  return {
    title: fallbackTitle,
    subtitle: "",
    sections: [{ title: null, slides }],
    images,
  };
}