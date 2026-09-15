import './Quality.css'

const checks = [
  ['Test cases written from the requirement before the ticket is picked up', 'Test cases written before the ticket is picked up'],
  ['Every case traced to a requirement ID — no orphan tests, no untested requirements', 'Every case traced to a requirement ID'],
  ['Regression suite re-run on staging before every release, not just the new feature', 'Regression suite re-run before every release'],
  ['Defects logged with steps, expected vs. actual, environment and severity', 'Defects logged with steps, expected vs. actual, environment and severity'],
  ['A UAT pack your team signs off — in your words, not ours', 'A UAT pack your team signs off'],
  ['Post-deployment smoke check on production, same day', 'Post-deployment smoke check, same day'],
] as const

function QualityStrands() {
  return (
    <svg className="quality-strands" viewBox="0 0 420 140" role="img" aria-label="Three blue build strands and one orange verification strand join together to ship">
      <g fill="none" stroke="#3167b9" strokeWidth="4" strokeLinecap="round">
        <path pathLength="1" d="M2 22h145c108 0 108 44 208 44" />
        <path pathLength="1" d="M2 51h150c95 0 115 15 203 15" />
        <path pathLength="1" d="M2 80h150c95 0 115-14 203-14" />
        <path pathLength="1" d="M2 111h145c108 0 108-45 208-45" stroke="#e68e58" />
      </g>
      <circle cx="375" cy="66" r="24" fill="#609cfa" />
      <g fontFamily="Consolas, monospace" fontSize="8" letterSpacing="2">
        <text x="2" y="11" fill="#829abf">BUILD</text>
        <text x="2" y="130" fill="#e68e58">VERIFY</text>
        <text x="352" y="111" fill="#829abf">SHIP</text>
      </g>
    </svg>
  )
}

export default function Quality() {
  return (
    <section className="quality landing-section" id="quality" aria-labelledby="quality-title">
      <div className="section-container quality-layout">
        <div className="quality-story" data-reveal>
          <p className="section-label">Quality</p>
          <h2 id="quality-title">One in four of us is a tester. On purpose.</h2>
          <p className="quality-description">A studio our size usually bills four developers and tests its own work at the end of the sprint. We gave a founding seat to QA instead.<span className="quality-desktop"> It costs us a quarter of our build capacity, and it’s the reason our releases are boring.</span></p>
          <QualityStrands />
        </div>
        <div className="quality-checklist" data-reveal>
          <h3 className="section-label">Definition of done</h3>
          <ul>
            {checks.map(([desktop, mobile]) => (
              <li key={desktop}>
                <span className="quality-check" aria-hidden="true">✓</span>
                <span className="desktop-copy">{desktop}</span>
                {mobile && <span className="mobile-copy">{mobile}</span>}
              </li>
            ))}
          </ul>
          <div className="quality-audit quality-desktop">
            <p>Already have developers and only need the testing side? We sell QA on its own — embedded in your sprints, or as a one-off audit of a build you’re not confident shipping.</p>
            <a className="quality-audit-link" href="mailto:?subject=Request%20a%20QA%20audit" title="Draft a QA audit request in your email app">Request a QA audit</a>
          </div>
        </div>
      </div>
    </section>
  )
}
