import { motion } from 'motion/react'
import HeroActions from './HeroActions'
import HeroStats from './HeroStats'
import { createHeroReveal } from './content.motion'
import type { HeroPhase, HeroStat } from '../../types/hero.types'

export default function HeroContent({
  phase,
  reducedMotion,
  stats,
}: {
  phase: HeroPhase
  reducedMotion: boolean
  stats: readonly HeroStat[]
}) {
  const intro = phase === 'loading' || phase === 'moving'
  const reveal = createHeroReveal(phase, reducedMotion)
  return (
    <div className="hero-content" inert={intro}>
      <motion.p className="eyebrow" {...reveal(0)}>
        <span className="eyebrow-dash" />
        Software studio <span className="separator">/</span> Metro Manila{' '}
        <span className="separator">/</span> GMT+8
      </motion.p>
      <motion.h1 id="hero-title" {...reveal(1)}>
        Four strands.
        <br />
        One <span>core</span>.
      </motion.h1>
      <motion.p className="hero-description" {...reveal(2)}>
        Three full-stack developers and a dedicated QA analyst, building
        software end to end. Small enough that you talk to the people writing
        the code — structured enough that nothing ships untested.
      </motion.p>
      <HeroActions reveal={reveal} />
      <HeroStats stats={stats} reveal={reveal} />
    </div>
  )
}
