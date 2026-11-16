"use client";

import { useActionState } from "react";
import type { ProjectActionState } from "@/core/types/project";

export type ProjectAction = (
  prev: ProjectActionState,
  formData: FormData
) => Promise<ProjectActionState>;

export function useProjectAction(action: ProjectAction) {
  const [state, formAction, pending] = useActionState(action, null);
  return { state, formAction, pending };
}