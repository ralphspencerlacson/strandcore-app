import './Services.css'

const services = [
  {
    title: 'Web applications', icon: 'web',
    description: 'Customer portals, admin consoles and internal tools — the systems a business runs on. Role-based access, audit trails and reporting treated as requirements, not afterthoughts.',
    mobileDescription: 'Portals, admin consoles and internal tools — the systems a business runs on.',
    tags: ['React', 'Next.js', 'Laravel'],
  },
  {
    title: 'Mobile applications', icon: 'mobile',
    description: 'Cross-platform iOS and Android from one codebase, taken through App Store and Play review with you — including the rejections nobody warns first-time publishers about.',
    mobileDescription: 'iOS and Android from one codebase, taken through store review with you.',
    tags: ['React Native', 'Flutter', 'Expo'],
  },
  {
    title: 'APIs & payment rails', icon: 'api',
    description: 'Backends other systems can talk to, plus the local plumbing PH products need on day one: GCash, Maya, PayMongo, Dragonpay and BIR-compliant invoice exports.',
    mobileDescription: 'GCash, Maya, PayMongo, Dragonpay and BIR-compliant invoice exports.',
    tags: ['Node.js', 'REST', 'Webhooks'],
  },
  {
    title: 'QA & test automation', icon: 'qa',
    description: 'Also sold on its own. Test cases traced to your requirements, regression suites, UAT packs your stakeholders can sign, and defect reports with reproduction steps — not screenshots in a chat thread.',
    mobileDescription: 'Also sold on its own — embedded testing, or a one-off audit of your build.',
    tags: ['Playwright', 'UAT packs', 'Traceability'],
  },
  {
    title: 'Cloud, CI/CD & support', icon: 'cloud',
    description: 'Deployment pipelines, staging that mirrors production, backups you’ve seen restored, and uptime monitoring that pages a human. Handover includes the runbook.',
    mobileDescription: 'Pipelines, staging that mirrors production, and a runbook at handover.',
    tags: ['AWS', 'Docker', 'GitHub Actions'],
  },
  {
    title: 'Discovery & UI design', icon: 'design',
    description: 'Two weeks to turn a rough idea into a scoped backlog, clickable prototype and a build estimate you can take to a board — whether or not we’re the ones who build it.',
    mobileDescription: 'Two weeks from rough idea to scoped backlog, prototype and estimate.',
    tags: ['Figma', 'User flows', 'Estimates'],
  },
] as const

function ServiceIcon({ kind }: { kind: typeof services[number]['icon'] }) {
  const paths = {
    web: <><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M3 9h18M6 6.5h1m2 0h1" /></>,
    mobile: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M10 18h4" /></>,
    api: <><circle cx="5" cy="12" r="3" /><circle cx="18" cy="5" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8 10 7-4M8 14l7 4" /></>,
    qa: <><path d="M3 5h10M3 12h7M3 19h7m3-4 3 3 5-6" /></>,
    cloud: <><path d="M7 19a5 5 0 0 1-1-10 6 6 0 0 1 11-1 5.5 5.5 0 0 1 0 11H7Z" /><path d="M12 6v12m-3-3 3 3 3-3" /></>,
    design: <><circle cx="12" cy="12" r="10" /><path d="m16 8-2 6-6 2 2-6 6-2Z" /></>,
  }
  return <svg className="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>
}

export default function Services() {
  return (
    <section className="services landing-section" id="services" aria-labelledby="services-title">
      <div className="section-container">
        <header className="services-header" data-reveal>
          <div>
            <p className="section-label">Services</p>
            <h2 id="services-title">Built end to end, by the people who’ll support it.</h2>
          </div>
          <p className="services-intro">No handoffs between an agency, a contractor and a maintenance team. The four of us scope it, build it, test it and stay on for the first releases.</p>
        </header>
        <div className="services-grid">
          {services.map(service => (
            <article className={`service-card${service.icon === 'qa' ? ' service-card-qa' : ''}`} key={service.icon} data-reveal>
              <ServiceIcon kind={service.icon} />
              <h3>{service.title}</h3>
              <p className="desktop-copy">{service.description}</p>
              <p className="mobile-copy">{service.mobileDescription}</p>
              <ul className="service-tags" aria-label={`${service.title} technologies and deliverables`}>
                {service.tags.map(tag => <li key={tag}>{tag}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
