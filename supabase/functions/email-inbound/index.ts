import { Webhook } from 'npm:svix@1.84.1'
import { convert } from 'npm:html-to-text@9.0.5'
import { db, email, env, json, resend } from '../_shared/common.ts'

Deno.serve(async request => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  const raw = await request.text()
  if (raw.length > 100000) return json({ error: 'Payload too large.' }, 413)
  let event: { type: string; data: { email_id: string } }
  try {
    event = new Webhook(env('RESEND_WEBHOOK_SECRET')).verify(raw, {
      'svix-id': request.headers.get('svix-id') || '',
      'svix-timestamp': request.headers.get('svix-timestamp') || '',
      'svix-signature': request.headers.get('svix-signature') || '',
    }) as typeof event
  } catch { return json({ error: 'Invalid webhook signature.' }, 401) }
  if (event.type !== 'email.received') return json({ ignored: true })
  try {
    const received = await resend(`/emails/receiving/${encodeURIComponent(event.data.email_id)}`)
    const recipients: string[] = received.to || []
    const domain = env('EMAIL_REPLY_DOMAIN').toLowerCase()
    const inbox = env('EMAIL_INBOUND_ADDRESS').toLowerCase()
    const recipient = recipients.find(value => {
      const address = value.toLowerCase()
      return address === inbox || (address.startsWith('reply+') && address.endsWith(`@${domain}`))
    })
    if (!recipient) return json({ ignored: true })
    const match = recipient.match(/^reply\+([0-9a-f-]{36})@/i)
    const threadId = match && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(match[1]) ? match[1] : null
    const sender = email(received.from)
    // Plain text only in the inbox: remote images, scripts and HTML never render.
    const text = received.text || (received.html ? convert(received.html, { wordwrap: false }) : '[No text content]')
    const attachments = received.attachments?.length ? '\n\n[This email includes attachments. View them in the Resend dashboard.]' : ''
    const { error } = await db().rpc('receive_email', {
      p_provider_id: received.id, p_thread_id: threadId, p_sender: sender, p_recipient: recipient,
      p_subject: (received.subject || '(No subject)').slice(0, 500),
      p_body: text.slice(0, 100000) + attachments, p_message_id: received.message_id || null,
    })
    if (error) throw error
    return json({ received: true })
  } catch {
    console.error('Inbound email processing failed; webhook should be retried.')
    return json({ error: 'Could not save received email.' }, 500)
  }
})
