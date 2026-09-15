import HeroContent from './sub/content/HeroContent'
import StrandGraphic from './sub/strand/StrandGraphic'
import type { HeroPhase, HeroStat } from './types/hero.types'
import './styles/Hero.css'

type HeroProps = {
  phase: HeroPhase
  reducedMotion: boolean
  stats: readonly HeroStat[]
  onMoveComplete: () => void
  onDrawComplete: () => void
}

export default function Hero({
  phase,
  reducedMotion,
  stats,
  onMoveComplete,
  onDrawComplete,
}: HeroProps) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <HeroContent phase={phase} reducedMotion={reducedMotion} stats={stats} />
      <StrandGraphic
        phase={phase}
        reducedMotion={reducedMotion}
        onMoveComplete={onMoveComplete}
        onDrawComplete={onDrawComplete}
      />
    </section>
  )
}
