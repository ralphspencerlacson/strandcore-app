import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AmbientBackground, Hero } from '../../components/hero'
import type { HeroPhase } from '../../components/hero'
import { landingStats } from './landing.data'
import './LandingPage.css'

export default function LandingPage() {
  const [phase, setPhase] = useState<HeroPhase>('loading')
  const reducedMotion = Boolean(useReducedMotion())

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase(reducedMotion ? 'ready' : 'moving'), 1200)
    return () => window.clearTimeout(timer)
  }, [reducedMotion])

  const intro = phase === 'loading' || phase === 'moving'

  return (
    <main className="landing" aria-busy={intro} data-phase={phase}>
      <AmbientBackground />
      {intro && <motion.div className="intro-backdrop" initial={false}
        animate={{ opacity: phase === 'loading' ? 1 : 0 }} transition={{ duration: 0.85 }} />}
      {phase === 'loading' && <span className="sr-only" role="status">Loading Strandcore</span>}
      <Hero phase={phase} reducedMotion={reducedMotion} stats={landingStats}
        onMoveComplete={() => setPhase('drawing')} onDrawComplete={() => setPhase('ready')} />
    </main>
  )
}
