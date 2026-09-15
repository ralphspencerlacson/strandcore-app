import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useTime, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'
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

const strands = [
  { outward: 'M520 200 C298 200 335 88 180 88 H0', inward: 'M0 88 H180 C335 88 298 200 520 200' },
  { outward: 'M520 200 C350 200 330 153 175 153 H0', inward: 'M0 153 H175 C330 153 350 200 520 200' },
  { outward: 'M520 200 C350 200 330 247 175 247 H0', inward: 'M0 247 H175 C330 247 350 200 520 200' },
  { outward: 'M520 200 C298 200 335 313 180 313 H0', inward: 'M0 313 H180 C335 313 298 200 520 200', copper: true },
]

type Phase = 'loading' | 'moving' | 'drawing' | 'ready'
const flightTime = 0.72
const cycleTime = 1.6
const stagger = 0.22

function EnergyChannel({ time, index }: { time: MotionValue<number>; index: number }) {
  const strand = strands[index]
  const elapsed = useTransform(time, (ms) => ms / 1000 - index * stagger)
  const progress = useTransform(elapsed, (seconds) => seconds < 0 ? 0 : Math.min((seconds % cycleTime) / flightTime, 1))
  const offset = useTransform(progress, (value) => 0.08 - value * 1.08)
  const shineOpacity = useTransform(elapsed, (seconds) => seconds >= 0 && seconds % cycleTime < flightTime ? 1 : 0)
  // The same clock drives the light's arrival and its matching node group.
  const glow = useTransform(elapsed, (seconds) => {
    const sinceArrival = seconds % cycleTime - flightTime
    return seconds >= 0 && sinceArrival >= 0 && sinceArrival < 0.45
      ? Math.pow(1 - sinceArrival / 0.45, 2)
      : 0
  })
  const glowRadius = useTransform(glow, (value) => 3 + value * 4)
  const ringOpacity = useTransform(glow, (value) => value * 0.65)

  return (
    <g>
      <motion.path className="energy-shine" d={strand.inward} pathLength={1}
        stroke={strand.copper ? '#ffe0b8' : '#d4f2ff'} strokeWidth="3"
        strokeDasharray="0.08 1" style={{ strokeDashoffset: offset, opacity: shineOpacity }} />
      <motion.g style={{ opacity: glow }} className="node-flash">
        {coreBranches.filter((branch, branchIndex) => branch.copper ? index === 3 : index === branchIndex % 3).map((branch) => (
          <g key={branch.path}>
            <path d={branch.path} stroke={branch.copper ? '#efb68b' : '#91d8ff'} strokeWidth="2" />
            <motion.circle cx={branch.x} cy={branch.y} r={glowRadius} fill={branch.copper ? '#ffdbaf' : '#d9f4ff'} />
          </g>
        ))}
      </motion.g>
      <motion.circle cx="520" cy="200" r="43" stroke={strand.copper ? '#ffd1a0' : '#bcf0ff'} strokeWidth="3" style={{ opacity: ringOpacity }} />
    </g>
  )
}

function EnergyFlow() {
  const time = useTime()
  return <g>{strands.map((_, index) => <EnergyChannel key={index} time={time} index={index} />)}</g>
}

