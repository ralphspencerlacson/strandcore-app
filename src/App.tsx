import LandingPage from './pages/landing'
import ContactPage from './pages/contact/ContactPage'
import EmailAdminPage from './pages/admin/EmailAdminPage'

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '')
  if (path === '/admin' || path === '/admin/email') return <EmailAdminPage />
  return path === '/contact' ? <ContactPage /> : <LandingPage />
}
