import { useEffect, useState } from 'react'
import Brand from '../brand/Brand'
import './Navbar.css'

const links = ['Services', 'Quality', 'Process', 'Team', 'Contact']

export default function Navbar({ loading = false }: { loading?: boolean }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      setScrolled(window.scrollY > 24)
      let current = ''
      for (const link of links) {
        const section = document.getElementById(link.toLowerCase())
        if (section && section.getClientRects().length && section.getBoundingClientRect().top <= window.innerHeight * 0.35) {
          current = link
        }
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = 'Contact'
      setActive(current)
    }
    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        document.getElementById('navigation-toggle')?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${loading ? ' is-loading' : ''}`} inert={loading}>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand-link" href="#top" onClick={() => setOpen(false)} aria-label="Strandcore home"><Brand /></a>
        <button id="navigation-toggle" className="nav-toggle" type="button" aria-expanded={open} aria-controls="navigation-links" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}<span aria-hidden="true">{open ? '−' : '+'}</span></button>
        <div id="navigation-links" className={`nav-links${open ? ' is-open' : ''}`}>
          {links.map(link => <a key={link} href={`#${link.toLowerCase()}`} aria-current={active === link ? 'location' : undefined} onClick={() => setOpen(false)}>{link}</a>)}
          <a className="nav-project" href="#contact" onClick={() => setOpen(false)}>Start a project <span aria-hidden="true">→</span></a>
        </div>
      </nav>
    </header>
  )
}
