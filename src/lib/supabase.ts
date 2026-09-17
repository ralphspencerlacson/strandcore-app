import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase = url && key ? createClient(url, key) : null

export async function invokeEmail<T>(name: string, body: Record<string, unknown>): Promise<T> {
  if (!supabase) throw new Error('Email service is not configured yet. Please contact us directly.')
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) {
    let message = error.message
    if (error.context instanceof Response) {
      const payload = await error.context.json().catch(() => null)
      message = payload?.error || message
    }
    throw new Error(message)
  }
  return data as T
}
