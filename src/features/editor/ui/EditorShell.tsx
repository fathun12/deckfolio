"use client";

import { useState } from "react";
import Link from "next/link";
import { BlockList } from "./BlockList";
import { ProjectSettingsPanel } from "./ProjectSettingsPanel";
import { SlideDetails } from "./SlideDetails";
import { StructurePanel } from "./StructurePanel";
import { UploadProvider } from "./blocks/UploadContext";
import { slidesOf } from "../logic/structure";
import { useEditorStructure } from "../logic/useEditorStructure";
import { useImageUpload } from "../logic/useImageUpload";
import { useProjectSettings } from "../logic/useProjectSettings";
import { useSlideBlocks } from "../logic/useSlideBlocks";
import { Notice } from "@/ui/primitives/Notice";
import type { EditorActions, EditorStructure } from "@/core/types/editor";
import type { ProjectVisibility } from "@/core/types/project";
import type { ProjectSettings, SaveSettingsAction, SetVisibilityAction } from "@/core/types/project-settings";
import type { SaveBlocksAction, SlideBlocks } from "@/core/types/slide-blocks";

type EditorShellProps = {
  projectId: string;
  ownerId: string;
  initialSettings: ProjectSettings;
  initialVisibility: ProjectVisibility;
  initial: EditorStructure;
  initialBlocks: SlideBlocks;
  actions: EditorActions;
  saveBlocks: SaveBlocksAction;
  saveSettings: SaveSettingsAction;
  setVisibility: SetVisibilityAction;
};

export function EditorShell({
  projectId,
  ownerId,
  initialSettings,
  initialVisibility,
  initial,
  initialBlocks,
  actions,
  saveBlocks,
  saveSettings,
  setVisibility,
}: EditorShellProps) {
  const editor = useEditorStructure(projectId, initial, actions);
  const blocks = useSlideBlocks(projectId, initialBlocks, saveBlocks);
  const project = useProjectSettings(
    projectId,
    initialSettings,
    initialVisibility,
    saveSettings,
    setVisibility
  );
  const upload = useImageUpload(ownerId, projectId);
  const [showSettings, setShowSettings] = useState(false);

  const selected = editor.slides.find((s) => s.id === editor.selectedId) ?? null;
  const isPublic = project.visibility === "public";

  // Urutan sama seperti di viewer: slide tanpa section dulu, lalu per section
  const slideOptions = [null, ...editor.sections.map((s) => s.id)]
    .flatMap((groupId) => slidesOf(editor.slides, groupId))
    .map((s) => ({ id: s.id, title: s.title }));

  const failed = blocks.status === "error";
  const working = editor.saving || blocks.status === "pending" || blocks.status === "saving";
  const statusLabel = failed ? "Not saved" : working ? "Saving..." : "Saved";

  return (
    <UploadProvider value={upload}>
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4">
        <header className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/dashboard" className="btn-sm">
              Back
            </Link>
            <div className="min-w-0">
              <p className="label-mono text-muted">Editor</p>
              <h1 className="truncate text-2xl font-bold">{project.settings.title}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {blocks.incomplete > 0 && (
              <span className="label-mono text-accent">
                {blocks.incomplete} incomplete {blocks.incomplete === 1 ? "block" : "blocks"} not
                saved
              </span>
            )}
            <span className="label-mono text-muted">{statusLabel}</span>
            <span className={isPublic ? "tag-live" : "tag"}>{isPublic ? "Public" : "Private"}</span>
            <Link
              href={`/dashboard/projects/${projectId}/preview`}
              target="_blank"
              rel="noreferrer"
              className="btn-sm"
            >
              Preview
            </Link>
            <a href={`/api/export/docx?id=${projectId}`} className="btn-sm">
              DOCX
            </a>
            <a href={`/api/export/pptx?id=${projectId}`} className="btn-sm">
              PPTX
            </a>
            <a href={`/api/export/html?id=${projectId}`} className="btn-sm">
              Offline HTML
            </a>
            {isPublic && (
              <Link
                href={`/p/${project.settings.slug}`}
                target="_blank"
                rel="noreferrer"
                className="btn-sm"
              >
                View
              </Link>
            )}
            <button
              type="button"
              className="btn-sm disabled:opacity-60"
              disabled={project.busy}
              onClick={() => void project.toggleVisibility()}
            >
              {project.busy ? "Saving..." : isPublic ? "Make private" : "Publish"}
            </button>
            <button type="button" className="btn-sm" onClick={() => setShowSettings((v) => !v)}>
              {showSettings ? "Hide settings" : "Settings"}
            </button>
          </div>
        </header>

        {showSettings && (
          <ProjectSettingsPanel
            settings={project.settings}
            onSave={project.saveSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {project.error && (
          <div className="mb-4">
            <Notice tone="error">{project.error}</Notice>
          </div>
        )}

        {editor.error && (
          <div className="mb-4">
            <Notice tone="error">{editor.error}</Notice>
          </div>
        )}

        {blocks.error && (
          <div className="mb-4">
            <Notice tone="error">
              <span>{blocks.error}</span>{" "}
              <button type="button" className="btn-sm" onClick={() => void blocks.retry()}>
                Try again
              </button>
            </Notice>
          </div>
        )}

        <main className="grid flex-1 gap-6 pb-10 lg:grid-cols-[20rem_1fr]">
          <aside>
            <StructurePanel
              sections={editor.sections}
              slides={editor.slides}
              selectedId={editor.selectedId}
              onSelect={editor.select}
              onAddSlide={editor.addSlide}
              onAddSection={editor.addSection}
              onReorderSlides={editor.reorderSlides}
              onRenameSection={editor.renameSection}
              onMoveSection={editor.moveSection}
              onDeleteSection={editor.deleteSection}
            />
          </aside>

          <section className="flex min-w-0 flex-col gap-6">
            <SlideDetails
              slide={selected}
              sections={editor.sections}
              onRename={(title) => selected && editor.renameSlide(selected.id, title)}
              onMove={(sectionId) => selected && editor.moveSlide(selected.id, sectionId)}
              onDelete={() => {
                if (!selected) return;
                blocks.discardPending(selected.id);
                editor.deleteSlide(selected.id);
              }}
            />

            {selected && (
              <BlockList
                key={selected.id}
                blocks={blocks.data[selected.id] ?? []}
                slideOptions={slideOptions}
                onAdd={(type) => blocks.addBlock(selected.id, type)}
                onChange={(next) => blocks.updateBlock(selected.id, next)}
                onRemove={(blockId) => blocks.removeBlock(selected.id, blockId)}
                onMove={(blockId, direction) => blocks.moveBlock(selected.id, blockId, direction)}
              />
            )}
          </section>
        </main>
      </div>
    </UploadProvider>
  );
}