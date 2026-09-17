import { body, db, email, endpoint, env, field, HttpError, json, uuid } from '../_shared/common.ts'

endpoint(async request => {
  const input = await body(request)
  const service = field(input.service, 'service', 20)
  if (!['web', 'mobile', 'api', 'qa', 'unsure'].includes(service)) throw new HttpError(400, 'Invalid service.')
  const budget = field(input.budget, 'budget', 30, true)
  if (!['', 'ph-under-50k', 'ph-50k-100k', 'ph-100k-400k', 'ph-over-400k', 'ph-unsure',
    'intl-under-2500', 'intl-2500-6000', 'intl-6000-15000', 'intl-over-15000', 'intl-unsure'].includes(budget)) throw new HttpError(400, 'Invalid budget.')
  const address = email(input.email)
  // Supabase's gateway supplies the forwarding header; hash it before storing.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${env('CONTACT_RATE_SALT')}:${ip}`))
  const rateKey = Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('')
  const { error } = await db().rpc('submit_contact', {
    p_id: uuid(input.requestId), p_name: field(input.name, 'name', 120), p_email: address,
    p_service: service, p_budget: budget, p_body: field(input.brief, 'brief', 5000), p_rate_key: rateKey,
  })
  if (error?.message.includes('RATE_LIMIT')) throw new HttpError(429, 'Too many enquiries. Please try again in an hour.')
  if (error) throw error
  return json({ received: true }, 201)
})
