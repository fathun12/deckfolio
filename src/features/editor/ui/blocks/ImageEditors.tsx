"use client";

import { BlockField } from "./BlockField";
import { UploadButton } from "./UploadButton";
import { isSafeImageUrl } from "@/core/schemas/url";
import type { EditorProps } from "./types";

export function ImageEditor({ block, onChange }: EditorProps<"image">) {
  return (
    <div className="flex flex-col gap-4">
      <BlockField label="Image address" htmlFor={`${block.id}-url`}>
        <input
          id={`${block.id}-url`}
          className="input"
          value={block.url}
          placeholder="https://..."
          maxLength={8192}
          onChange={(e) => onChange({ ...block, url: e.target.value.trim() })}
        />
      </BlockField>
      <UploadButton onUploaded={(url) => onChange({ ...block, url })} />
      {block.url && isSafeImageUrl(block.url) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.url}
          alt={block.alt}
          className="max-h-48 w-auto border border-line object-contain"
        />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <BlockField label="Alt text" htmlFor={`${block.id}-alt`}>
          <input
            id={`${block.id}-alt`}
            className="input"
            value={block.alt}
            maxLength={300}
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
          />
        </BlockField>
        <BlockField label="Caption (optional)" htmlFor={`${block.id}-caption`}>
          <input
            id={`${block.id}-caption`}
            className="input"
            value={block.caption ?? ""}
            maxLength={300}
            onChange={(e) => onChange({ ...block, caption: e.target.value || undefined })}
          />
        </BlockField>
      </div>
    </div>
  );
}

export function GalleryEditor({ block, onChange }: EditorProps<"gallery">) {
  const setImage = (
    index: number,
    patch: Partial<{ url: string; alt: string; caption: string | undefined }>
  ) =>
    onChange({
      ...block,
      images: block.images.map((image, i) => (i === index ? { ...image, ...patch } : image)),
    });

  return (
    <div className="flex flex-col gap-4">
      {block.images.length === 0 && (
        <p className="text-sm text-muted">No images yet. Add the first one below.</p>
      )}

      {block.images.map((image, index) => (
        <div key={index} className="rule flex flex-col gap-3 pt-4 first:border-t-0 first:pt-0">
          <div className="flex items-center justify-between">
            <p className="label-mono text-muted">Image {String(index + 1).padStart(2, "0")}</p>
            <button
              type="button"
              className="btn-sm"
              onClick={() =>
                onChange({ ...block, images: block.images.filter((_, i) => i !== index) })
              }
            >
              Remove
            </button>
          </div>
          <BlockField label="Image address" htmlFor={`${block.id}-${index}-url`}>
            <input
              id={`${block.id}-${index}-url`}
              className="input"
              value={image.url}
              placeholder="https://..."
              maxLength={8192}
              onChange={(e) => setImage(index, { url: e.target.value.trim() })}
            />
          </BlockField>
          <UploadButton onUploaded={(url) => setImage(index, { url })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <BlockField label="Alt text" htmlFor={`${block.id}-${index}-alt`}>
              <input
                id={`${block.id}-${index}-alt`}
                className="input"
                value={image.alt}
                maxLength={300}
                onChange={(e) => setImage(index, { alt: e.target.value })}
              />
            </BlockField>
            <BlockField label="Caption (optional)" htmlFor={`${block.id}-${index}-caption`}>
              <input
                id={`${block.id}-${index}-caption`}
                className="input"
                value={image.caption ?? ""}
                maxLength={300}
                onChange={(e) => setImage(index, { caption: e.target.value || undefined })}
              />
            </BlockField>
          </div>
        </div>
      ))}

      <div>
        <button
          type="button"
          className="btn-sm disabled:opacity-40"
          disabled={block.images.length >= 60}
          onClick={() => onChange({ ...block, images: [...block.images, { url: "", alt: "" }] })}
        >
          Add image
        </button>
      </div>
    </div>
  );
}