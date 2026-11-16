import { createBrowserClient } from "@supabase/ssr";

// Client untuk browser (dipakai upload gambar). Memakai kunci publik saja.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}