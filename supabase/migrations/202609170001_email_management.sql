begin;

create table public.email_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.email_admins enable row level security;
create policy "Admins can check own membership" on public.email_admins
  for select to authenticated using (user_id = (select auth.uid()));

create table public.email_threads (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  contact_email text not null,
  subject text not null,
  service text,
  budget text,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index email_threads_updated_idx on public.email_threads(updated_at desc);

create table public.email_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.email_threads(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  sender text not null,
  recipient text not null,
  body text not null,
  status text not null check (status in ('received', 'pending', 'sent')),
  provider_id text unique,
  message_id text,
  send_payload jsonb,
  created_at timestamptz not null default now()
);
create index email_messages_thread_idx on public.email_messages(thread_id, created_at);

alter table public.email_threads enable row level security;
alter table public.email_messages enable row level security;
create policy "Admins read threads" on public.email_threads for select to authenticated
  using (exists (select 1 from public.email_admins where user_id = (select auth.uid())));
create policy "Admins read messages" on public.email_messages for select to authenticated
  using (exists (select 1 from public.email_admins where user_id = (select auth.uid())));
revoke all on public.email_admins, public.email_threads, public.email_messages from anon, authenticated;
grant select on public.email_admins, public.email_threads, public.email_messages to authenticated;
grant all on public.email_admins, public.email_threads, public.email_messages to service_role;

create table public.email_rate_limits (
  key text primary key,
  bucket timestamptz not null,
  count integer not null
);
alter table public.email_rate_limits enable row level security;
revoke all on public.email_rate_limits from anon, authenticated;

-- Atomic insert and rate limit. Only the Edge Function can execute this RPC.
create function public.submit_contact(p_id uuid, p_name text, p_email text,
  p_service text, p_budget text, p_body text, p_rate_key text)
returns uuid language plpgsql security definer set search_path = public as $$
declare hits integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  if exists(select 1 from email_threads where id = p_id) then return p_id; end if;
  delete from email_rate_limits where bucket < now() - interval '1 day';
  insert into email_rate_limits(key, bucket, count) values (p_rate_key, date_trunc('hour', now()), 1)
  on conflict(key) do update set
    count = case when email_rate_limits.bucket = excluded.bucket then email_rate_limits.count + 1 else 1 end,
    bucket = excluded.bucket returning count into hits;
  if hits > 5 then raise exception 'RATE_LIMIT'; end if;
  insert into email_threads(id, contact_name, contact_email, subject, service, budget)
    values(p_id, p_name, p_email, 'Project enquiry: ' || p_service, p_service, p_budget);
  insert into email_messages(thread_id, direction, sender, recipient, body, status)
    values(p_id, 'inbound', p_email, 'Contact form', p_body, 'received');
  return p_id;
end $$;
revoke all on function public.submit_contact(uuid,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_contact(uuid,text,text,text,text,text,text) to service_role;

-- One transaction prevents duplicate messages and orphan threads on webhook retries.
create function public.receive_email(p_provider_id text, p_thread_id uuid, p_sender text,
  p_recipient text, p_subject text, p_body text, p_message_id text)
returns uuid language plpgsql security definer set search_path = public as $$
declare target uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_provider_id, 0));
  select thread_id into target from email_messages where provider_id = p_provider_id;
  if target is not null then return target; end if;
  -- A reply alias alone does not authorize a different sender to join a conversation.
  select id into target from email_threads where id = p_thread_id and lower(contact_email) = lower(p_sender);
  if target is null then
    insert into email_threads(contact_name, contact_email, subject)
      values(p_sender, p_sender, p_subject) returning id into target;
  end if;
  insert into email_messages(thread_id, direction, sender, recipient, body, status, provider_id, message_id)
    values(target, 'inbound', p_sender, p_recipient, p_body, 'received', p_provider_id, p_message_id);
  update email_threads set status = 'open', updated_at = now() where id = target;
  return target;
end $$;
revoke all on function public.receive_email(text,uuid,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.receive_email(text,uuid,text,text,text,text,text) to service_role;

create function public.touch_email_thread() returns trigger language plpgsql
  security definer set search_path = public as $$
begin
  update email_threads set updated_at = now() where id = new.thread_id;
  return new;
end $$;
create trigger email_message_activity after insert or update on public.email_messages
  for each row execute function public.touch_email_thread();

commit;
