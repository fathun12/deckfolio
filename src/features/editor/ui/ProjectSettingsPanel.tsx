"use client";

import { useState } from "react";
import { BlockField } from "./blocks/BlockField";
import { UploadButton } from "./blocks/UploadButton";
import { Notice } from "@/ui/primitives/Notice";
import type { EditorResult } from "@/core/types/editor";
import type { ProjectSettings } from "@/core/types/project-settings";

type ProjectSettingsPanelProps = {
  settings: ProjectSettings;
  onSave: (next: ProjectSettings) => Promise<EditorResult>;
  onClose: () => void;
};

export function ProjectSettingsPanel({ settings, onSave, onClose }: ProjectSettingsPanelProps) {
  const [title, setTitle] = useState(settings.title);
  const [subtitle, setSubtitle] = useState(settings.subtitle);
  const [slug, setSlug] = useState(settings.slug);
  const [coverUrl, setCoverUrl] = useState(settings.coverUrl);
  const [statsText, setStatsText] = useState(settings.stats.join("\n"));
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<EditorResult | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    const outcome = await onSave({
      title: title.trim(),
      subtitle: subtitle.trim(),
      slug: slug.trim().toLowerCase(),
      coverUrl: coverUrl.trim(),
      stats: statsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    });
    setResult(outcome);
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="cell mb-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="label-mono text-muted">Project settings</p>
        <button type="button" className="btn-sm" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BlockField label="Title" htmlFor="set-title">
          <input
            id="set-title"
            className="input"
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
          />
        </BlockField>
        <BlockField label="Address (/p/...)" htmlFor="set-slug">
          <input
            id="set-slug"
            className="input font-mono"
            value={slug}
            maxLength={70}
            onChange={(e) => setSlug(e.target.value)}
          />
        </BlockField>
      </div>

      <BlockField label="Subtitle" htmlFor="set-subtitle">
        <input
          id="set-subtitle"
          className="input"
          value={subtitle}
          maxLength={300}
          onChange={(e) => setSubtitle(e.target.value)}
        />
      </BlockField>

      <BlockField label="Cover image address" htmlFor="set-cover">
        <input
          id="set-cover"
          className="input"
          value={coverUrl}
          placeholder="https://..."
          maxLength={8192}
          onChange={(e) => setCoverUrl(e.target.value)}
        />
      </BlockField>
      <UploadButton label="Upload cover" onUploaded={setCoverUrl} />

      <BlockField label="Stats (one per line, max 6)" htmlFor="set-stats">
        <textarea
          id="set-stats"
          className="input min-h-24 font-mono"
          value={statsText}
          placeholder={"1 FLOOR\n1 BEDROOM\n255 M2"}
          onChange={(e) => setStatsText(e.target.value)}
        />
      </BlockField>

      {result && !result.ok && <Notice tone="error">{result.error}</Notice>}
      {result?.ok && <p className="label-mono text-muted">Settings saved.</p>}

      <div>
        <button type="submit" disabled={pending} className="btn-solid disabled:opacity-60">
          {pending ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}