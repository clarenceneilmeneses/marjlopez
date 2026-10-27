-- The four offers (2026-10-28): property management, seminar, invest, system.
-- For a database set up before this date. Paste into the Supabase SQL editor
-- and run once; it keeps every row. Then `npm run seed` refreshes the demo.
--
-- Old requests move to their nearest new offer: Start → Seminar, Build → Invest.

begin;

alter table leads drop constraint if exists leads_type_check;
update leads set type = 'seminar' where type = 'start';
update leads set type = 'invest' where type = 'build';
alter table leads add constraint leads_type_check
  check (type in ('management', 'seminar', 'invest', 'system', 'other'));

alter table quick_replies drop constraint if exists quick_replies_auto_for_type_check;
update quick_replies set auto_for_type = 'seminar' where auto_for_type = 'start';
update quick_replies set auto_for_type = 'invest' where auto_for_type = 'build';
alter table quick_replies add constraint quick_replies_auto_for_type_check
  check (auto_for_type in ('management', 'seminar', 'invest', 'system', 'other'));

-- Ranking moved to the app (lib/score.ts); the table keeps only the hand override.
create or replace function lead_hot_rules() returns trigger
language plpgsql as $$
begin
  new.hot := coalesce(new.hot_override, false);
  new.hot_reason := null;
  return new;
end;
$$;
update leads set hot = coalesce(hot_override, false), hot_reason = null;

commit;
