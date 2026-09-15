import './Team.css'

const founders = [
  { name: 'Ralph', initial: 'R', description: 'Front-end and mobile. Builds the screens people sit in for eight hours, and cares that they’re fast on a mid-range Android.' },
  { name: 'Jhay', initial: 'J', description: 'Integrations and infrastructure. Payment rails, third-party APIs, pipelines, and the monitoring that catches it first.' },
  { name: 'Eugene', initial: 'E', description: 'Backend architecture and data modelling. The one who asks what happens when two people submit the same form at once.' },
  { name: 'Migs', initial: 'M', description: 'Test strategy, test case design and UAT. Signs off on what ships, and writes the documentation your auditors will ask for.', qa: true },
]

export default function Team() {
  return (
    <section id="team" className="team landing-section" aria-labelledby="team-title">
      <div className="section-container">
        <header className="team-header" data-reveal>
          <div><p className="section-label">Team</p><h2 id="team-title">The four people who’ll actually do the work.</h2></div>
        </header>
        <div className="team-grid">
          {founders.map(person => (
            <article className={`team-card${person.qa ? ' team-card-qa' : ''}`} key={person.name} data-reveal>
              <span className="team-avatar" aria-hidden="true">{person.initial}</span>
              <h3>{person.name}</h3>
              <p className="team-role">{person.qa ? 'QA analyst' : <><span className="team-role-desktop">Full-stack developer</span><span className="team-role-mobile">Full-stack dev</span></>}</p>
              <p className="team-description">{person.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
