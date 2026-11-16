"use client";

import Link from "next/link";
import { useAuthForm, type AuthAction } from "../logic/useAuthForm";
import { TextField } from "@/ui/primitives/Field";
import { Notice } from "@/ui/primitives/Notice";
import { SubmitButton } from "@/ui/primitives/SubmitButton";

export function ForgotPasswordForm({ action }: { action: AuthAction }) {
  const { state, formAction, pending } = useAuthForm(action);

  return (
    <div className="animate-fade-up">
      <h1 className="text-5xl font-bold">Forgot password</h1>
      <p className="mt-3 mb-8 text-sm text-muted">
        Enter your email and we will send you a reset link.
      </p>

      <form action={formAction} className="space-y-4">
        {state?.error && <Notice tone="error">{state.error}</Notice>}
        {state?.message && <Notice>{state.message}</Notice>}
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.email}
          required
        />
        <SubmitButton pending={pending}>Send reset link</SubmitButton>
      </form>

      <p className="mt-6 text-xs text-muted">
        <Link href="/sign-in" className="link-underline text-ink">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}