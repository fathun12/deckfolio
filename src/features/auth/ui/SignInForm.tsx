"use client";

import Link from "next/link";
import { useAuthForm, type AuthAction } from "../logic/useAuthForm";
import { GoogleButton } from "./GoogleButton";
import { PasswordField, TextField } from "@/ui/primitives/Field";
import { Notice } from "@/ui/primitives/Notice";
import { SubmitButton } from "@/ui/primitives/SubmitButton";

type SignInFormProps = {
  action: AuthAction;
  googleAction: () => Promise<void>;
};

export function SignInForm({ action, googleAction }: SignInFormProps) {
  const { state, formAction, pending } = useAuthForm(action);

  return (
    <div className="animate-fade-up">
      <h1 className="text-5xl font-bold">Sign in</h1>
      <p className="mt-3 mb-8 text-sm text-muted">
        Sign in to manage your projects.
      </p>

      <GoogleButton action={googleAction} />

      <div className="my-6 flex items-center gap-4 text-xs text-muted">
        <span className="h-px flex-1 bg-line-soft" />
        or
        <span className="h-px flex-1 bg-line-soft" />
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && <Notice tone="error">{state.error}</Notice>}
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.email}
          required
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          required
        />
        <Link href="/forgot-password" className="link-underline block text-xs text-muted">
          Forgot password?
        </Link>
        <SubmitButton pending={pending}>Sign in</SubmitButton>
      </form>

      <p className="mt-6 text-xs text-muted">
        No account yet?{" "}
        <Link href="/sign-up" className="link-underline text-ink">
          Sign up
        </Link>
      </p>
    </div>
  );
}