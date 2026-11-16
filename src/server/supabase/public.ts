import { createClient } from "@supabase/supabase-js";

// Client tanpa cookies untuk data publik (aman di-cache).
// RLS hanya mengizinkan membaca proyek yang visibility = 'public'.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}