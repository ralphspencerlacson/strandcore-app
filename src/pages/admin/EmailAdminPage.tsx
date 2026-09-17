import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { invokeEmail, supabase } from '../../lib/supabase'
import { budgetLabel } from '../../data/budgets'
import './EmailAdminPage.css'

type Thread = { id: string; contact_name: string; contact_email: string; subject: string; service: string | null; budget: string | null; status: 'open' | 'closed'; updated_at: string }
type Message = { id: string; direction: 'inbound' | 'outbound'; sender: string; body: string; status: 'received' | 'pending' | 'sent'; created_at: string }
const date = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.'

export default function EmailAdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('admin@strandcore.com')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState('open')
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.title = 'Email management — Strandcore'
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next); setChecking(false)
      if (!next) { setThreads([]); setSelected(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const refresh = useCallback(async () => {
    if (!supabase || !session) return
    setLoading(true); setError('')
    try {
      const { data: admin, error: accessError } = await supabase.from('email_admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      if (accessError) throw accessError
      if (!admin) throw new Error('This account does not have inbox access.')
      const { data, error: loadError } = await supabase.from('email_threads').select('*').order('updated_at', { ascending: false }).limit(500)
      if (loadError) throw loadError
      setThreads(data || [])
    } catch (err) { setError(errorText(err)) }
    finally { setLoading(false) }
  }, [session])

  // Fetching on a session change intentionally resets the loading indicator.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void refresh() }, [refresh])

  async function signIn(event: FormEvent) {
    event.preventDefault()
    if (!supabase) return
    setBusy(true); setError('')
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      setPassword('')
    } catch (err) { setError(errorText(err)) }
    finally { setBusy(false) }
  }

  const visible = threads.filter(thread => (filter === 'all' || thread.status === filter) && `${thread.contact_name} ${thread.contact_email} ${thread.subject}`.toLowerCase().includes(search.toLowerCase()))
  const active = threads.find(thread => thread.id === selected)

  return <main className="mail-app">
    <header className="mail-header"><a href="/" className="mail-brand">STRANDCORE<span> / EMAIL</span></a>{session && <div><span>{session.user.email}</span><button onClick={async () => { const result = await supabase!.auth.signOut(); if (result.error) setError(result.error.message) }}>Sign out</button></div>}</header>
    {!supabase ? <section className="mail-login"><h1>Email management</h1><p>Email service is not configured yet. Add the Supabase environment variables to enable sign-in.</p></section> : checking ? <p role="status">Checking your session…</p> : !session ? <form className="mail-login" onSubmit={signIn}>
      <span className="mail-eyebrow">TEAM WORKSPACE</span><h1>Your conversations,<br />in one place.</h1><p>Sign in to review enquiries and reply to clients.</p>
      <label>Email<input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
      {error && <p className="mail-error" role="alert">{error}</p>}<button className="mail-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in →'}</button>
    </form> : <>
      <div className="mail-title"><div><span className="mail-eyebrow">CLIENT CONVERSATIONS</span><h1>Inbox <span>{threads.filter(thread => thread.status === 'open').length}</span></h1></div><button disabled={loading} onClick={() => void refresh()}>{loading ? 'Refreshing…' : 'Refresh inbox'}</button></div>
      {error && <p className="mail-error" role="alert">{error}</p>}
      <div className={`mail-workspace${active ? ' has-conversation' : ''}`}><aside className="mail-sidebar" aria-label="Conversations">
        <label className="mail-search">Search conversations<input type="search" placeholder="Name, email or subject" value={search} onChange={event => setSearch(event.target.value)} /></label>
        <div className="mail-filters">{['open', 'closed', 'all'].map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
        <div className="mail-thread-list">{visible.map(thread => <button className={`mail-thread ${thread.id === selected ? 'is-active' : ''}`} key={thread.id} onClick={() => setSelected(thread.id)}><span className="mail-thread-top"><strong>{thread.contact_name}</strong><small>{thread.status}</small></span><span>{thread.subject}</span><small>{thread.contact_email}</small><time>{date(thread.updated_at)}</time></button>)}{!loading && !visible.length && <p className="mail-empty">No conversations here yet.</p>}{loading && !threads.length && <p className="mail-empty" role="status">Loading inbox…</p>}</div>
        <small className="mail-limit">Showing the latest 500 conversations.</small>
      </aside>{active ? <Conversation key={`${session.user.id}:${active.id}`} thread={active} onUpdate={refresh} onBack={() => setSelected(null)} /> : <section className="mail-welcome"><span aria-hidden="true">↗</span><h2>A good project starts<br />with a conversation.</h2><p>Select an enquiry to read it and reply.</p></section>}</div>
    </>}
  </main>
}

function Conversation({ thread, onUpdate, onBack }: { thread: Thread; onUpdate: () => Promise<void>; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const requestId = useRef(crypto.randomUUID())
  const attempted = useRef(false)
  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase!.from('email_messages').select('id,direction,sender,body,status,created_at').eq('thread_id', thread.id).order('created_at')
    if (loadError) throw loadError
    setMessages(data || [])
  }, [thread.id])
  // Message state is populated asynchronously from the selected conversation.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load().catch(err => setError(errorText(err))).finally(() => setLoading(false)) }, [load, thread.updated_at])

  async function reply(event: FormEvent) {
    event.preventDefault()
    await sendReply(requestId.current, draft)
  }
  async function sendReply(id: string, text: string) {
    if (busy) return
    setBusy(true); setError(''); setNotice(''); attempted.current = true
    try {
      await invokeEmail('email-admin', { action: 'reply', threadId: thread.id, requestId: id, text })
      setDraft(''); requestId.current = crypto.randomUUID(); attempted.current = false
      setNotice('Reply accepted by the email provider.')
      await load(); await onUpdate()
    } catch (err) { setError(errorText(err)); await load().catch(() => {}) }
    finally { setBusy(false) }
  }
  async function toggleStatus() {
    setBusy(true); setError('')
    try {
      await invokeEmail('email-admin', { action: 'status', threadId: thread.id, status: thread.status === 'open' ? 'closed' : 'open' })
      await onUpdate()
    } catch (err) { setError(errorText(err)) }
    finally { setBusy(false) }
  }
  return <section className="mail-conversation" aria-label="Selected conversation">
    <button className="mail-back" type="button" onClick={onBack}>← All conversations</button>
    <div className="mail-conversation-header"><div><span className="mail-eyebrow">{thread.status} CONVERSATION</span><h2>{thread.subject}</h2><p>{thread.contact_name} · {thread.contact_email}</p></div><button disabled={busy} onClick={() => void toggleStatus()}>{thread.status === 'open' ? 'Close conversation' : 'Reopen'}</button></div>
    {thread.service && <div className="mail-context"><span>Service: {thread.service}</span><span>Budget: {budgetLabel(thread.budget)}</span></div>}
    <div className="mail-messages" aria-live="polite">{loading ? <p>Loading conversation…</p> : messages.map(message => <article key={message.id} className={`mail-message ${message.direction}`}><div><strong>{message.direction === 'outbound' ? 'Strandcore' : thread.contact_name}</strong><span>{message.status === 'sent' ? 'Accepted by provider' : message.status === 'pending' ? 'Pending — confirm or retry' : 'Received'}</span></div><p>{message.body}</p><time>{date(message.created_at)}</time>{message.status === 'pending' && <button disabled={busy} onClick={() => void sendReply(message.id, message.body)}>Retry this reply</button>}</article>)}</div>
    <form className="mail-composer" onSubmit={reply}><label htmlFor="mail-reply">Reply to {thread.contact_email}</label><textarea id="mail-reply" rows={5} required maxLength={10000} placeholder="Write a thoughtful reply…" value={draft} disabled={busy} onChange={event => { if (attempted.current) { requestId.current = crypto.randomUUID(); attempted.current = false } setDraft(event.target.value) }} />
      {error && <p className="mail-error" role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}<div><small>Replies are sent by email. Client responses return to this conversation.</small><button className="mail-primary" disabled={busy || loading || !draft.trim() || messages.some(message => message.status === 'pending')}>{busy ? 'Working…' : 'Send reply ↗'}</button></div>
    </form>
  </section>
}
