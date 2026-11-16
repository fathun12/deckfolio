"use client";

import { useRef } from "react";
import { useImportProject } from "../logic/useImportProject";
import { Notice } from "@/ui/primitives/Notice";

export function ImportProject() {
  const importer = useImportProject();
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="cell mt-6 flex flex-col gap-3">
      <p className="label-mono text-muted">Import</p>
      <p className="text-sm text-muted">
        Create a private project from a Word (.docx) or PowerPoint (.pptx) file. Animations and
        transitions are not imported.
      </p>
      <input
        ref={input}
        type="file"
        accept=".docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        className="hidden"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = "";
          if (file) void importer.submit(file);
        }}
      />
      <div>
        <button
          type="button"
          className="btn-outline disabled:opacity-60"
          disabled={importer.pending}
          onClick={() => input.current?.click()}
        >
          {importer.pending ? "Importing..." : "Import file"}
        </button>
      </div>
      {importer.error && <Notice tone="error">{importer.error}</Notice>}
    </div>
  );
}