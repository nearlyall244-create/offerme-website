import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ConfirmModal from '@/components/shared/ConfirmModal'
import ThemeSwitch from './ThemeSwitch'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { user, userProfile, signOut } = useAuth()
  const location = useLocation()

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Contact', to: '/contact' },
  ]

  const dashboardLink = user
    ? userProfile?.role === 'admin'
      ? '/admin/dashboard'
      : userProfile?.role === 'business'
        ? '/business/dashboard'
        : '/dashboard'
    : null

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
      <div className={styles.container}>
        <div className={styles.navGroup}>
          <ul className={`${styles.navLinks} ${mobileOpen ? styles.open : ''}`}>
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`${styles.navLink} ${location.pathname === link.to ? styles.active : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.actionsGroup}>
          <ThemeSwitch />
          {user ? (
            <>
              {dashboardLink && (
                <Link to={dashboardLink} className={styles.dashboardBtn}>
                  Dashboard
                </Link>
              )}
              <button onClick={() => setShowLogoutModal(true)} className={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className={styles.loginBtn}>
                Log in
              </Link>
              <Link to="/auth/signup" className={styles.signupBtn}>
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className={styles.burger}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <span className={`${styles.bar} ${mobileOpen ? styles.barOpen : ''}`} />
          <span className={`${styles.bar} ${mobileOpen ? styles.barOpen : ''}`} />
          <span className={`${styles.bar} ${mobileOpen ? styles.barOpen : ''}`} />
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
      )}

      <ConfirmModal
        open={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        danger
        success={loggingOut}
        successMessage="You have been logged out successfully."
        onConfirm={() => { setLoggingOut(true); setTimeout(() => { signOut(); window.location.href = '/' }, 2000) }}
        onCancel={() => { setShowLogoutModal(false); setLoggingOut(false) }}
      />
    </nav>
  )
}