function Core({ phase, reducedMotion }: { phase: Phase; reducedMotion: boolean }) {
  const loading = phase === 'loading'
  const pulsing = !reducedMotion && phase !== 'moving'
  const duration = loading ? 0.9 : 1.8
  return (
    <motion.svg className="living-core" viewBox="-105 -105 210 210" fill="none" aria-hidden="true"
      animate={{ scale: pulsing ? (loading ? [1, 1.12, 0.99, 1.065, 1] : [1, 1.035, 1]) : 1 }}
      transition={pulsing ? { duration, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.15 }}>
      <defs>
        <radialGradient id="core-glow">
          <stop stopColor="#8eb6ff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#8eb6ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="core-fill" cx="40%" cy="35%" r="75%">
          <stop stopColor="#a4ddff" />
          <stop offset="1" stopColor="#6eb3f5" />
        </radialGradient>
      </defs>
      <motion.circle className="core-halo" r="105" fill="url(#core-glow)"
        animate={{ opacity: pulsing ? [0.55, 1, 0.55] : 0.8, scale: pulsing ? [0.85, 1.12, 0.85] : 1 }}
        transition={{ duration, repeat: pulsing ? Infinity : 0, ease: 'easeInOut' }} />
      {pulsing && <motion.circle className="core-ripple" stroke="#87d5ff" strokeWidth="1"
        initial={{ r: 44, opacity: 0 }} animate={{ r: [44, loading ? 72 : 61], opacity: [0, loading ? 0.5 : 0.25, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'easeOut' }} />}
      <circle r="45" stroke="#529eea" opacity="0.5" />
      <circle className="core-ring" r="41" stroke="#65c8ff" strokeWidth="2" opacity="0.7" />
      <circle r="37" fill="url(#core-fill)" stroke="#a1deff" strokeWidth="1.5" />
    </motion.svg>
  )
}

function Strands({ phase, reducedMotion, onMoveComplete, onDrawComplete }: {
  phase: Phase
  reducedMotion: boolean
  onMoveComplete: () => void
  onDrawComplete: () => void
}) {
  const draw = phase === 'drawing' || phase === 'ready'
  return (
    <div className="strands" aria-hidden="true">
      <svg className="strand-network" viewBox="0 0 720 400" fill="none">
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
        </defs>
        <g strokeLinecap="round" strokeLinejoin="round" visibility={draw ? 'visible' : 'hidden'}>
          {coreBranches.map(({ path, x, y, copper }, index) => (
            <g key={path}>
              <motion.path d={path} stroke={copper ? '#cc936f' : '#6bbcf6'} strokeWidth="1.8" opacity="0.45"
                initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.65, delay: draw && !reducedMotion ? index * 0.025 : 0 }} />
              <motion.circle className="circuit-node" cx={x} cy={y} r="3" fill={copper ? '#ffc391' : '#b3e5ff'}
                initial={{ opacity: 0 }} animate={{ opacity: draw ? 1 : 0 }}
                transition={{ duration: 0.2, delay: draw && !reducedMotion ? 0.5 + index * 0.025 : 0 }} />
            </g>
          ))}
          {strands.map((strand, index) => (
            <motion.path key={strand.outward} d={strand.outward} stroke={`url(#${strand.copper ? 'copper' : 'blue'}-strand)`} strokeWidth="4"
              initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.85, delay: draw && !reducedMotion ? index * 0.07 : 0, ease: 'easeInOut' }}
              onAnimationComplete={index === strands.length - 1 && phase === 'drawing' ? onDrawComplete : undefined} />
          ))}
          {phase === 'ready' && !reducedMotion && <EnergyFlow />}
        </g>
      </svg>
      {!reducedMotion && [5, 4, 3, 2, 1].map((index) => (
        <motion.div key={index} layout
          className={`core-anchor core-trace${phase === 'loading' ? ' core-anchor-loading' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'moving' ? [0, 0.38 - index * 0.045, 0] : 0 }}
          transition={{
            layout: { duration: 0.85, delay: index * 0.045, ease: [0.65, 0, 0.35, 1] },
            opacity: { duration: phase === 'moving' ? 1.1 : 0.25, times: [0, 0.25, 1] },
          }}>
          <svg viewBox="-105 -105 210 210" fill="none">
            <circle r="45" stroke="#76c9ff" strokeWidth="1.5" />
            <circle r="39" fill="#83caff" fillOpacity="0.25" stroke="#a0deff" strokeWidth="2" />
          </svg>
        </motion.div>
      ))}
      <motion.div layout className={`core-anchor${phase === 'loading' ? ' core-anchor-loading' : ''}`}
        transition={{ layout: { duration: reducedMotion ? 0 : 0.85, ease: [0.65, 0, 0.35, 1] } }}
        onLayoutAnimationComplete={phase === 'moving' ? onMoveComplete : undefined}>
        <Core phase={phase} reducedMotion={reducedMotion} />
      </motion.div>
    </div>
  )
}

function App() {
  const [phase, setPhase] = useState<Phase>('loading')
  const reducedMotion = Boolean(useReducedMotion())

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase(reducedMotion ? 'ready' : 'moving'), 1200)
    return () => window.clearTimeout(timer)
  }, [reducedMotion])

  const intro = phase === 'loading' || phase === 'moving'

  return (
    <main className="landing" aria-busy={intro} data-phase={phase}>
      {intro && <motion.div className="intro-backdrop" initial={false} animate={{ opacity: phase === 'loading' ? 1 : 0 }} transition={{ duration: 0.85 }} />}
      {phase === 'loading' && <span className="sr-only" role="status">Loading Strandcore</span>}
      <section className="hero" aria-labelledby="hero-title">
        <motion.div className="hero-content" inert={intro}
          initial={{ opacity: 0 }} animate={{ opacity: phase === 'loading' ? 0 : 1 }} transition={{ duration: reducedMotion ? 0 : 0.65, delay: reducedMotion ? 0 : 0.25 }}>
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
        </motion.div>
        <Strands phase={phase} reducedMotion={reducedMotion}
          onMoveComplete={() => setPhase('drawing')} onDrawComplete={() => setPhase('ready')} />
      </section>
    </main>
  )
}

export default App
