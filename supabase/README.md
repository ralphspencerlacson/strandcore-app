# Strandcore email setup

The app now has a working Supabase integration boundary and an inbox at `/admin/email` (also `/admin`). Deployment needs your Supabase project and Resend credentials. No production database changes or emails are made by building the app.

## 1. Database

For a new project, run the SQL files in `supabase/migrations` in filename order. For an existing project, apply only unapplied migrations. `202609170002_remove_contact_rate_limit.sql` removes the contact submission limit. Alternatively, with migration history aligned, link the Supabase CLI project and run `supabase db push`.

This creates conversations, messages, admin membership, RLS policies, and transactional functions for contact submissions and inbound emails. Anonymous clients cannot read the inbox or write these tables directly. Only explicitly provisioned admin users can read it; all mutations pass through server validation.

## 2. Static admin account

Create a private `.env.admin.local` in the repository root (already gitignored):

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_PASSWORD="YOUR_REQUESTED_PASSWORD"
```

Use the password supplied for this task as `ADMIN_PASSWORD`. Run:

```sh
node --env-file=.env.admin.local scripts/create-email-admin.mjs
```

This creates `admin@strandcore.com` through Supabase Auth, confirms the account, and grants inbox access. It does not put the password in frontend code or SQL. If the user already exists, add `ADMIN_USER_ID` from Supabase Auth and rerun; the script keeps the existing password. Do not expose the service role key through a `VITE_` variable. Disable public signups in Supabase Auth if this project only needs the admin login.

## 3. Resend and Edge Functions

Verify a sending domain in Resend and enable a receiving domain. A dedicated receiving subdomain avoids changing an existing mailbox's MX routing. This integration manages contact enquiries and new emails routed through Resend; it does not import an existing Gmail/IMAP mailbox.

The public address and configured sender are `inquire@strandcore.tech`. Keep its existing Cloudflare routing in place. The example uses `reply.strandcore.tech` as a separate Resend receiving domain; configure that subdomain before using it. Verify `strandcore.tech` for sending in Resend. Email arriving at the existing Cloudflare address will continue following its Cloudflare routing rule, and will not automatically appear in this app. To include those new enquiries in the app, forward that rule to the verified Resend receiving address `inquire@reply.strandcore.tech`. Outgoing app replies already direct client responses to the conversation-specific address on the receiving subdomain.

Copy `supabase/.env.example` to `supabase/.env.local` and fill in all values. `EMAIL_FROM` is the verified sender; `EMAIL_REPLY_DOMAIN` is the receiving domain; `EMAIL_INBOUND_ADDRESS` accepts new conversations. Set exact production and local origins in `ALLOWED_ORIGINS`. The contact function no longer requires `CONTACT_RATE_SALT`.

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set --env-file supabase/.env.local
supabase functions deploy contact-submit
supabase functions deploy email-admin
supabase functions deploy email-inbound
```

Supabase injects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` into hosted functions. Keep `verify_jwt = false` as configured: the contact endpoint is public, the admin endpoint validates the user using Auth and the admin table, and the webhook verifies its Svix signature.

In Resend, create an `email.received` webhook at:

```text
https://YOUR_PROJECT.supabase.co/functions/v1/email-inbound
```

Copy its signing secret to `RESEND_WEBHOOK_SECRET` and update the function secrets. Use a Resend API key with sending and receiving access. Incoming client replies to `reply+CONVERSATION_UUID@EMAIL_REPLY_DOMAIN` return to their conversation. A sender different from the original contact starts a separate conversation. Incoming messages reopen closed conversations. HTML is converted to text; attachment content is currently available only in the Resend dashboard. Provider acceptance is displayed separately from delivery; bounce/delivery event tracking is not included.

## 4. Frontend and location

Copy root `.env.example` to `.env.local` and set the project URL and public publishable key. Add the same variables to the website build environment. Restart Vite after changing them.

```sh
npm run dev
npm run build
```

The Cloudflare Worker exposes `/api/location`, using Cloudflare's visitor country metadata without requesting device location. Philippines visitors default to PHP; every other country defaults to USD. Missing location metadata also defaults to USD. Responses are private and uncached. The location selector is hidden; budget selection waits for detection (up to four seconds) so the currency cannot change after a visitor picks a range. Local development country data may not reflect your actual location.

PHP ranges: under ₱50k; ₱50k–₱100k; ₱100k–₱400k; over ₱400k; unsure.
USD ranges: under $2,500; $2,500–$6,000; $6,000–$15,000; over $15,000; unsure.

## Verification after configuring services

Local checks:

```sh
npm test
npm run lint
npm run build
npx --yes deno check --node-modules-dir=none --no-lock supabase/functions/contact-submit/index.ts supabase/functions/email-admin/index.ts supabase/functions/email-inbound/index.ts
```

The database tests run the migrations in embedded PostgreSQL and exercise role permissions, submissions beyond the former limit, idempotency, and incoming conversation routing. The location tests cover PH, non-PH, missing country metadata, and the exact budget ranges.

1. Submit a contact brief and verify one conversation exists. Retry the same request ID and verify it does not duplicate.
2. Sign in at `/admin/email`. Confirm a different Auth user cannot read conversations or invoke admin actions.
3. Send a reply to a mailbox you control, then reply from that mailbox and refresh the inbox. Verify both messages appear in the same conversation.
4. Replay a signed inbound event and verify no duplicate message. Invalid signatures must return 401.
5. Test a provider failure. The reply remains pending with a retry button; retries reuse the same immutable payload and idempotency key. After 23 hours, inspect Resend manually rather than risking a duplicate beyond its 24-hour key retention.
6. Check `/api/location` from PH and non-PH connections and both sets of budget options. When detection fails or times out, confirm the budget selector becomes available with USD ranges.

The contact endpoint has no application-level per-IP submission limit. Input validation, admin permissions, and duplicate-request protection remain enabled. The inbox currently loads the latest 500 conversations and refreshes on request; it is not a realtime mailbox client.

References: [Supabase Auth validation](https://supabase.com/docs/reference/javascript/auth-getuser), [Resend receiving](https://resend.com/docs/dashboard/receiving/introduction), [Resend reply threading](https://resend.com/docs/dashboard/receiving/reply-to-emails), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [Cloudflare request metadata](https://developers.cloudflare.com/workers/runtime-apis/request/).

### Submission confirmation and CC

New contact submissions save the enquiry and send a confirmation to the customer's address with `inquire@strandcore.tech` in CC. New admin replies include the same CC. Reply-To remains the conversation alias, so customer replies return to Email Management. Customers should use Reply all to retain CC recipients; a normal reply does not automatically copy them. Existing pending messages retain their original recipient payload for safe retries.

Confirmation emails are stored as outbound pending/sent messages. Retrying the same form submission reuses the frozen payload and the same Resend idempotency key as an admin retry of that pending confirmation. After 23 hours, reconcile an uncertain send manually rather than risk a duplicate. No historical enquiries are emailed automatically.
