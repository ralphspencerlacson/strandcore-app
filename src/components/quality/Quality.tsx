import './Quality.css'

const checks = [
  ['Test cases written from the requirement before the ticket is picked up', 'Test cases written before the ticket is picked up'],
  ['Every case traced to a requirement ID — no orphan tests, no untested requirements', 'Every case traced to a requirement ID'],
  ['Regression suite re-run on staging before every release, not just the new feature', 'Regression suite re-run before every release'],
  ['Defects logged with steps, expected vs. actual, environment and severity', 'Defects logged with steps, expected vs. actual, environment and severity'],
  ['A UAT pack your team signs off — in your words, not ours', 'A UAT pack your team signs off'],
  ['Post-deployment smoke check on production, same day', 'Post-deployment smoke check, same day'],
] as const

const checkTitles = ['Test planning', 'Requirement coverage', 'Regression testing', 'Clear defect reports', 'Your sign-off', 'Production checks']

export default function Quality() {
  return (
    <section className="quality landing-section" id="quality" aria-labelledby="quality-title">
      <div className="section-container quality-layout">
        <header className="quality-story" data-reveal>
          <div>
          <p className="section-label">Quality</p>
          <h2 id="quality-title">One in four of us is a tester. On purpose.</h2>
          </div>
          <p className="quality-description">A studio our size usually bills four developers and tests its own work at the end of the sprint. We gave a founding seat to QA instead.<span className="quality-desktop"> It costs us a quarter of our build capacity, and it’s the reason our releases are boring.</span></p>
        </header>
        <div className="quality-checklist" data-reveal>
          <header className="quality-checklist-header">
            <p className="section-label">Definition of done</p>
            <div className="quality-checklist-heading">
              <h3>Ready means verified.</h3>
              <span className="quality-check-count">06 checks</span>
            </div>
          </header>
          <ol>
            {checks.map(([desktop, mobile], index) => (
              <li key={desktop}>
                <span className="quality-check-number" aria-hidden="true">0{index + 1}</span>
                <div className="quality-check-copy">
                  <h4>{checkTitles[index]}</h4>
                  <p className="desktop-copy">{desktop}</p>
                  <p className="mobile-copy">{mobile}</p>
                </div>
                <span className="quality-check" aria-hidden="true">✓</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
