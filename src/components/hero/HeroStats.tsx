import { motion } from 'motion/react'
import type { HeroReveal } from './hero.motion'
import type { HeroStat } from './hero.types'

export default function HeroStats({ stats, reveal }: { stats: readonly HeroStat[]; reveal: HeroReveal }) {
  return (
<motion.dl className="stats" {...reveal(4)}>
            {stats.map(({ label, value, accent }, index) => (
              <motion.div className="stat" key={label} {...reveal(4 + index * 0.6)}>
                <dt>{label}</dt>
                <dd className={accent ? 'stat-accent' : undefined}>{value}</dd>
              </motion.div>
            ))}
          </motion.dl>
  )
}
