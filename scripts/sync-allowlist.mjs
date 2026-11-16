// Menyalin ALLOWED_EMAILS (.env.local) ke tabel allowed_emails di Supabase.
// Jalankan: npm run db:allowlist  (setiap kali kamu mengubah ALLOWED_EMAILS)

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const raw = process.env.ALLOWED_EMAILS ?? "";

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const emails = [
  ...new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  ),
];

if (emails.length === 0) {
  console.error("ALLOWED_EMAILS is empty. Add at least one email in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 1. Tambah / perbarui email yang ada di env
const { error: upsertError } = await supabase
  .from("allowed_emails")
  .upsert(
    emails.map((email) => ({ email })),
    { onConflict: "email" }
  );

if (upsertError) {
  console.error("Upsert failed:", upsertError.message);
  process.exit(1);
}

// 2. Hapus email yang sudah tidak ada di env (user lama tidak ikut terhapus)
const list = emails.map((e) => `"${e}"`).join(",");
const { error: deleteError } = await supabase
  .from("allowed_emails")
  .delete()
  .not("email", "in", `(${list})`);

if (deleteError) {
  console.error("Cleanup failed:", deleteError.message);
  process.exit(1);
}

console.log("Allowlist synced:", emails.join(", "));