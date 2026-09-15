import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AmbientBackground, Hero } from '../../components/hero'
import type { HeroPhase } from '../../components/hero'
import Services from '../../components/services/Services'
import Quality from '../../components/quality/Quality'
import Navbar from '../../components/navigation/Navbar'
import Process from '../../components/process/Process'
import Team from '../../components/team/Team'
import Contact, { Footer } from '../../components/contact/Contact'
import { landingStats } from './data/landing.data'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import './styles/LandingPage.css'
import './styles/ScrollMotion.css'

export default function LandingPage() {
  const [phase, setPhase] = useState<HeroPhase>('loading')
  const reducedMotion = Boolean(useReducedMotion())
  const landingRef = useScrollReveal(reducedMotion)

  useEffect(() => {
    const timer = window.setTimeout(
      () => setPhase(reducedMotion ? 'ready' : 'moving'),
      1200,
    )
    return () => window.clearTimeout(timer)
  }, [reducedMotion])

  const intro = phase === 'loading' || phase === 'moving'

  return (
    <>
      <Navbar loading={phase !== 'ready'} />
      <main ref={landingRef} id="top" className="landing" aria-busy={intro} data-phase={phase}>
        {intro && (
          <motion.div
            className="intro-backdrop"
            initial={false}
            animate={{ opacity: phase === 'loading' ? 1 : 0 }}
            transition={{ duration: 0.85 }}
          />
        )}
        {phase === 'loading' && (
          <span className="sr-only" role="status">
            Loading Strandcore
          </span>
        )}
        <div className="landing-hero">
          <AmbientBackground />
          <Hero
            phase={phase}
            reducedMotion={reducedMotion}
            stats={landingStats}
            onMoveComplete={() => setPhase('drawing')}
            onDrawComplete={() => setPhase('ready')}
          />
        </div>
        <Services />
        <Quality />
        <Process />
        <Team />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
