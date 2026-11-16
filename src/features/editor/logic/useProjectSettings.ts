"use client";

import { useState } from "react";
import type { EditorResult } from "@/core/types/editor";
import type { ProjectVisibility } from "@/core/types/project";
import type {
  ProjectSettings,
  SaveSettingsAction,
  SetVisibilityAction,
} from "@/core/types/project-settings";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export function useProjectSettings(
  projectId: string,
  initial: ProjectSettings,
  initialVisibility: ProjectVisibility,
  save: SaveSettingsAction,
  setVisibility: SetVisibilityAction
) {
  const [settings, setSettings] = useState(initial);
  const [visibility, setVisibilityState] = useState(initialVisibility);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveSettings(next: ProjectSettings): Promise<EditorResult> {
    setError(null);
    try {
      const result = await save({ projectId, ...next });
      if (result.ok) setSettings(next);
      return result;
    } catch {
      return { ok: false, error: GENERIC_ERROR };
    }
  }

  async function toggleVisibility() {
    const target: ProjectVisibility = visibility === "public" ? "private" : "public";
    setBusy(true);
    setError(null);
    try {
      const result = await setVisibility({ projectId, visibility: target });
      if (result.ok) setVisibilityState(target);
      else setError(result.error);
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setBusy(false);
    }
  }

  return {
    settings,
    visibility,
    busy,
    error,
    dismissError: () => setError(null),
    saveSettings,
    toggleVisibility,
  };
}