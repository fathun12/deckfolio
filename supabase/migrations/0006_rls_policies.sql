-- =========================================================================
-- 0006: keamanan (Row Level Security) + hak akses
-- Aturan: pemilik bebas atur datanya; publik hanya bisa BACA proyek public.
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.sections enable row level security;
alter table public.slides   enable row level security;

-- Hak akses dasar (RLS tetap yang menentukan baris mana yang boleh)
grant usage on schema public to anon, authenticated;

grant select on public.projects, public.sections, public.slides to anon;
grant select, insert, update, delete
  on public.projects, public.sections, public.slides to authenticated;
grant select, update on public.profiles to authenticated;

-- ---------- profiles ----------
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------- projects ----------
create policy "projects_select_public"
  on public.projects for select to anon, authenticated
  using (visibility = 'public');

create policy "projects_select_own"
  on public.projects for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "projects_insert_own"
  on public.projects for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "projects_update_own"
  on public.projects for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "projects_delete_own"
  on public.projects for delete to authenticated
  using (owner_id = (select auth.uid()));

-- ---------- sections ----------
create policy "sections_select_public"
  on public.sections for select to anon, authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = sections.project_id and p.visibility = 'public'
  ));

create policy "sections_owner_all"
  on public.sections for all to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = sections.project_id and p.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.projects p
    where p.id = sections.project_id and p.owner_id = (select auth.uid())
  ));

-- ---------- slides ----------
create policy "slides_select_public"
  on public.slides for select to anon, authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = slides.project_id and p.visibility = 'public'
  ));

create policy "slides_owner_all"
  on public.slides for all to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = slides.project_id and p.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.projects p
    where p.id = slides.project_id and p.owner_id = (select auth.uid())
  ));