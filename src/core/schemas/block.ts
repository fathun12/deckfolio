import { z } from "zod";
import { isSafeHref, isSafeImageUrl } from "./url";
import { toEmbedUrl } from "./embed";

export const BLOCK_SCHEMA_VERSION = 1;

const id = z.string().min(1).max(64);
const imageUrl = z.string().max(8192).refine(isSafeImageUrl, "Invalid image address.");
const href = z.string().max(2048).refine(isSafeHref, "Invalid link.");

const imageItem = z.object({
  url: imageUrl,
  alt: z.string().max(300).default(""),
  caption: z.string().max(300).optional(),
});

const bentoCell = z.object({
  title: z.string().max(120).default(""),
  text: z.string().max(600).default(""),
  imageUrl: imageUrl.optional(),
  alt: z.string().max(300).default(""),
  span: z.union([z.literal(1), z.literal(2)]).default(1),
});

export const blockSchema = z.discriminatedUnion("type", [
  z.object({
    id,
    type: z.literal("heading"),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    text: z.string().max(300),
  }),
  z.object({
    id,
    type: z.literal("text"),
    // Dokumen JSON Tiptap. Divalidasi longgar, renderer yang menyaring node.
    content: z.unknown(),
  }),
  z.object({
    id,
    type: z.literal("image"),
    url: imageUrl,
    alt: z.string().max(300).default(""),
    caption: z.string().max(300).optional(),
  }),
  z.object({
    id,
    type: z.literal("gallery"),
    images: z.array(imageItem).max(60),
  }),
  z.object({
    id,
    type: z.literal("quote"),
    text: z.string().max(1000),
    cite: z.string().max(200).optional(),
  }),
  z.object({
    id,
    type: z.literal("stat"),
    items: z
      .array(z.object({ label: z.string().max(80), value: z.string().max(80) }))
      .max(12),
  }),
  z.object({
    id,
    type: z.literal("reasoning"),
    title: z.string().max(80).default("Design reasoning"),
    text: z.string().max(2000),
  }),
  z.object({ id, type: z.literal("divider") }),
  z.object({
    id,
    type: z.literal("button"),
    label: z.string().min(1).max(80),
    href: href.optional(),
    slideId: z.string().max(64).optional(),
  }),
  z.object({
    id,
    type: z.literal("code"),
    language: z.string().max(40).optional(),
    code: z.string().max(20000),
  }),
  z.object({
    id,
    type: z.literal("bento"),
    cells: z.array(bentoCell).min(1, "Add at least one cell.").max(12),
  }),
  z.object({
    id,
    type: z.literal("embed"),
    url: z
      .string()
      .max(2048)
      .refine(
        (v) => toEmbedUrl(v) !== null,
        "This address cannot be embedded. Use YouTube, Vimeo, Loom, Figma or Google Maps."
      ),
    title: z.string().max(200).default(""),
    ratio: z.enum(["16:9", "4:3", "1:1"]).default("16:9"),
  }),
]);