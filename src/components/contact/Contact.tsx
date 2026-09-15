import Brand from '../brand/Brand'
import './Contact.css'

// Set these destinations when the studio's contact details are available.
const contactDetails: { email?: string; bookingUrl?: string; githubUrl?: string } = {}

export default function Contact() {
  return (
    <section id="contact" className="contact landing-section" aria-labelledby="contact-title" data-reveal="contact">
      <div className="section-container">
        <Brand mark className="contact-logo" />
        <h2 id="contact-title">Start with a 30-minute call.</h2>
        <p className="contact-description">No deck, no discovery fee for the first conversation.<span className="contact-desktop"> Bring the problem — we’ll tell you honestly whether it’s a build, a buy, or a spreadsheet that’s fine as it is.</span></p>
        <div className="contact-actions">
          {contactDetails.bookingUrl ? <a className="button button-primary" href={contactDetails.bookingUrl}>Book a call <span aria-hidden="true">→</span></a> : <button className="button button-primary" type="button" disabled>Book a call <span aria-hidden="true">→</span></button>}
          {contactDetails.email ? <a className="button button-secondary" href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a> : <button className="button button-secondary" type="button" disabled>[Your email]</button>}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-container footer-content">
        <a className="brand-link" href="#top" aria-label="Strandcore home"><Brand /></a>
        <div className="footer-details">
          {contactDetails.email ? <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a> : <span className="footer-contact-placeholder">[Your email]</span>}
          {contactDetails.githubUrl ? <a href={contactDetails.githubUrl}>GitHub</a> : <span className="footer-contact-placeholder">[Your GitHub]</span>}
          <span>Metro Manila, PH</span><span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
