import './AmbientBackground.css'

export default function AmbientBackground() {
  return (
    <div className="ambient-glow" aria-hidden="true">
      <div className="ambient-orb ambient-orb-primary" />
      <div className="ambient-orb ambient-orb-secondary" />
    </div>
  )
}
