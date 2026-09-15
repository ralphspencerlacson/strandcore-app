import { useEffect, useState } from 'react'
import './App.css'

const stats = [
  { label: 'Team', value: '4 founders' },
  { label: 'QA ratio', value: '1:3', accent: true },
  { label: 'First build', value: '2–3 weeks' },
  { label: 'Code stays', value: 'Yours' },
]

const coreBranches = [
  { path: 'M494 168 L469 143 V119 L433 83 H414 L403 48', x: 403, y: 48 },
  { path: 'M509 160 V124 L489 103 V76', x: 489, y: 76 },
  { path: 'M532 159 V112 L559 85 V29', x: 559, y: 29, copper: true },
  { path: 'M548 169 L571 145 V125 L621 75 V62 L651 34', x: 651, y: 34 },
  { path: 'M558 181 L593 146 H647', x: 647, y: 146 },
  { path: 'M562 200 H590 L610 184 H670', x: 670, y: 184 },
  { path: 'M561 212 H584 L602 229 H641 L664 253', x: 664, y: 253 },
  { path: 'M550 231 L579 264 H619 L657 301', x: 657, y: 301, copper: true },
  { path: 'M536 239 V265 L564 294 V310 L612 359', x: 612, y: 359 },
  { path: 'M522 243 V286 L530 303 V357', x: 530, y: 357, copper: true },
  { path: 'M509 241 V271 L479 301 V382', x: 479, y: 382, copper: true },
  { path: 'M493 232 L471 264 L439 295 V310 L402 348', x: 402, y: 348 },
  { path: 'M483 220 L457 244 V258 L431 278 H407 L384 316', x: 384, y: 316, copper: true },
  { path: 'M485 179 L455 151 H431 L406 126', x: 406, y: 126 },
]

function Strands({ loading = false }: { loading?: boolean }) {
  return (
    <svg className={loading ? 'loading-core' : 'strands'} viewBox={loading ? '453 139 134 122' : '0 0 720 400'} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="blue-strand" x1="0" y1="200" x2="510" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#619bf2" stopOpacity="0" />
          <stop offset="0.35" stopColor="#619bf2" stopOpacity="0.75" />
          <stop offset="1" stopColor="#91baff" />
        </linearGradient>
        <linearGradient id="copper-strand" x1="0" y1="310" x2="510" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d9956c" stopOpacity="0" />
          <stop offset="0.5" stopColor="#d9956c" stopOpacity="0.85" />
          <stop offset="1" stopColor="#e9ad86" />
        </linearGradient>
        <radialGradient id="core-glow">
          <stop stopColor="#8eb6ff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#8eb6ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="core-fill" cx="40%" cy="35%" r="75%">
          <stop stopColor="#a4ddff" />
          <stop offset="1" stopColor="#6eb3f5" />
        </radialGradient>
        <filter id="node-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="520" cy="200" r="105" fill="url(#core-glow)" />
      {!loading && <g>
      <g strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {coreBranches.map(({ path, x, y, copper }) => (
          <g key={path}>
            <path d={path} stroke={copper ? '#cc936f' : '#6bbcf6'} opacity="0.45" />
            <circle cx={x} cy={y} r="3" fill={copper ? '#ffc391' : '#b3e5ff'} filter="url(#node-glow)" />
          </g>
        ))}
      </g>
      <g fill="#a9ddff" filter="url(#node-glow)">
        <circle cx="469" cy="143" r="2" />
        <circle cx="590" cy="106" r="2" />
        <circle cx="631" cy="146" r="2" />
        <circle cx="626" cy="229" r="2" />
        <circle cx="580" cy="326" r="2" />
        <circle cx="459" cy="276" r="2" />
      </g>
      <g stroke="url(#blue-strand)" strokeWidth="4" strokeLinecap="round">
        <path d="M0 88 H180 C335 88 298 200 520 200" />
        <path d="M0 153 H175 C330 153 350 200 520 200" />
        <path d="M0 247 H175 C330 247 350 200 520 200" />
      </g>
      <path d="M0 313 H180 C335 313 298 200 520 200" stroke="url(#copper-strand)" strokeWidth="4" strokeLinecap="round" />
      </g>}
      <circle cx="520" cy="200" r="45" stroke="#529eea" strokeWidth="1" opacity="0.5" />
      <circle cx="520" cy="200" r="41" stroke="#65c8ff" strokeWidth="2" opacity="0.7" filter="url(#node-glow)" />
      <circle cx="520" cy="200" r="37" fill="url(#core-fill)" stroke="#a1deff" strokeWidth="1.5" />
    </svg>
  )
}

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <main className="loading-screen" role="status" aria-label="Loading Strandcore" aria-busy="true">
        <Strands loading />
      </main>
    )
  }

  return (
    <main className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <p className="eyebrow"><span className="eyebrow-dash" />Software studio <span className="separator">/</span> Metro Manila <span className="separator">/</span> GMT+8</p>
          <h1 id="hero-title">Four strands.<br />One <span>core</span>.</h1>
          <p className="hero-description">
            Three full-stack developers and a dedicated QA analyst,
            building software end to end. Small enough that you talk to the
            people writing the code — structured enough that nothing ships
            untested.
          </p>
          <div className="hero-actions">
            <button className="button button-primary" type="button">Scope a build <span aria-hidden="true">→</span></button>
            <button className="button button-secondary" type="button">Why the QA seat</button>
          </div>
          <dl className="stats">
            {stats.map(({ label, value, accent }) => (
              <div className="stat" key={label}>
                <dt>{label}</dt>
                <dd className={accent ? 'stat-accent' : undefined}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Strands />
      </section>
    </main>
  )
}

export default App
