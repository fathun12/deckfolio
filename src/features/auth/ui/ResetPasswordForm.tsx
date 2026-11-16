"use client";

import { useAuthForm, type AuthAction } from "../logic/useAuthForm";
import { PasswordField } from "@/ui/primitives/Field";
import { Notice } from "@/ui/primitives/Notice";
import { SubmitButton } from "@/ui/primitives/SubmitButton";

export function ResetPasswordForm({ action }: { action: AuthAction }) {
  const { state, formAction, pending } = useAuthForm(action);

  return (
    <div className="animate-fade-up">
      <h1 className="text-5xl font-bold">New password</h1>
      <p className="mt-3 mb-8 text-sm text-muted">Choose a new password for your account.</p>

      <form action={formAction} className="space-y-4">
        {state?.error && <Notice tone="error">{state.error}</Notice>}
        <PasswordField
          label="New password (min. 8 characters)"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <PasswordField
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <SubmitButton pending={pending}>Update password</SubmitButton>
      </form>
    </div>
  );
}