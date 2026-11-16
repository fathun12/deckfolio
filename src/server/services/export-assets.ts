import { imageSize } from "image-size";
import type { ViewerProject } from "@/core/types/viewer";

export type ExportImage = {
  data: Uint8Array;
  mime: "image/png" | "image/jpeg" | "image/gif";
  width: number;
  height: number;
};

const MIMES = new Set(["image/png", "image/jpeg", "image/gif"]);
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_URLS = 80;

// Hanya gambar dari Storage Supabase milik proyek ini yang diunduh server
function allowedPrefix(): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base.replace(/\/$/, "")}/storage/v1/object/public/` : null;
}

async function download(url: string): Promise<ExportImage | null> {
  const prefix = allowedPrefix();
  if (!prefix || !url.startsWith(prefix)) return null;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;

    const mime = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
    if (!MIMES.has(mime)) return null;

    const data = new Uint8Array(await res.arrayBuffer());
    if (data.length > MAX_BYTES) return null;

    const { width, height } = imageSize(data);
    if (!width || !height) return null;

    return { data, mime: mime as ExportImage["mime"], width, height };
  } catch {
    return null;
  }
}

export function collectImageUrls(project: ViewerProject): string[] {
  const urls = new Set<string>();
  if (project.coverUrl) urls.add(project.coverUrl);

  for (const entry of project.entries) {
    const slides = entry.kind === "slide" ? [entry.slide] : entry.slides;
    for (const slide of slides) {
      for (const block of slide.blocks) {
        if (block.type === "image") urls.add(block.url);
        if (block.type === "gallery") block.images.forEach((image) => urls.add(image.url));
        if (block.type === "bento") {
          block.cells.forEach((cell) => cell.imageUrl && urls.add(cell.imageUrl));
        }
      }
    }
  }
  return [...urls].slice(0, MAX_URLS);
}

export async function preloadImages(urls: string[]): Promise<Map<string, ExportImage>> {
  const results = await Promise.all(urls.map(async (url) => [url, await download(url)] as const));
  return new Map(results.flatMap(([url, image]) => (image ? [[url, image] as const] : [])));
}