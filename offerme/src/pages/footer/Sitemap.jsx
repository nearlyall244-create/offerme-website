import { Link } from 'react-router-dom'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/pages/footer/Footer'
import styles from './Sitemap.module.css'

const siteLinks = [
  {
    title: 'Main',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Categories', to: '/categories' },
      { label: 'About Us', to: '/about' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign Up', to: '/auth/signup' },
      { label: 'Login', to: '/auth/login' },
      { label: 'User Register', to: '/auth/user/register' },
      { label: 'Business Register', to: '/auth/business/register' },
    ],
  },
  {
    title: 'Dashboards',
    links: [
      { label: 'User Dashboard', to: '/dashboard' },
      { label: 'Business Dashboard', to: '/business/dashboard' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Sitemap', to: '/sitemap' },
    ],
  },
]

export default function Sitemap() {
  return (
    <div>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Sitemap</h1>
          <p className={styles.subtitle}>Find all pages and sections of OfferMe</p>

          <div className={styles.grid}>
            {siteLinks.map((section) => (
              <div key={section.title} className={styles.section}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <ul className={styles.linkList}>
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className={styles.link}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className={styles.bottomNav}>
            <Link to="/">Back to Home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
