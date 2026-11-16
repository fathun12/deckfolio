import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/server/supabase/server";
import { isEmailAllowed } from "@/server/auth/allowlist";

// Hanya izinkan redirect ke path di situs ini
function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/sign-in?error=${reason}`);

  // Supabase mengirim error di URL (misalnya email ditolak oleh trigger database)
  if (searchParams.get("error")) {
    const description = searchParams.get("error_description") ?? "";
    return fail(/database error|not allowed/i.test(description) ? "not_allowed" : "callback");
  }

  if (!code) return fail("callback");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail("callback");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isEmailAllowed(user.email)) {
    await supabase.auth.signOut();
    return fail("not_allowed");
  }

  return NextResponse.redirect(`${origin}${next}`);
}