import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logo from '@/assets/logo/logo.png'
import styles from './Footer.module.css'

const TOP_CATEGORIES = [
  { label: 'Food & Restaurants', to: '/category/food-restaurants', icon: '🍽️' },
  { label: 'Beauty & Personal Care', to: '/category/beauty-personal-care', icon: '💇' },
  { label: 'Events & Weddings', to: '/category/events-weddings-entertainment', icon: '🎉' },
  { label: 'Electronics & Mobiles', to: '/category/electronics-mobiles-computers', icon: '📱' },
  { label: 'Grocery & Daily Needs', to: '/category/grocery-daily-needs', icon: '🛒' },
]

export default function Footer() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Column 1: Brand + Contact + Social */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <img src={logo} alt="OfferMe" className={styles.logoImg} />
            </Link>
            <p className={styles.tagline}>Discover Local Deals Near You</p>
            <p className={styles.desc}>
              Explore local businesses, discover exclusive offers, and support your community. Your next great deal is just around the corner.
            </p>

            <div className={styles.socials}>
              <a href="#" className={styles.socialLink} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" className={styles.socialIcon}>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" className={styles.socialIcon}>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" className={styles.socialIcon}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" className={styles.socialIcon}>
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>

            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📧</span>
                <span>support@offermee.com</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <span>+91 98765 43210</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📍</span>
                <span>Chennai, Tamil Nadu</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.column}>
            <h4 className={styles.heading}>Quick Links</h4>
            <ul className={styles.links}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Top Categories */}
          <div className={styles.column}>
            <h4 className={styles.heading}>Top Categories</h4>
            <ul className={styles.links}>
              {TOP_CATEGORIES.map((cat) => (
                <li key={cat.to}>
                  <Link to={cat.to}>
                    <span className={styles.catIcon}>{cat.icon}</span>
                    {cat.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/categories" className={styles.viewAll}>
                  View All Categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: For Business */}
          <div className={styles.column}>
            <h4 className={styles.heading}>For Business</h4>
            <ul className={styles.links}>
              <li><Link to="/auth/business/register">List Your Business</Link></li>
              <li><Link to="/business/dashboard">Business Dashboard</Link></li>
              <li><Link to="/categories">Browse Categories</Link></li>
              <li><Link to="/about">How It Works</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} OfferMe. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showTop && (
        <button className={styles.backToTop} onClick={scrollToTop} aria-label="Back to top">
          ↑ Top
        </button>
      )}
    </footer>
  )
}
