-- =========================================================================
-- 0003: projects
-- =========================================================================

create type public.project_visibility as enum ('private', 'public');

create table public.projects (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references public.profiles (id) on delete cascade,
  slug           text not null unique
                 check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 80),
  title          text not null check (char_length(title) between 1 and 200),
  subtitle       text,
  cover_url      text,
  -- contoh: ["1 FLOOR", "1 BEDROOM", "255 M2"]
  stats          jsonb not null default '[]'::jsonb
                 check (jsonb_typeof(stats) = 'array'),
  visibility     public.project_visibility not null default 'private',
  published_at   timestamptz,
  schema_version int not null default 1,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index projects_owner_idx  on public.projects (owner_id);
create index projects_public_idx on public.projects (visibility, published_at desc);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- Isi published_at saat pertama kali dipublikasikan
create or replace function public.set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.visibility = 'public' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger projects_set_published_at
  before insert or update on public.projects
  for each row execute function public.set_published_at();