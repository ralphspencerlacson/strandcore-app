import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Navbar from '../../components/navigation/Navbar'
import { Footer } from '../../components/contact/Contact'
import { contactDetails } from '../../data/contact'
import './ContactPage.css'
import { invokeEmail } from '../../lib/supabase'
import { budgetOptions } from '../../data/budgets'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const services = [
  { value: 'web', label: 'Web application' },
  { value: 'mobile', label: 'Mobile application' },
  { value: 'api', label: 'APIs & integrations' },
  { value: 'qa', label: 'Quality Assurance', option: 'Quality Assurance — audit or embedded tester' },
  { value: 'unsure', label: 'Not sure yet' },
]

// Keep the card available to restore when direct contact and booking are ready.
const showDirectContactCard = false
const showBookingPrompt = false

export default function ContactPage() {
  const reducedMotion = useReducedMotion()
  const panelMotion = {
    initial: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -6 },
    transition: { duration: reducedMotion ? 0 : 0.22 },
  }
  const [service, setService] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('service')
    return services.some(item => item.value === requested) ? requested! : 'web'
  })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [market, setMarket] = useState<'ph' | 'international'>('international')
  const [detectingLocation, setDetectingLocation] = useState(true)
  const [error, setError] = useState('')
  const requestId = useRef(crypto.randomUUID())
  const [fields, setFields] = useState({ name: '', email: '', budget: '', brief: '' })
  const confirmation = useRef<HTMLHeadingElement>(null)
  const isQa = service === 'qa'

  useEffect(() => {
    const controller = new AbortController()
    void fetch('/api/location', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(4000)]) })
      .then(response => response.ok ? response.json() : null)
      .then(location => {
        if (!controller.signal.aborted && location) {
          setMarket(location.country === 'PH' ? 'ph' : 'international')
        }
      }).catch(() => { /* Default to USD if country detection is unavailable. */ })
      .finally(() => { if (!controller.signal.aborted) setDetectingLocation(false) })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Contact — Strandcore'
    return () => { document.title = previousTitle }
  }, [])

  useEffect(() => {
    if (submitted) confirmation.current?.focus()
  }, [submitted])

  async function submitBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return
    setSending(true)
    setError('')
    try {
      await invokeEmail('contact-submit', { ...fields, budget: isQa ? '' : fields.budget, service, requestId: requestId.current })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your brief. Please try again.')
    } finally { setSending(false) }
  }

  return (
    <>
      <Navbar contactPage />
      <main className="contact-page" id="top">
        <section className="contact-page-intro" aria-labelledby="contact-page-title">
          <div className="contact-page-container">
            <nav className="contact-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Contact</span></nav>
            <h1 id="contact-page-title">Tell us what you’re building.</h1>
            <p>Bring the problem, not a spec. We’ll tell you honestly whether it’s a build, a buy, or a spreadsheet that’s fine as it is.</p>
          </div>
        </section>
        <div className="contact-page-container contact-page-body">
          <div className="brief-column">
            <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.section key="confirmation" {...panelMotion} onAnimationComplete={() => confirmation.current?.focus({ preventScroll: true })} className="brief-confirmation" aria-labelledby="brief-result-title">
                <span className="brief-confirmation-icon" aria-hidden="true">✓</span>
                <h2 id="brief-result-title" ref={confirmation} tabIndex={-1}>Your brief has been received.</h2>
                <p>Thanks, {fields.name.trim().split(/\s+/)[0]}. We’ve saved your brief and will reply to your email within one business day.</p>
                {showBookingPrompt && <div className="brief-booking">
                  <h3>Don’t want to wait?</h3>
                  <p>Put a 30-minute call straight in the calendar.</p>
                  <button className="button button-primary" disabled type="button">Pick a time <span aria-hidden="true">↗</span></button>
                  <small>Online booking coming soon.</small>
                </div>}
                <button className="brief-edit" type="button" onClick={() => { requestId.current = crypto.randomUUID(); setFields({ name: '', email: '', budget: '', brief: '' }); setSubmitted(false) }}>Send another brief</button>
              </motion.section>
            ) : (
              <motion.form key="brief" {...panelMotion} className={`project-brief${isQa ? ' project-brief-qa' : ''}`} onSubmit={submitBrief}>
                {isQa && <p className="brief-qa-notice"><span aria-hidden="true">ⓘ</span> Dedicated QA — an audit of your build or a tester embedded in your team.</p>}
                <div className="brief-identity">
                  <label htmlFor="brief-name">Your name<input id="brief-name" name="name" autoComplete="name" placeholder="Juan Dela Cruz" required maxLength={120} value={fields.name} onChange={event => setFields({ ...fields, name: event.target.value })} /></label>
                  <label htmlFor="brief-email">Email<input id="brief-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required maxLength={254} value={fields.email} onChange={event => setFields({ ...fields, email: event.target.value })} /></label>
                </div>
                <div className="brief-service">
                  <label htmlFor="brief-service">What do you need?<select id="brief-service" name="service" value={service} onChange={event => setService(event.target.value)}>{services.map(item => <option key={item.value} value={item.value}>{item.option ?? item.label}</option>)}</select></label>
                  <div className="brief-service-options" role="group" aria-label="Choose a service">{services.map(item => <button key={item.value} className={item.value === 'qa' ? 'brief-qa-chip' : undefined} type="button" aria-pressed={service === item.value} onClick={() => setService(item.value)}>{item.label}</button>)}</div>
                </div>
                {!isQa && <>
                  <label htmlFor="brief-budget">Indicative budget <span className="brief-optional">Optional</span><select id="brief-budget" name="budget" disabled={detectingLocation} aria-busy={detectingLocation} value={fields.budget} onChange={event => setFields({ ...fields, budget: event.target.value })}><option value="">{detectingLocation ? 'Loading budget ranges…' : 'Select a range'}</option>{budgetOptions[market].map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                </>}
                <label htmlFor="brief-description">{isQa ? 'What needs testing?' : 'What are you building?'}<textarea id="brief-description" name="brief" rows={7} required maxLength={5000} placeholder={isQa ? 'A booking app our own devs built. It’s live but we keep shipping regressions.' : 'A member portal for our HOA — dues, payments and announcements. We have a spreadsheet and a Viber group right now.'} value={fields.brief} onChange={event => setFields({ ...fields, brief: event.target.value })} /></label>
                {error && <p role="alert">{error}</p>}
                <div className="brief-submit-row"><button className="button button-primary" type="submit" disabled={sending}>{sending ? 'Sending…' : isQa ? 'Request the audit' : 'Send project brief'} <span aria-hidden="true">→</span></button><span>We reply within one business day.</span></div>
              </motion.form>
            )}
            </AnimatePresence>
          </div>
          <aside className="contact-page-aside" aria-label="What to expect">
            <section className="contact-info-card">
              <h2>What happens next</h2>
              <ol className="contact-next-steps">
                <li>We read and reply within one business day — a person, not an autoresponder.</li>
                <li>A 30-minute call with whoever would actually do the work. No sales rep.</li>
                <li>A written scope and an honest estimate — or a straight “this isn’t for us”.</li>
              </ol>
            </section>
            {showDirectContactCard && <section className="contact-info-card">
              <h2>Rather skip the form?</h2>
              <button className="contact-book-call" disabled type="button"><span aria-hidden="true">▦</span> Book a 30-min call</button>
              <p className="contact-booking-note">Online booking coming soon.</p>
              <dl className="contact-facts">
                <div><dt>Email</dt><dd>{contactDetails.email ? <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a> : '[YOUR EMAIL]'}</dd></div>
                <div><dt>Phone</dt><dd>[YOUR NUMBER]</dd></div>
                <div><dt>Hours</dt><dd>Mon–Fri, 9:00–18:00 GMT+8</dd></div>
                <div><dt>Overlap</dt><dd>Full day with SG &amp; AU · mornings with US West</dd></div>
              </dl>
            </section>}
            <p className="contact-overseas">Working with an overseas client? We invoice in USD or PHP and can sign your NDA before the first call.</p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}
