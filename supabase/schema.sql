-- =============================================================================
-- Marj Lopez — inquiry system. The whole database, in one file.
-- =============================================================================
-- Paste into Supabase → SQL editor → Run. Safe to re-run: it drops and
-- recreates the app's own objects (never auth.users), so re-running WIPES the
-- app's data. Run `node scripts/seed.mjs` afterwards for the demo data.
--
-- The shape is Malaya OBS's Inbox (PRD §5 there) with the booking taken out:
--   profiles       a person who inquired (one per auth user)
--   staff          Marj and his assistants (owner | assistant)
--   conversations  ONE per person — `unique (person_id)`, as in Malaya
--   leads          each inquiry form a person sends; many per conversation
--   messages       the chat; `kind` marks the request card and meeting cards
--   meetings       a call Marj's team proposes and the client confirms
-- =============================================================================

-- ---------------------------------------------------------------- clean slate
drop table if exists message_reactions cascade;
drop table if exists staff_notes cascade;
drop table if exists meetings cascade;
drop table if exists messages cascade;
drop table if exists leads cascade;
drop table if exists conversations cascade;
drop table if exists quick_replies cascade;
drop table if exists staff cascade;
drop table if exists profiles cascade;
drop sequence if exists lead_code_seq;
drop sequence if exists conversation_code_seq;

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------- people
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  mobile      text,
  email       text,
  source      text,
  created_at  timestamptz not null default now()
);

create table staff (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  name        text not null,
  role        text not null default 'assistant' check (role in ('owner', 'assistant')),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------ conversations
create sequence conversation_code_seq;
create sequence lead_code_seq;

create table conversations (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique
                   default 'CV-' || lpad(nextval('conversation_code_seq')::text, 4, '0'),
  -- One continuous conversation per person, every request they ever send.
  person_id        uuid not null unique references profiles (id) on delete cascade,
  current_lead_id  uuid,
  assigned_to      uuid references staff (user_id) on delete set null,
  unread           boolean not null default true,     -- unread by the team
  starred          boolean not null default false,
  archived         boolean not null default false,
  last_activity    timestamptz not null default now(),
  -- When the client's oldest unanswered message arrived; null = nothing waiting.
  waiting_since    timestamptz,
  client_seen_at   timestamptz,
  staff_seen_at    timestamptz,
  created_at       timestamptz not null default now()
);
create index on conversations (last_activity desc);

-- ----------------------------------------------------------------- leads
create table leads (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique
                   default 'LD-' || lpad(nextval('lead_code_seq')::text, 4, '0'),
  person_id        uuid not null references profiles (id) on delete cascade,
  conversation_id  uuid references conversations (id) on delete cascade,
  type             text not null check (type in ('start', 'build', 'system', 'other')),
  answers          jsonb not null default '{}'::jsonb,
  -- Pulled out of `answers` so the Inbox can filter and sort on them.
  location         text,
  budget           text,
  timeline         text,
  source           text,
  stage            text not null default 'new'
                   check (stage in ('new', 'talking', 'call_booked', 'proposal_sent', 'won', 'lost')),
  lost_reason      text,
  -- Computed by the trigger below from the answers; `hot_override` is a
  -- person's call and wins when set.
  hot              boolean not null default false,
  hot_reason       text,
  hot_override     boolean,
  created_at       timestamptz not null default now()
);
create index on leads (conversation_id);

alter table conversations
  add constraint conversations_current_lead_fk
  foreign key (current_lead_id) references leads (id) on delete set null;

-- ---------------------------------------------------------------- messages
create table meetings (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references conversations (id) on delete cascade,
  lead_id          uuid references leads (id) on delete set null,
  proposed_by      uuid references auth.users (id) on delete set null,
  starts_at        timestamptz not null,
  duration_min     int not null default 30,
  mode             text not null default 'google_meet'
                   check (mode in ('google_meet', 'zoom', 'phone', 'in_person')),
  link             text,
  location         text,
  note             text,
  status           text not null default 'proposed'
                   check (status in ('proposed', 'confirmed', 'declined', 'cancelled')),
  responded_at     timestamptz,
  created_at       timestamptz not null default now()
);

create table messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references conversations (id) on delete cascade,
  author           text not null check (author in ('client', 'staff', 'system')),
  author_id        uuid references auth.users (id) on delete set null,
  author_name      text not null,
  -- message: a chat line · request: the inquiry card · meeting: a call card
  -- auto: the automatic thank-you after a request
  kind             text not null default 'message'
                   check (kind in ('message', 'request', 'meeting', 'auto')),
  body             text not null default '',
  lead_id          uuid references leads (id) on delete set null,
  meeting_id       uuid references meetings (id) on delete set null,
  media_path       text,
  media_type       text check (media_type in ('image', 'video')),
  reply_to_id      uuid references messages (id) on delete set null,
  edited_at        timestamptz,
  unsent_at        timestamptz,
  sent_at          timestamptz not null default now()
);
create index on messages (conversation_id, sent_at);

