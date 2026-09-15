import { motion } from 'motion/react'
import Core from './Core'
import EnergyFlow from './EnergyFlow'
import StrandLine from './StrandLine'
import { strands, coreBranches } from './hero.data'
import type { HeroPhase } from './hero.types'

export default function StrandGraphic({ phase, reducedMotion, onMoveComplete, onDrawComplete }: {
  phase: HeroPhase
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
            <g className="circuit-branch" key={path}>
              <motion.path d={path} stroke={copper ? '#cc936f' : '#6bbcf6'} strokeWidth="1.8" opacity="0.45"
                initial={{ pathLength: 0 }} animate={{ pathLength: draw ? 1 : 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.65, delay: draw && !reducedMotion ? index * 0.025 : 0 }} />
              <motion.circle className="circuit-node" cx={x} cy={y} r="4.5" fill={copper ? '#ffc391' : '#b3e5ff'}
                initial={{ opacity: 0 }} animate={{ opacity: draw ? 1 : 0 }}
                transition={{ duration: 0.2, delay: draw && !reducedMotion ? 0.5 + index * 0.025 : 0 }} />
            </g>
          ))}
          {strands.map((_, index) => (
            <StrandLine key={index} index={index} draw={draw} phase={phase} reducedMotion={reducedMotion} onDrawComplete={onDrawComplete} />
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
