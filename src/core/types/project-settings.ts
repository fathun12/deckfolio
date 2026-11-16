import type { EditorResult } from "./editor";
import type { ProjectVisibility } from "./project";

export type ProjectSettings = {
  title: string;
  subtitle: string;
  slug: string;
  coverUrl: string;
  stats: string[];
};

export type SaveSettingsAction = (
  input: { projectId: string } & ProjectSettings
) => Promise<EditorResult>;

export type SetVisibilityAction = (input: {
  projectId: string;
  visibility: ProjectVisibility;
}) => Promise<EditorResult>;