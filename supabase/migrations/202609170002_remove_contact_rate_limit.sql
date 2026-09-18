begin;

-- Retain the optional final argument for compatibility with existing deployments.
-- It is no longer used or stored.
create or replace function public.submit_contact(p_id uuid, p_name text, p_email text,
  p_service text, p_budget text, p_body text, p_rate_key text default null)
returns uuid language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_id::text, 0));
  if exists(select 1 from email_threads where id = p_id) then return p_id; end if;
  insert into email_threads(id, contact_name, contact_email, subject, service, budget)
    values(p_id, p_name, p_email, 'Project enquiry: ' || p_service, p_service, p_budget);
  insert into email_messages(thread_id, direction, sender, recipient, body, status)
    values(p_id, 'inbound', p_email, 'Contact form', p_body, 'received');
  return p_id;
end $$;
revoke all on function public.submit_contact(uuid,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_contact(uuid,text,text,text,text,text,text) to service_role;

drop table if exists public.email_rate_limits;

commit;