create table message_reactions (
  message_id  uuid not null references messages (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  emoji       text not null,
  created_at  timestamptz not null default now(),
  primary key (message_id, user_id)
);

create table staff_notes (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references conversations (id) on delete cascade,
  staff_id         uuid references staff (user_id) on delete set null,
  author_name      text not null,
  body             text not null,
  created_at       timestamptz not null default now()
);

create table quick_replies (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  body           text not null,
  -- Set on at most one reply per type: the thank-you sent after that request.
  auto_for_type  text unique check (auto_for_type in ('start', 'build', 'system', 'other')),
  sort           int not null default 0,
  created_at     timestamptz not null default now()
);

-- =============================================================================
-- Helpers
-- =============================================================================
create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where user_id = auth.uid() and active);
$$;

create or replace function is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where user_id = auth.uid() and active and role = 'owner');
$$;

create or replace function can_see_conversation(conv uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_staff() or exists (
    select 1 from conversations where id = conv and person_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------- hot leads
-- Simple, visible rules (PRD §9.3). The reason is shown on the lead panel.
create or replace function lead_hot_rules() returns trigger
language plpgsql as $$
declare
  a jsonb := new.answers;
  reasons text[] := '{}';
begin
  if new.type = 'start' then
    if a->>'capital' in ('300k-1m', '1m+') and a->>'start_when' in ('asap', '1-3m') then
      reasons := array[
        'Capital ' || case a->>'capital' when '1m+' then '₱1M+' else '₱300k–1M' end,
        case a->>'start_when' when 'asap' then 'starting ASAP' else 'starting in 1–3 months' end
      ];
    end if;
  elsif new.type = 'build' then
    if a->>'budget' in ('5-10m', '10m+') then
      reasons := reasons || ('Budget ' || case a->>'budget' when '10m+' then '₱10M+' else '₱5–10M' end);
    end if;
    if a->>'lot' = 'own' and a->>'timeline' in ('3m', '3-6m') then
      reasons := reasons || 'owns a lot'::text || 'building within 6 months'::text;
    end if;
  elsif new.type = 'system' then
    if a->>'units' in ('2-5', '6-15', '16+') then
      reasons := reasons || (coalesce(a->>'units', '') || ' units');
    end if;
    if a->>'when' = 'asap' then
      reasons := reasons || 'needs it ASAP'::text;
    end if;
  end if;

  new.hot := coalesce(new.hot_override, cardinality(reasons) > 0);
  new.hot_reason := case when cardinality(reasons) > 0 then array_to_string(reasons, ' · ') end;
  return new;
end;
$$;

create trigger leads_hot before insert or update of answers, hot_override on leads
  for each row execute function lead_hot_rules();

-- ------------------------------------------------- a message moves the thread
create or replace function messages_touch_conversation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.author = 'client' then
    update conversations set
      last_activity = greatest(last_activity, new.sent_at),
      unread = true,
      archived = false,
      waiting_since = coalesce(waiting_since, new.sent_at)
    where id = new.conversation_id;
  elsif new.author = 'staff' and new.kind <> 'auto' then
    update conversations set
      last_activity = greatest(last_activity, new.sent_at),
      waiting_since = null
    where id = new.conversation_id;
    -- The first real reply moves a new lead to Talking.
    update leads set stage = 'talking'
    where conversation_id = new.conversation_id and stage = 'new';
  else
    update conversations set last_activity = greatest(last_activity, new.sent_at)
    where id = new.conversation_id;
  end if;
  return new;
end;
$$;

create trigger messages_after_insert after insert on messages
  for each row execute function messages_touch_conversation();

-- =============================================================================
-- What the app calls
-- =============================================================================

-- The inquiry form's Send. One call: profile, conversation, lead, the request
-- card and the automatic thank-you. Returns the conversation id.
create or replace function submit_inquiry(
  p_type text,
  p_answers jsonb,
  p_full_name text,
  p_mobile text,
  p_source text,
  p_note text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  conv uuid;
  lead uuid;
  first_name text;
  qr record;
begin
  if uid is null then
    raise exception 'Sign in first';
  end if;

  insert into profiles (id, full_name, mobile, email, source)
  values (uid, trim(p_full_name), p_mobile,
          (select email from auth.users where id = uid), p_source)
  on conflict (id) do update set
    full_name = excluded.full_name,
    mobile = excluded.mobile,
    source = coalesce(profiles.source, excluded.source);

  insert into conversations (person_id) values (uid)
  on conflict (person_id) do nothing;
  select id into conv from conversations where person_id = uid;

  insert into leads (person_id, conversation_id, type, answers, location, budget, timeline, source)
  values (
    uid, conv, p_type,
    p_answers || case when coalesce(trim(p_note), '') <> ''
                      then jsonb_build_object('note', trim(p_note)) else '{}'::jsonb end,
    p_answers->>'location',
    coalesce(p_answers->>'budget', p_answers->>'capital'),
    coalesce(p_answers->>'timeline', p_answers->>'start_when', p_answers->>'when'),
    p_source
  )
  returning id into lead;

  update conversations set current_lead_id = lead where id = conv;

  insert into messages (conversation_id, author, author_id, author_name, kind, body, lead_id)
  values (conv, 'client', uid, trim(p_full_name), 'request', coalesce(trim(p_note), ''), lead);

  select * into qr from quick_replies where auto_for_type = p_type;
  if found then
    first_name := split_part(trim(p_full_name), ' ', 1);
    insert into messages (conversation_id, author, author_name, kind, body, lead_id, sent_at)
    values (conv, 'staff', 'Team Marj', 'auto',
            replace(qr.body, '{first_name}', first_name), lead, now() + interval '1 second');
  end if;

  return conv;
end;
$$;

-- Opening a thread: the team's side clears Unread and stamps "Seen"; the
-- client's side stamps their "Seen".
create or replace function mark_seen(p_conversation uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if is_staff() then
    update conversations set unread = false, staff_seen_at = now() where id = p_conversation;
  elsif exists (select 1 from conversations where id = p_conversation and person_id = auth.uid()) then
    update conversations set client_seen_at = now() where id = p_conversation;
  end if;
end;
$$;

-- The team proposes a call; it lands in the chat as a card.
create or replace function propose_meeting(
  p_conversation uuid,
  p_starts_at timestamptz,
  p_duration int,
  p_mode text,
  p_link text,
  p_location text,
  p_note text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  m uuid;
  me text;
  lead uuid;
begin
  if not is_staff() then raise exception 'Staff only'; end if;
  select name into me from staff where user_id = auth.uid();
  select current_lead_id into lead from conversations where id = p_conversation;

  insert into meetings (conversation_id, lead_id, proposed_by, starts_at, duration_min, mode, link, location, note)
  values (p_conversation, lead, auth.uid(), p_starts_at, coalesce(p_duration, 30), p_mode,
          nullif(trim(p_link), ''), nullif(trim(p_location), ''), nullif(trim(p_note), ''))
  returning id into m;

  insert into messages (conversation_id, author, author_id, author_name, kind, body, meeting_id, lead_id)
  values (p_conversation, 'staff', auth.uid(), me, 'meeting', coalesce(trim(p_note), ''), m, lead);
  return m;
end;
$$;

-- The client answers the card. Confirming books the call on the lead.
create or replace function respond_meeting(p_meeting uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = public as $$
declare
  mt meetings;
  who text;
begin
  select * into mt from meetings where id = p_meeting;
  if not found or not can_see_conversation(mt.conversation_id) then
    raise exception 'Not found';
  end if;
  if mt.status <> 'proposed' then return; end if;

  update meetings set status = case when p_accept then 'confirmed' else 'declined' end,
                      responded_at = now()
  where id = p_meeting;

  if p_accept and mt.lead_id is not null then
    update leads set stage = 'call_booked'
    where id = mt.lead_id and stage in ('new', 'talking');
  end if;

  select coalesce(nullif(full_name, ''), 'Client') into who from profiles where id = auth.uid();
  insert into messages (conversation_id, author, author_id, author_name, body)
  values (mt.conversation_id, case when is_staff() then 'staff' else 'client' end, auth.uid(),
          coalesce(who, 'Client'),
          case when p_accept then 'Confirmed the call ✅'
               else 'Can we find another time? 🙏' end);
end;
$$;

-- =============================================================================
-- Row-level security
-- =============================================================================
alter table profiles          enable row level security;
alter table staff             enable row level security;
alter table conversations     enable row level security;
alter table leads             enable row level security;
alter table messages          enable row level security;
alter table meetings          enable row level security;
alter table message_reactions enable row level security;
alter table staff_notes       enable row level security;
alter table quick_replies     enable row level security;

create policy "own or staff" on profiles for select using (id = auth.uid() or is_staff());
create policy "own insert" on profiles for insert with check (id = auth.uid());
create policy "own or staff update" on profiles for update using (id = auth.uid() or is_staff());

create policy "staff read staff" on staff for select using (is_staff() or user_id = auth.uid());
create policy "owner manages staff" on staff for all using (is_owner()) with check (is_owner());

create policy "own or staff" on conversations for select using (person_id = auth.uid() or is_staff());
create policy "staff update" on conversations for update using (is_staff());
create policy "owner delete" on conversations for delete using (is_owner());

create policy "own or staff" on leads for select using (person_id = auth.uid() or is_staff());
create policy "staff update" on leads for update using (is_staff());

create policy "visible thread" on messages for select using (can_see_conversation(conversation_id));
create policy "client writes own thread" on messages for insert with check (
  author = 'client' and author_id = auth.uid() and kind = 'message'
  and exists (select 1 from conversations c where c.id = conversation_id and c.person_id = auth.uid())
);
create policy "staff writes" on messages for insert with check (
  is_staff() and author = 'staff' and author_id = auth.uid()
);
-- Edit and unsend: your own messages only.
create policy "edit own" on messages for update using (author_id = auth.uid());

create policy "visible thread" on meetings for select using (can_see_conversation(conversation_id));
create policy "staff update" on meetings for update using (is_staff());

create policy "visible" on message_reactions for select using (
  exists (select 1 from messages m where m.id = message_id and can_see_conversation(m.conversation_id))
);
create policy "own" on message_reactions for insert with check (
  user_id = auth.uid()
  and exists (select 1 from messages m where m.id = message_id and can_see_conversation(m.conversation_id))
);
create policy "own update" on message_reactions for update using (user_id = auth.uid());
create policy "own delete" on message_reactions for delete using (user_id = auth.uid());

create policy "staff" on staff_notes for all using (is_staff()) with check (is_staff());
create policy "staff" on quick_replies for all using (is_staff()) with check (is_staff());

grant execute on function submit_inquiry, mark_seen, propose_meeting, respond_meeting,
  is_staff, is_owner, can_see_conversation to authenticated;

-- =============================================================================
-- Photos and videos in the chat: private bucket, folder = conversation id
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('message-media', 'message-media', false)
on conflict (id) do nothing;

drop policy if exists "chat media read" on storage.objects;
drop policy if exists "chat media write" on storage.objects;
create policy "chat media read" on storage.objects for select to authenticated using (
  bucket_id = 'message-media'
  and can_see_conversation(((storage.foldername(name))[1])::uuid)
);
create policy "chat media write" on storage.objects for insert to authenticated with check (
  bucket_id = 'message-media'
  and can_see_conversation(((storage.foldername(name))[1])::uuid)
);

-- =============================================================================
-- Live updates (the Inbox and Messages refetch the moment something lands)
-- =============================================================================
do $$
declare t text;
begin
  foreach t in array array['messages', 'conversations', 'leads', 'meetings', 'message_reactions'] loop
    begin
      execute format('alter publication supabase_realtime add table %I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
