import { motion } from 'motion/react'
import type { HeroReveal } from './hero.motion'

export default function HeroActions({ reveal }: { reveal: HeroReveal }) {
  return (
<motion.div className="hero-actions" {...reveal(3)}>
            <button className="button button-primary" type="button">Scope a build <span aria-hidden="true">→</span></button>
            <button className="button button-secondary" type="button">Why the QA seat</button>
          </motion.div>
  )
}
