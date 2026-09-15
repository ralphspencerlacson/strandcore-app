import type { HeroPhase } from './hero.types'

export function createHeroReveal(phase: HeroPhase, reducedMotion: boolean) {
return (order: number) => ({
    initial: { opacity: 0, y: reducedMotion ? 0 : 22 },
    animate: { opacity: phase === 'loading' ? 0 : 1, y: phase === 'loading' && !reducedMotion ? 22 : 0 },
    transition: { duration: reducedMotion ? 0 : 0.65, delay: reducedMotion ? 0 : 0.12 + order * 0.12 },
  })
}

export type HeroReveal = ReturnType<typeof createHeroReveal>
