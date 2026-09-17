import { createClient } from 'npm:@supabase/supabase-js@2.99.1'
import { providerErrorMessage } from './provider-error.ts'

export function env(name: string) {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing server configuration: ${name}`)
  return value
}
export const db = () => createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false },
})
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message) }
}
export function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
}
export function endpoint(handler: (request: Request) => Promise<Response>) {
  Deno.serve(async request => {
    const origin = request.headers.get('origin')
    const allowed = env('ALLOWED_ORIGINS').split(',').map(value => value.trim())
    if (origin && !allowed.includes(origin)) return json({ error: 'Origin not allowed.' }, 403)
    const headers = {
      'Access-Control-Allow-Origin': origin || allowed[0],
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
    }
    let response: Response
    try {
      if (request.method === 'OPTIONS') response = new Response(null, { status: 204 })
      else if (request.method !== 'POST') response = json({ error: 'Method not allowed.' }, 405)
      else response = await handler(request)
    } catch (error) {
      if (!(error instanceof HttpError)) console.error('Email operation failed:', error instanceof Error ? error.message : 'Database or provider error')
      response = json({ error: error instanceof HttpError ? error.message : 'Email service unavailable. Please try again.' }, error instanceof HttpError ? error.status : 500)
    }
    for (const [key, value] of Object.entries(headers)) response.headers.set(key, value)
    return response
  })
}
export async function body(request: Request) {
  const raw = await request.text()
  if (raw.length > 30000) throw new HttpError(413, 'Message is too large.')
  try {
    const value = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error()
    return value as Record<string, unknown>
  } catch { throw new HttpError(400, 'Invalid JSON request.') }
}
export function field(value: unknown, label: string, max: number, optional = false) {
  if (optional && (value === undefined || value === '')) return ''
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new HttpError(400, `Invalid ${label}.`)
  return value.trim()
}
export function uuid(value: unknown) {
  const id = field(value, 'identifier', 36)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new HttpError(400, 'Invalid identifier.')
  return id
}
export function email(value: unknown) {
  const address = field(value, 'email address', 254).toLowerCase()
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(address)) throw new HttpError(400, 'Invalid email address.')
  return address
}
export async function resend(path: string, init: RequestInit = {}) {
  const apiKey = env('RESEND_API_KEY')
  const response = await fetch(`https://api.resend.com${path}`, {
    ...init, headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', ...init.headers },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) {
    const details: unknown = await response.json().catch(() => null)
    throw new HttpError(502, providerErrorMessage(response.status, details, apiKey))
  }
  return response.json()
}
