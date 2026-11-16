"use client";

import { useActionState } from "react";
import type { ActionState } from "@/core/types/auth";

export type AuthAction = (
  prev: ActionState,
  formData: FormData
) => Promise<ActionState>;

export function useAuthForm(action: AuthAction) {
  const [state, formAction, pending] = useActionState(action, null);
  return { state, formAction, pending };
}