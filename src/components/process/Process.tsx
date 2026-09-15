import './Process.css'

const stages = [
  { title: 'Discover', timing: '2–4 days', description: 'Workshop, a written scope, and what’s explicitly out.' },
  { title: 'Design', timing: '1–2 weeks', description: 'Flows and screens, reviewed with daily users — not only buyers.' },
  { title: 'Build', timing: '2-week sprints', description: 'Three developers, sprint demos, a staging URL in the first week.' },
  { title: 'Verify', timing: 'Parallel', description: 'Tests run against every sprint, so QA isn’t an end-phase fire drill.' },
  { title: 'Ship', timing: '1–3 days', description: 'UAT, deployment, store submission, same-day smoke checks.' },
  { title: 'Support', timing: 'Ongoing', description: '30-day warranty, then a retainer if you want one. You own the repo either way.' },
]

export default function Process() {
  return (
    <section id="process" className="process landing-section" aria-labelledby="process-title">
      <div className="section-container">
        <div data-reveal>
          <p className="section-label">Process</p>
          <h2 id="process-title">You always know which stage<br className="process-break" /> you’re in.</h2>
          <p className="process-intro">Fixed stages, named deliverables, a demo at the end of every one. Nothing goes dark for a month.</p>
        </div>
        <ol className="process-stages">
          {stages.map((stage, index) => (
            <li className={stage.title === 'Verify' ? 'process-verify' : undefined} key={stage.title} data-reveal>
              <span className="stage-number">0{index + 1}</span>
              <h3>{stage.title}</h3>
              <p className="stage-timing">{stage.timing}</p>
              <p className="stage-description">{stage.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
