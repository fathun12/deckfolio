"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/server/supabase/server";
import { isEmailAllowed } from "@/server/auth/allowlist";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/core/schemas/auth";
import type { ActionState } from "@/core/types/auth";
import { siteUrl } from "@/lib/env";

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("password")) return message;
  return "Something went wrong. Please try again.";
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = { email: text(formData, "email"), password: text(formData, "password") };
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, email: raw.email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: friendlyError(error.message), email: parsed.data.email };

  // Lapisan tambahan: email yang sudah dihapus dari ALLOWED_EMAILS tidak boleh masuk
  if (!isEmailAllowed(parsed.data.email)) {
    await supabase.auth.signOut();
    return { error: "This email is not allowed to sign in.", email: parsed.data.email };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = { email: text(formData, "email"), password: text(formData, "password") };
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, email: raw.email };
  }

  if (!isEmailAllowed(parsed.data.email)) {
    return { error: "This email is not allowed to sign up.", email: parsed.data.email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });
  if (error) return { error: friendlyError(error.message), email: parsed.data.email };

  return {
    message: "Almost done. Check your inbox and click the link to confirm your email.",
    email: parsed.data.email,
  };
}

export async function signInWithGoogleAction(): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data.url) redirect("/sign-in?error=oauth");
  redirect(data.url);
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = { email: text(formData, "email") };
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, email: raw.email };
  }

  // Pesan selalu sama supaya orang tidak bisa menebak email mana yang terdaftar
  if (isEmailAllowed(parsed.data.email)) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });
  }

  return {
    message: "If this email is registered, a reset link is on its way.",
    email: parsed.data.email,
  };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: friendlyError(error.message) };

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}