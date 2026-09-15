import { useEffect, useState } from 'react'
import { strands, coreBranches } from '../components/hero/sub/strand/strand.data'
import type { EnergyPulse } from '../components/hero/types/hero.types'

export function useEnergyPulses() {
  const [pulses, setPulses] = useState<EnergyPulse[]>([])

  useEffect(() => {
    let timer: number
    let id = 0

    const sendPulse = () => {
      if (!document.hidden) {
        const index = id % strands.length
        const branchIndices = coreBranches
          .map((_, branchIndex) => branchIndex)
          .filter((branchIndex) =>
            coreBranches[branchIndex].copper
              ? index === 3
              : index === branchIndex % 3,
          )
        const flightTime = 0.72
        const circuitFlightTime = 0.26
        const now = performance.now()
        const pulse: EnergyPulse = {
          id: id++,
          index,
          flightTime,
          circuitFlightTime,
          branchIndices,
          expiresAt: now + (flightTime + circuitFlightTime + 0.5) * 1000,
        }
        setPulses((active) =>
          [...active.filter((item) => item.expiresAt > now), pulse].slice(-7),
        )
      }
      timer = window.setTimeout(sendPulse, 400)
    }

    timer = window.setTimeout(sendPulse, 100)
    return () => window.clearTimeout(timer)
  }, [])

  return pulses
}
