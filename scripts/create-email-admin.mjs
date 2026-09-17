import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_PASSWORD) {
  throw new Error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_PASSWORD in a private .env.admin.local file.')
}
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const email = 'admin@strandcore.com'
// Existing accounts require an explicit ID; never reset an existing password implicitly.
let id = process.env.ADMIN_USER_ID
if (id) {
  const { data, error } = await client.auth.admin.getUserById(id)
  if (error) throw error
  if (data.user.email !== email) throw new Error('ADMIN_USER_ID must belong to admin@strandcore.com.')
} else {
  const { data, error } = await client.auth.admin.createUser({ email, password: ADMIN_PASSWORD, email_confirm: true })
  if (error) throw new Error(`${error.message}. If the account already exists, set ADMIN_USER_ID to its Auth user ID and rerun.`)
  id = data.user.id
}
const { error } = await client.from('email_admins').upsert({ user_id: id })
if (error) throw error
console.log('Admin account is ready: admin@strandcore.com')
