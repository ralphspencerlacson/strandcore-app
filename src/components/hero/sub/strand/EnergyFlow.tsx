import { useEnergyPulses } from './useEnergyPulses'
import { motion, useTime, useTransform } from 'motion/react'
import { strands, coreBranches } from './strand.data'
import { strandPath } from './strandPath'
import type { EnergyPulse } from '../../types/hero.types'

function EnergyChannel({ pulse }: { pulse: EnergyPulse }) {
  const { index, flightTime, circuitFlightTime } = pulse
  const time = useTime()
  const strand = strands[index]
  const elapsed = useTransform(time, (ms) => ms / 1000)
  const progress = useTransform(elapsed, (seconds) =>
    Math.min(seconds / flightTime, 1),
  )
  const offset = useTransform(progress, (value) => 0.08 - value * 1.08)
  const shineOpacity = useTransform(elapsed, (seconds) =>
    seconds < flightTime ? 0.65 : 0,
  )
  // First reach the core, then travel along the circuits before lighting the nodes.
  const coreGlow = useTransform(elapsed, (seconds) => {
    const sinceArrival = seconds - flightTime
    return seconds >= 0 && sinceArrival >= 0 && sinceArrival < 0.45
      ? Math.pow(1 - sinceArrival / 0.45, 2)
      : 0
  })
  const circuitProgress = useTransform(elapsed, (seconds) =>
    Math.max(0, Math.min((seconds - flightTime) / circuitFlightTime, 1)),
  )
  const circuitOffset = useTransform(
    circuitProgress,
    (value) => 0.12 - value * 1.12,
  )
  const circuitOpacity = useTransform(elapsed, (seconds) =>
    seconds >= flightTime && seconds < flightTime + circuitFlightTime
      ? 0.55
      : 0,
  )
  const glow = useTransform(elapsed, (seconds) => {
    const sinceNodeArrival = seconds - flightTime - circuitFlightTime
    return seconds >= 0 && sinceNodeArrival >= 0 && sinceNodeArrival < 0.45
      ? Math.pow(1 - sinceNodeArrival / 0.45, 2) * 0.4
      : 0
  })
  const glowRadius = useTransform(glow, (value) => 4.5 + value * 3)
  const ringOpacity = useTransform(coreGlow, (value) => value * 0.3)
  const branches = pulse.branchIndices.map(
    (branchIndex) => coreBranches[branchIndex],
  )

  return (
    <g className="energy-channel" data-channel={index} data-pulse={pulse.id}>
      <motion.path
        className="energy-shine"
        d={strandPath(index)}
        pathLength={1}
        stroke={strand.copper ? '#ffe0b8' : '#d4f2ff'}
        strokeWidth="2.8"
        strokeDasharray="0.08 1"
        style={{ strokeDashoffset: offset, opacity: shineOpacity }}
      />
      <motion.g className="circuit-travel" style={{ opacity: circuitOpacity }}>
        {branches.map((branch) => (
          <motion.path
            key={branch.path}
            className="circuit-shine"
            d={branch.path}
            pathLength={1}
            stroke={branch.copper ? '#ffe0b8' : '#d4f2ff'}
            strokeWidth="2.5"
            strokeDasharray="0.12 1"
            style={{ strokeDashoffset: circuitOffset }}
          />
        ))}
      </motion.g>
      <motion.g style={{ opacity: glow }} className="node-flash">
        {branches.map((branch) => (
          <g key={branch.path}>
            <path
              d={branch.path}
              stroke={branch.copper ? '#efb68b' : '#91d8ff'}
              strokeWidth="2"
            />
            <motion.circle
              cx={branch.x}
              cy={branch.y}
              r={glowRadius}
              fill={branch.copper ? '#ffdbaf' : '#d9f4ff'}
            />
          </g>
        ))}
      </motion.g>
      <motion.circle
        className="circuit-impact"
        cx="520"
        cy="200"
        r="38.7"
        stroke={strand.copper ? '#ffd1a0' : '#bcf0ff'}
        strokeWidth="3"
        style={{ opacity: ringOpacity }}
      />
    </g>
  )
}

export default function EnergyFlow() {
  const pulses = useEnergyPulses()

  return (
    <g>
      {pulses.map((pulse) => (
        <EnergyChannel key={pulse.id} pulse={pulse} />
      ))}
    </g>
  )
}
