begin;
create table public.email_thread_reads (
 user_id uuid not null references auth.users(id) on delete cascade,
 thread_id uuid not null references public.email_threads(id) on delete cascade,
 read_at timestamptz not null,
 primary key(user_id, thread_id)
);
alter table public.email_thread_reads enable row level security;
create policy "Admins manage own read state" on public.email_thread_reads
 for all to authenticated
 using (user_id = (select auth.uid()) and exists(select 1 from public.email_admins where user_id = (select auth.uid())))
 with check (user_id = (select auth.uid()) and exists(select 1 from public.email_admins where user_id = (select auth.uid())));
revoke all on public.email_thread_reads from anon, authenticated;
grant select, insert, update on public.email_thread_reads to authenticated;
create view public.email_inbox with (security_invoker = true) as
 select t.*, (select count(*)::int from public.email_messages m
 where m.thread_id=t.id and m.direction='inbound' and m.created_at > coalesce(r.read_at, '-infinity'::timestamptz)) as unread_count
 from public.email_threads t left join public.email_thread_reads r on r.thread_id=t.id and r.user_id=(select auth.uid());
revoke all on public.email_inbox from anon, authenticated;
grant select on public.email_inbox to authenticated;
do $$ begin
 if not exists(select 1 from pg_publication where pubname='supabase_realtime') then
  create publication supabase_realtime;
 end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='email_threads') then
  alter publication supabase_realtime add table public.email_threads;
 end if;
end $$;
commit;
