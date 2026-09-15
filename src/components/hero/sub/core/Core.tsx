import { motion } from 'motion/react'
import type { HeroPhase } from '../../types/hero.types'

export default function Core({
  phase,
  reducedMotion,
}: {
  phase: HeroPhase
  reducedMotion: boolean
}) {
  const loading = phase === 'loading'
  const pulsing = !reducedMotion && phase !== 'moving'
  const duration = loading ? 0.9 : 1.8
  return (
    <motion.svg
      className="living-core"
      viewBox="-105 -105 210 210"
      fill="none"
      aria-hidden="true"
      animate={{
        scale: pulsing
          ? loading
            ? [1, 1.12, 0.99, 1.065, 1]
            : [1, 1.035, 1]
          : 1,
      }}
      transition={
        pulsing
          ? { duration, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.15 }
      }
    >
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
      <motion.circle
        className="core-halo"
        r="105"
        fill="url(#core-glow)"
        animate={{
          opacity: pulsing ? [0.55, 1, 0.55] : 0.8,
          scale: pulsing ? [0.85, 1.12, 0.85] : 1,
        }}
        transition={{
          duration,
          repeat: pulsing ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />
      {pulsing && (
        <motion.circle
          className="core-ripple"
          stroke="#87d5ff"
          strokeWidth="1"
          initial={{ r: 44, opacity: 0 }}
          animate={{
            r: [44, loading ? 72 : 61],
            opacity: [0, loading ? 0.5 : 0.25, 0],
          }}
          transition={{ duration, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <circle className="core-outline" r="45" stroke="#529eea" opacity="0.5" />
      <circle
        className="core-ring"
        r="41"
        stroke="#65c8ff"
        strokeWidth="2"
        opacity="0.7"
      />
      <circle
        className="core-surface"
        r="37"
        fill="url(#core-fill)"
        stroke="#a1deff"
        strokeWidth="1.5"
      />
    </motion.svg>
  )
}
