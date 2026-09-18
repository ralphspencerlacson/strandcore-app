import { body, db, email, endpoint, env, field, HttpError, json, resend, uuid } from '../_shared/common.ts'
import { conversationSubject } from '../_shared/conversation.ts'
import { conversationCc, submissionConfirmation } from '../_shared/email-copy.ts'

endpoint(async request => {
  const input = await body(request)
  const service = field(input.service, 'service', 20)
  if (!['web', 'mobile', 'api', 'qa', 'unsure'].includes(service)) throw new HttpError(400, 'Invalid service.')
  const budget = field(input.budget, 'budget', 30, true)
  if (!['', 'ph-under-50k', 'ph-50k-100k', 'ph-100k-400k', 'ph-over-400k', 'ph-unsure',
    'intl-under-2500', 'intl-2500-6000', 'intl-6000-15000', 'intl-over-15000', 'intl-unsure'].includes(budget)) throw new HttpError(400, 'Invalid budget.')
  const address = email(input.email)
  const client = db()
  const threadId = uuid(input.requestId)
  const { error } = await client.rpc('submit_contact', {
    p_id: threadId, p_name: field(input.name, 'name', 120), p_email: address,
    p_service: service, p_budget: budget, p_body: field(input.brief, 'brief', 5000),
  })
  if (error) throw error
  // Use the saved enquiry on retries, never changed client input.
  const { data: thread, error: threadError } = await client.from('email_threads').select('*').eq('id', threadId).single()
  if (threadError) throw threadError
  const { data: original, error: originalError } = await client.from('email_messages').select('body').eq('thread_id', threadId).eq('direction', 'inbound').order('created_at').limit(1).single()
  if (originalError) throw originalError
  const text = submissionConfirmation(thread.contact_name, original.body)
  const payload = { from: env('EMAIL_FROM'), to: [thread.contact_email], cc: conversationCc(thread.contact_email),
    subject: conversationSubject(thread.subject, threadId), text,
    reply_to: 'reply+' + threadId + '@' + env('EMAIL_REPLY_DOMAIN') }
  // A stable ID and frozen payload protect retries from sending duplicates.
  const { error: insertError } = await client.from('email_messages').insert({ id: threadId, thread_id: threadId,
    direction: 'outbound', sender: payload.from, recipient: thread.contact_email, body: text,
    status: 'pending', send_payload: payload })
  if (insertError && insertError.code !== '23505') throw insertError
  const { data: message, error: messageError } = await client.from('email_messages').select('*').eq('id', threadId).single()
  if (messageError) throw messageError
  if (message.thread_id !== threadId || message.direction !== 'outbound') throw new HttpError(409, 'Submission identifier is already in use.')
  if (message.status === 'sent') return json({ received: true }, 201)
  if (Date.now() - Date.parse(message.created_at) > 23 * 60 * 60 * 1000) throw new HttpError(409, 'Your enquiry is saved. Please contact us to check the confirmation email.')
  const result = await resend('/emails', { method: 'POST', headers: { 'Idempotency-Key': 'reply/' + threadId }, body: JSON.stringify(message.send_payload) })
  const { error: saveError } = await client.from('email_messages').update({ status: 'sent', provider_id: result.id }).eq('id', threadId)
  if (saveError) throw new HttpError(503, 'Your enquiry is saved. Please retry to confirm the email status.')
  return json({ received: true }, 201)
})
