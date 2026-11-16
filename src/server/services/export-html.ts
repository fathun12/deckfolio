import { isSafeHref } from "@/core/schemas/url";
import { flattenSlides } from "@/features/presenter/logic/flattenSlides";
import { HTML_SCRIPT } from "./export-html-script";
import { HTML_STYLE } from "./export-html-style";
import type { ExportImage } from "./export-assets";
import type { Block } from "@/core/types/block";
import type { TocItem, ViewerProject, ViewerSlide } from "@/core/types/viewer";

type Links = Record<string, string>;
type Ctx = { images: Map<string, ExportImage>; links: Links };

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const pad = (n: number) => String(n).padStart(2, "0");

// ---------- Gambar (ditanam sebagai data base64) ----------

function img(ctx: Ctx, url: string, alt: string, cls?: string): string {
  const image = ctx.images.get(url);
  if (!image) {
    return `<p class="note mono">Image not included in the offline file${alt ? `: ${esc(alt)}` : ""}</p>`;
  }
  const b64 = Buffer.from(image.data).toString("base64");
  return `<img src="data:${image.mime};base64,${b64}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ""}>`;
}

// ---------- Rich text (JSON Tiptap) ----------

type Mark = { type?: string; attrs?: Record<string, unknown> };
type TNode = {
  type?: string;
  text?: string;
  content?: unknown[];
  attrs?: Record<string, unknown>;
  marks?: Mark[];
};

const isNode = (value: unknown): value is TNode => typeof value === "object" && value !== null;

function withMarks(text: string, marks: Mark[] | undefined, links: Links): string {
  let out = esc(text);
  for (const mark of marks ?? []) {
    if (mark.type === "bold") out = `<strong>${out}</strong>`;
    else if (mark.type === "italic") out = `<em>${out}</em>`;
    else if (mark.type === "code") out = `<code>${out}</code>`;
    else if (mark.type === "link") {
      const slideId = mark.attrs?.slideId;
      const href = mark.attrs?.href;
      const target =
        typeof slideId === "string"
          ? links[slideId]
          : typeof href === "string" && isSafeHref(href)
            ? href
            : undefined;
      if (target) {
        const external = target.startsWith("http");
        out = `<a class="link" href="${esc(target)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${out}</a>`;
      }
    }
  }
  return out;
}

function childrenHtml(node: TNode, links: Links): string {
  return (node.content ?? [])
    .filter(isNode)
    .map((child) => nodeHtml(child, links))
    .join("");
}

function nodeHtml(node: TNode, links: Links): string {
  switch (node.type) {
    case "doc":
      return childrenHtml(node, links);
    case "paragraph":
      return `<p>${childrenHtml(node, links)}</p>`;
    case "heading": {
      const level = node.attrs?.level;
      const tag = level === 1 ? "h3" : level === 2 ? "h4" : "h5";
      const cls = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      return `<${tag} class="${cls}">${childrenHtml(node, links)}</${tag}>`;
    }
    case "bulletList":
      return `<ul>${childrenHtml(node, links)}</ul>`;
    case "orderedList":
      return `<ol>${childrenHtml(node, links)}</ol>`;
    case "listItem":
      return `<li>${childrenHtml(node, links)}</li>`;
    case "hardBreak":
      return "<br>";
    case "text":
      return withMarks(typeof node.text === "string" ? node.text : "", node.marks, links);
    default:
      return "";
  }
}

// ---------- Block ----------

function blockHtml(b: Block, ctx: Ctx): string {
  switch (b.type) {
    case "heading": {
      const tag = b.level === 1 ? "h3" : b.level === 2 ? "h4" : "h5";
      return `<${tag} class="h${b.level}">${esc(b.text)}</${tag}>`;
    }
    case "text":
      return isNode(b.content)
        ? `<div class="prose">${nodeHtml(b.content, ctx.links)}</div>`
        : "";
    case "image":
      return `<figure>${img(ctx, b.url, b.alt)}${
        b.caption ? `<figcaption class="mono muted">${esc(b.caption)}</figcaption>` : ""
      }</figure>`;
    case "gallery": {
      if (b.images.length === 0) return "";
      const items = b.images
        .map(
          (image) =>
            `<figure>${img(ctx, image.url, image.alt)}${
              image.caption ? `<figcaption class="mono muted">${esc(image.caption)}</figcaption>` : ""
            }</figure>`
        )
        .join("");
      return `<div><div class="gal-tools"><button type="button" class="btn" data-gal="-1" aria-label="Previous images">&larr;</button><button type="button" class="btn" data-gal="1" aria-label="Next images">&rarr;</button></div><div class="gal" role="region" aria-label="Image gallery" tabindex="0">${items}</div></div>`;
    }
    case "quote":
      return `<blockquote><p class="q">${esc(b.text)}</p>${
        b.cite ? `<footer class="mono muted">${esc(b.cite)}</footer>` : ""
      }</blockquote>`;
    case "stat": {
      if (b.items.length === 0) return "";
      const items = b.items
        .map((item) => `<div><dt class="mono muted">${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`)
        .join("");
      return `<dl class="stats">${items}</dl>`;
    }
    case "reasoning":
      return `<aside><p class="mono accent">${esc(b.title)}</p><p>${esc(b.text)}</p></aside>`;
    case "divider":
      return "<hr>";
    case "button": {
      const target = b.slideId
        ? ctx.links[b.slideId]
        : b.href && isSafeHref(b.href)
          ? b.href
          : undefined;
      if (!target) return `<span class="mono muted">${esc(b.label)}</span>`;
      const external = target.startsWith("http");
      return `<a class="btn-solid" href="${esc(target)}"${
        external ? ' target="_blank" rel="noopener noreferrer"' : ""
      }>${esc(b.label)}${external ? " &nearr;" : " &rarr;"}</a>`;
    }
    case "code":
      return `<div>${
        b.language ? `<p class="mono muted" style="margin-bottom:.5rem">${esc(b.language)}</p>` : ""
      }<pre><code>${esc(b.code)}</code></pre></div>`;
    case "bento": {
      const cells = b.cells
        .map(
          (cell, i) =>
            `<div class="cell${cell.span === 2 ? " span2" : ""}">${
              cell.imageUrl ? img(ctx, cell.imageUrl, cell.alt) : ""
            }<p class="mono muted">${pad(i + 1)}</p>${
              cell.title ? `<h3>${esc(cell.title)}</h3>` : ""
            }${cell.text ? `<p class="text">${esc(cell.text)}</p>` : ""}</div>`
        )
        .join("");
      return `<div class="bento">${cells}</div>`;
    }
    case "embed": {
      const label = esc(b.title || b.url);
      const link = isSafeHref(b.url)
        ? `<a class="link" href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">${label} &nearr;</a>`
        : `<span>${label}</span>`;
      return `<div class="embed"><p class="mono muted">Embedded content (needs internet)</p>${link}</div>`;
    }
    default:
      return "";
  }
}

