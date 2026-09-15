export type HeroPhase = 'loading' | 'moving' | 'drawing' | 'ready'
export type EnergyPulse = {
  id: number
  index: number
  flightTime: number
  circuitFlightTime: number
  branchIndices: number[]
  expiresAt: number
}

export type HeroStat = { label: string; value: string; accent?: boolean }
