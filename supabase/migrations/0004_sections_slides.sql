-- =========================================================================
-- 0004: sections (pengelompok TOC) dan slides (isi: blocks dalam JSONB)
-- =========================================================================

create table public.sections (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 200),
  position   int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sections_project_idx on public.sections (project_id, position);

create trigger sections_set_updated_at
  before update on public.sections
  for each row execute function public.set_updated_at();

create table public.slides (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects (id) on delete cascade,
  section_id     uuid references public.sections (id) on delete set null,
  title          text not null default 'Untitled' check (char_length(title) <= 200),
  position       int not null default 0,
  -- daftar block konten (heading, text, image, dst), divalidasi Zod di aplikasi
  blocks         jsonb not null default '[]'::jsonb
                 check (jsonb_typeof(blocks) = 'array'),
  schema_version int not null default 1,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index slides_project_idx on public.slides (project_id, position);
create index slides_section_idx on public.slides (section_id);

create trigger slides_set_updated_at
  before update on public.slides
  for each row execute function public.set_updated_at();