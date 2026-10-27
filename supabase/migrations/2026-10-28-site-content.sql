-- The website editor (2026-10-28): what the landing page and the four offer
-- pages say, edited from Admin → Website. Paste into the Supabase SQL editor
-- and run once. Safe to re-run.
--
-- A page with no row here shows the words written in the code
-- (lib/site-content.ts), so nothing changes until someone saves.

-- One row per page: 'landing', 'offer:management', 'offer:seminar', …
create table if not exists site_content (
  key              text primary key,
  content          jsonb not null,
  updated_at       timestamptz not null default now(),
  updated_by       uuid references auth.users (id) on delete set null,
  updated_by_name  text
);

-- Every save before the current one, so a bad edit can be put back.
create table if not exists site_content_versions (
  id               uuid primary key default gen_random_uuid(),
  key              text not null,
  content          jsonb not null,
  saved_at         timestamptz not null,
  saved_by_name    text
);
create index if not exists site_content_versions_key on site_content_versions (key, saved_at desc);

create or replace function site_content_keep_version() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into site_content_versions (key, content, saved_at, saved_by_name)
  values (old.key, old.content, old.updated_at, old.updated_by_name);
  -- Twenty per page is plenty.
  delete from site_content_versions
  where key = old.key and id not in (
    select id from site_content_versions where key = old.key order by saved_at desc limit 20
  );
  return new;
end;
$$;

drop trigger if exists site_content_versions on site_content;
create trigger site_content_versions after update or delete on site_content
  for each row execute function site_content_keep_version();

alter table site_content enable row level security;
alter table site_content_versions enable row level security;

drop policy if exists "anyone reads" on site_content;
drop policy if exists "staff writes" on site_content;
drop policy if exists "staff reads" on site_content_versions;
create policy "anyone reads" on site_content for select using (true);
create policy "staff writes" on site_content for all using (is_staff()) with check (is_staff());
create policy "staff reads" on site_content_versions for select using (is_staff());

grant select on site_content to anon, authenticated;
grant insert, update, delete on site_content to authenticated;
grant select on site_content_versions to authenticated;

-- Photos for the pages: a public bucket the team uploads to.
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

drop policy if exists "site media read" on storage.objects;
drop policy if exists "site media write" on storage.objects;
drop policy if exists "site media delete" on storage.objects;
create policy "site media read" on storage.objects for select using (bucket_id = 'site-media');
create policy "site media write" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-media' and is_staff());
create policy "site media delete" on storage.objects for delete to authenticated
  using (bucket_id = 'site-media' and is_staff());
