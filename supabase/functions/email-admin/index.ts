import { body, db, endpoint, env, field, HttpError, json, resend, uuid } from '../_shared/common.ts'
import { conversationCc } from '../_shared/email-copy.ts'
import { conversationSubject } from '../_shared/conversation.ts'

endpoint(async request => {
  const client = db()
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) throw new HttpError(401, 'Please sign in.')
  const { data: { user }, error: authError } = await client.auth.getUser(token)
  if (authError || !user) throw new HttpError(401, 'Your session expired. Please sign in again.')
  const { data: admin, error: adminError } = await client.from('email_admins').select('user_id').eq('user_id', user.id).maybeSingle()
  if (adminError) throw adminError
  if (!admin) throw new HttpError(403, 'This account does not have inbox access.')
  const input = await body(request)
  const threadId = uuid(input.threadId)
  const { data: thread, error: threadError } = await client.from('email_threads').select('*').eq('id', threadId).single()
  if (threadError || !thread) throw new HttpError(404, 'Conversation not found.')

  if (input.action === 'status') {
    if (!['open', 'closed'].includes(String(input.status))) throw new HttpError(400, 'Invalid status.')
    const { error } = await client.from('email_threads').update({ status: input.status, updated_at: new Date().toISOString() }).eq('id', threadId)
    if (error) throw error
    return json({ ok: true })
  }
  if (input.action !== 'reply') throw new HttpError(400, 'Invalid action.')
  const messageId = uuid(input.requestId)
  const text = field(input.text, 'reply', 10000)
  const { data: latest, error: latestError } = await client.from('email_messages').select('message_id').eq('thread_id', threadId)
    .eq('direction', 'inbound').not('message_id', 'is', null).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (latestError) throw latestError
  const payload = {
    from: env('EMAIL_FROM'), to: [thread.contact_email], cc: conversationCc(thread.contact_email),
    subject: conversationSubject(thread.subject, threadId),
    text, reply_to: `reply+${threadId}@${env('EMAIL_REPLY_DOMAIN')}`,
    ...(latest?.message_id ? { headers: { 'In-Reply-To': latest.message_id, References: latest.message_id } } : {}),
  }
  // Freeze the provider payload once, so concurrent requests/retries use identical content.
  const { error: insertError } = await client.from('email_messages').insert({
    id: messageId, thread_id: threadId, direction: 'outbound', sender: payload.from,
    recipient: thread.contact_email, body: text, status: 'pending', send_payload: payload,
  })
  if (insertError && insertError.code !== '23505') throw insertError
  const { data: message, error: messageError } = await client.from('email_messages').select('*').eq('id', messageId).single()
  if (messageError) throw messageError
  if (message.thread_id !== threadId || message.direction !== 'outbound' || message.body !== text) throw new HttpError(409, 'This reply identifier has already been used.')
  if (message.status === 'sent') return json({ sent: true })
  // Resend retains idempotency keys for 24 hours. Do not retry uncertain sends after that window.
  if (Date.now() - Date.parse(message.created_at) > 23 * 60 * 60 * 1000) throw new HttpError(409, 'Check this pending reply in Resend before sending again; the safe retry window has expired.')
  const result = await resend('/emails', {
    method: 'POST', headers: { 'Idempotency-Key': `reply/${messageId}` }, body: JSON.stringify(message.send_payload),
  })
  const { error: saveError } = await client.from('email_messages').update({ status: 'sent', provider_id: result.id }).eq('id', messageId)
  if (saveError) throw new HttpError(503, 'The provider accepted the reply but saving its status failed. Retry this same reply to reconcile it safely.')
  return json({ sent: true })
})
