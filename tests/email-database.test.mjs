import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { PGlite } from '@electric-sql/pglite'

test('email database: atomic submissions, RLS, rate limits and webhook retries', async () => {
  const db = new PGlite()
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth, public to anon, authenticated, service_role;
      grant execute on function auth.uid() to anon, authenticated, service_role;
    `)
    await db.exec(await readFile(new URL('../supabase/migrations/202609170001_email_management.sql', import.meta.url), 'utf8'))
    const id = randomUUID()
    const submit = (requestId, rate = 'hashed-ip') => db.query('select public.submit_contact($1,$2,$3,$4,$5,$6,$7)', [requestId, 'Client', 'client@example.com', 'web', 'ph-50k-100k', 'Build a portal', rate])
    await db.exec('set role service_role')
    await submit(id)
    await submit(id)
    assert.equal((await db.query('select count(*)::int as count from email_messages')).rows[0].count, 1)
    for (let n = 0; n < 4; n++) await submit(randomUUID())
    await assert.rejects(submit(randomUUID()), /RATE_LIMIT/)
    assert.equal((await db.query('select count(*)::int as count from email_threads')).rows[0].count, 5)

    const receive = (provider, sender = 'client@example.com') => db.query('select public.receive_email($1,$2,$3,$4,$5,$6,$7)', [provider, id, sender, 'reply@example.com', 'Re: project', 'A client reply', '<message@example.com>'])
    await db.query("update email_threads set status = 'closed' where id = $1", [id])
    await receive('provider-1'); await receive('provider-1')
    assert.equal((await db.query('select count(*)::int as count from email_messages where thread_id = $1', [id])).rows[0].count, 2)
    assert.equal((await db.query('select status from email_threads where id = $1', [id])).rows[0].status, 'open')
    await receive('provider-2', 'different@example.com')
    const other = (await db.query("select thread_id from email_messages where provider_id = 'provider-2'")).rows[0].thread_id
    assert.notEqual(other, id)

    await db.exec('reset role')
    const admin = randomUUID(), outsider = randomUUID()
    await db.query('insert into auth.users(id) values ($1), ($2)', [admin, outsider])
    await db.query('insert into email_admins values ($1)', [admin])
    await db.exec('set role anon')
    await assert.rejects(db.query('select * from email_threads'), /permission denied/)
    await assert.rejects(submit(randomUUID(), 'other-ip'), /permission denied/)
    await db.exec('reset role; set role authenticated')
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [outsider])
    assert.equal((await db.query('select * from email_threads')).rows.length, 0)
    assert.equal((await db.query('select * from email_messages')).rows.length, 0)
    await assert.rejects(db.query('insert into email_admins values ($1)', [outsider]), /permission denied/)
    await assert.rejects(receive('forged'), /permission denied/)
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [admin])
    assert.equal((await db.query('select * from email_threads')).rows.length, 6)
    await assert.rejects(db.query("update email_threads set status = 'closed'"), /permission denied/)
  } finally { await db.close() }
})
