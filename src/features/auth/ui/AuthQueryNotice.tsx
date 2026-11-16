"use client";

import { useSearchParams } from "next/navigation";
import { Notice } from "@/ui/primitives/Notice";

const MESSAGES: Record<string, string> = {
  not_allowed: "This email is not allowed to sign up.",
  oauth: "Google sign-in failed. Please try again.",
  callback: "That link is invalid or has expired. Please try again.",
};

export function AuthQueryNotice() {
  const code = useSearchParams().get("error");
  if (!code) return null;

  return (
    <Notice tone="error" className="mb-6">
      {MESSAGES[code] ?? MESSAGES.callback}
    </Notice>
  );
}