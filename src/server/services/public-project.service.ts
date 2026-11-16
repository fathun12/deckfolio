import { cacheLife, cacheTag } from "next/cache";
import {
  getPublicProjectRecord,
  listPublicProjects,
  type PublicProjectRecord,
  type SlideRow,
} from "@/server/repositories/public-projects";
import { blockSchema } from "@/core/schemas/block";
import type { Block } from "@/core/types/block";
import type { Project } from "@/core/types/project";
import type {
  TocItem,
  ViewerEntry,
  ViewerProject,
  ViewerSlide,
} from "@/core/types/viewer";

const pad = (n: number) => String(n).padStart(2, "0");

// Block yang tidak valid dibuang, halaman tidak crash
function parseBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) return [];
  const out: Block[] = [];
  for (const item of value) {
    const result = blockSchema.safeParse(item);
    if (result.success) out.push(result.data);
  }
  return out;
}

export function buildViewerProject(record: PublicProjectRecord): ViewerProject {
  const { project, sections, slides } = record;

  const sectionIds = new Set(sections.map((s) => s.id));
  const loose: SlideRow[] = [];
  const grouped = new Map<string, SlideRow[]>();

  for (const row of slides) {
    if (row.section_id && sectionIds.has(row.section_id)) {
      const list = grouped.get(row.section_id) ?? [];
      list.push(row);
      grouped.set(row.section_id, list);
    } else {
      loose.push(row);
    }
  }

  const entries: ViewerEntry[] = [];
  const toc: TocItem[] = [];
  const slideLinks: Record<string, string> = {};
  let slideCount = 0;

  const makeSlide = (row: SlideRow, number: string): ViewerSlide => {
    slideCount += 1;
    slideLinks[row.id] = `#slide-${row.id}`;
    return {
      id: row.id,
      anchorId: `slide-${row.id}`,
      number,
      title: row.title,
      blocks: parseBlocks(row.blocks),
    };
  };

  let n = 0;

  // Slide tanpa section tampil lebih dulu
  for (const row of loose) {
    n += 1;
    const slide = makeSlide(row, pad(n));
    entries.push({ kind: "slide", slide });
    toc.push({ id: slide.anchorId, number: slide.number, label: slide.title, children: [] });
  }

  for (const section of sections) {
    const rows = grouped.get(section.id);
    if (!rows || rows.length === 0) continue;

    n += 1;
    const number = pad(n);
    const children = rows.map((row, i) => makeSlide(row, `${number}.${pad(i + 1)}`));
    const anchorId = `section-${section.id}`;

    entries.push({
      kind: "section",
      id: section.id,
      anchorId,
      number,
      title: section.title,
      slides: children,
    });
    toc.push({
      id: anchorId,
      number,
      label: section.title,
      children: children.map((s) => ({
        id: s.anchorId,
        number: s.number,
        label: s.title,
        children: [],
      })),
    });
  }

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    subtitle: project.subtitle,
    coverUrl: project.coverUrl,
    stats: project.stats,
    entries,
    toc,
    slideLinks,
    slideCount,
  };
}

// ---- Cache: dibersihkan oleh updateTag("projects") di server action ----

export async function getPublicProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("projects");

  return listPublicProjects();
}

async function loadPublicProject(slug: string): Promise<ViewerProject | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("projects", `project:${slug}`);

  const record = await getPublicProjectRecord(slug);
  return record ? buildViewerProject(record) : null;
}

export async function getPublicProject(slug: string): Promise<ViewerProject | null> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 80) return null;
  return loadPublicProject(slug);
}