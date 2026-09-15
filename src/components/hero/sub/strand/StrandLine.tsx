import { motion } from 'motion/react'
import { strands } from './strand.data'
import { strandPath } from './strandPath'
import type { HeroPhase } from '../../types/hero.types'

export default function StrandLine({
  index,
  draw,
  phase,
  reducedMotion,
  onDrawComplete,
}: {
  index: number
  draw: boolean
  phase: HeroPhase
  reducedMotion: boolean
  onDrawComplete: () => void
}) {
  return (
    <motion.path
      className="strand-line"
      mask={`url(#strand-entry-mask-${index})`}
      d={strandPath(index)}
      stroke={`url(#${strands[index].copper ? 'copper' : 'blue'}-strand)`}
      strokeWidth="4"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: draw ? 1 : 0 }}
      transition={{
        duration: reducedMotion ? 0 : 1.6,
        delay: draw && !reducedMotion ? index * 0.1 : 0,
        ease: 'easeInOut',
      }}
      onAnimationComplete={
        index === strands.length - 1 && phase === 'drawing'
          ? onDrawComplete
          : undefined
      }
    />
  )
}