// ---------- Slide, cover, TOC ----------

function slideHtml(slide: ViewerSlide, sectionLabel: string | null, ctx: Ctx): string {
  const content = slide.blocks.map((block) => blockHtml(block, ctx)).join("");
  return `<section class="slide" id="${esc(slide.anchorId)}" aria-label="${esc(slide.title)}">${
    sectionLabel ? `<p class="mono muted">${esc(sectionLabel)}</p>` : ""
  }<p class="mono accent mt">${esc(slide.number)}</p><h2 class="title">${esc(slide.title)}</h2>${
    content ? `<div class="content">${content}</div>` : ""
  }</section>`;
}

function coverHtml(project: ViewerProject, ctx: Ctx): string {
  const stats = project.stats.length
    ? `<p class="mono cover-stats">${project.stats.map(esc).join(" / ")}</p>`
    : "";
  const cover = project.coverUrl ? img(ctx, project.coverUrl, "", "cover-img") : "";
  return `<section class="slide" id="cover" aria-label="${esc(project.title)}"><div class="panel"><p class="mono">Project</p><h1 class="cover-title">${esc(project.title)}</h1>${
    project.subtitle ? `<p class="cover-sub">${esc(project.subtitle)}</p>` : ""
  }${stats}</div>${cover}</section>`;
}

function tocLink(number: string, label: string, target: string, ids: string[]): string {
  return `<a href="#${esc(target)}" data-ids="${esc(ids.join(" "))}"><span class="mono">${esc(number)}</span><span>${esc(label)}</span></a>`;
}

function tocHtml(items: TocItem[], slideAnchors: Set<string>): string {
  const rows = items
    .map((item) => {
      const first = item.children[0];
      let head: string;
      if (first) {
        head = tocLink(item.number, item.label, first.id, item.children.map((c) => c.id));
      } else if (slideAnchors.has(item.id)) {
        head = tocLink(item.number, item.label, item.id, [item.id]);
      } else {
        head = `<span class="plain"><span class="mono">${esc(item.number)}</span><span>${esc(item.label)}</span></span>`;
      }
      const sub = item.children.length
        ? `<ol>${item.children
            .map((c) => `<li>${tocLink(c.number, c.label, c.id, [c.id])}</li>`)
            .join("")}</ol>`
        : "";
      return `<li>${head}${sub}</li>`;
    })
    .join("");

  const cover = `<li>${tocLink("00", "Cover", "cover", ["cover"])}</li>`;
  return `<ol>${cover}${rows}</ol>`;
}

// ---------- Dokumen utama ----------

export function buildHtml(project: ViewerProject, images: Map<string, ExportImage>): Buffer {
  const ctx: Ctx = { images, links: project.slideLinks };
  const items = flattenSlides(project);
  const slideAnchors = new Set(items.map((item) => item.slide.anchorId));

  const slides = items.map((item) => slideHtml(item.slide, item.sectionLabel, ctx)).join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(project.title)}</title>
<style>${HTML_STYLE}</style>
<noscript><style>.slide{display:flex!important;min-height:100vh}.bar,.progress{display:none}</style></noscript>
</head>
<body>
<div class="progress"><i id="progress"></i></div>
<div class="edge" id="edge"></div>
<main class="stage" id="stage">
${coverHtml(project, ctx)}
${slides}
</main>
<div class="toc" id="toc">
<button type="button" class="scrim" id="toc-scrim" aria-label="Close contents"></button>
<nav aria-label="Contents">
<div class="toc-head"><p class="mono muted">Contents</p><button type="button" class="btn" id="toc-close">Close</button></div>
${tocHtml(project.toc, slideAnchors)}
</nav>
</div>
<footer class="bar">
<div class="group">
<p class="mono" id="counter"></p>
<p class="mono muted hint">&larr; &rarr; Slides &nbsp; T Contents &nbsp; F Fullscreen</p>
</div>
<div class="group">
<button type="button" class="btn" id="prev">&larr; Prev</button>
<button type="button" class="btn" id="next">Next &rarr;</button>
<button type="button" class="btn" id="toc-btn">Contents</button>
<button type="button" class="btn" id="fs">Fullscreen</button>
<button type="button" class="btn" id="theme">Theme: System</button>
</div>
</footer>
<script>${HTML_SCRIPT}</script>
</body>
</html>`;

  return Buffer.from(html, "utf8");
}