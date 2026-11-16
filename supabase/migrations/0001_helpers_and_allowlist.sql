-- =========================================================================
-- 0001: helper umum + penjaga allowlist email
-- =========================================================================

-- Mengisi kolom updated_at otomatis setiap baris diubah
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Daftar email yang boleh mendaftar (diisi dari ALLOWED_EMAILS lewat script)
create table public.allowed_emails (
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

-- RLS aktif tanpa policy = hanya service role yang bisa akses tabel ini
alter table public.allowed_emails enable row level security;
revoke all on public.allowed_emails from anon, authenticated;
grant all on public.allowed_emails to service_role;

-- Tolak pembuatan user kalau emailnya tidak ada di allowlist
create or replace function public.enforce_email_allowlist()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.allowed_emails where email = lower(new.email)
  ) then
    raise exception 'Sign-up is not allowed for this email.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_email_allowlist on auth.users;
create trigger enforce_email_allowlist
  before insert on auth.users
  for each row execute function public.enforce_email_allowlist();