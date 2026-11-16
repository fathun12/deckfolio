"use client";

import Link from "next/link";
import { useAuthForm, type AuthAction } from "../logic/useAuthForm";
import { GoogleButton } from "./GoogleButton";
import { PasswordField, TextField } from "@/ui/primitives/Field";
import { Notice } from "@/ui/primitives/Notice";
import { SubmitButton } from "@/ui/primitives/SubmitButton";

type SignUpFormProps = {
  action: AuthAction;
  googleAction: () => Promise<void>;
};

export function SignUpForm({ action, googleAction }: SignUpFormProps) {
  const { state, formAction, pending } = useAuthForm(action);

  return (
    <div className="animate-fade-up">
      <h1 className="text-5xl font-bold">Sign up</h1>
      <p className="mt-3 mb-8 text-sm text-muted">
        Private studio. Only approved emails can register.
      </p>

      <GoogleButton action={googleAction} />

      <div className="my-6 flex items-center gap-4 text-xs text-muted">
        <span className="h-px flex-1 bg-line-soft" />
        or
        <span className="h-px flex-1 bg-line-soft" />
      </div>

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
        <PasswordField
          label="Password (min. 8 characters)"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <SubmitButton pending={pending}>Create account</SubmitButton>
      </form>

      <p className="mt-6 text-xs text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="link-underline text-ink">
          Sign in
        </Link>
      </p>
    </div>
  );
}