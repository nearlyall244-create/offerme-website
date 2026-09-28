import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/lib/apiClient'
import styles from './DashboardSidebar.module.css'

const userLinks = [
  { to: '/', label: 'Main Page', icon: '🏠' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/sell-your-business', label: 'Sell Business', icon: '🏢' },
  { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
  { to: '/dashboard/favorites', label: 'Favorites', icon: '❤️' },
  { to: '/dashboard/claims', label: 'My Claims', icon: '🎟️' },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

const businessLinks = [
  { to: '/', label: 'Main Page', icon: '🏠' },
  { to: '/business/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/business/dashboard/profile', label: 'Profile', icon: '👤' },
  { to: '/business/dashboard/posts', label: 'My Posts', icon: '📋' },
  { to: '/business/dashboard/view-posts', label: 'View Posts', icon: '👁️' },
  { to: '/business/dashboard/offers', label: 'Offers / Deals', icon: '🏷️' },
  { to: '/business/dashboard/analytics', label: 'Analytics', icon: '📈' },
  { to: '/business/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

const adminLinks = [
  { to: '/', label: 'Main Page', icon: '🏠' },
  { to: '/admin/dashboard', label: 'Overview', icon: '📊' },
  { to: '/admin/dashboard/owners', label: 'Business Owners', icon: '👤' },
  { to: '/admin/dashboard/submissions', label: 'Submissions', icon: '📋', showBadge: true },
  { to: '/admin/dashboard/my-post', label: 'My Post', icon: '📝' },
  { to: '/admin/dashboard/view-posts', label: 'View Posts', icon: '👁️' },
  { to: '/admin/dashboard/post-details', label: 'Post Details', icon: '📄' },
  { to: '/admin/dashboard/offers', label: 'Offers Details', icon: '📊' },
  { to: '/admin/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export default function DashboardSidebar({ role = 'user' }) {
  const location = useLocation()
  useAuth()
  const [pendingCount, setPendingCount] = useState(0)
  const [panelOpen, setPanelOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)

  useEffect(() => {
    if (role !== 'admin') return
    let cancelled = false
    const fetchPending = async () => {
      try {
        const shopData = await adminApi.shops({ status: 'pending', limit: 1 }).catch(() => ({ total: 0 }))
        if (!cancelled) {
          setPendingCount(shopData.total || 0)
        }
      } catch {
        // keep 0
      }
    }
    fetchPending()
    return () => { cancelled = true }
  }, [role])

  const links = role === 'admin' ? adminLinks : role === 'business' ? businessLinks : userLinks

  return (
    <aside
      className={styles.sidebar}
      onMouseEnter={() => setPanelOpen(true)}
      onMouseLeave={() => {
        setPanelOpen(false)
        setHoveredItem(null)
      }}
    >
      <nav className={styles.nav} aria-label="Dashboard">
        <ul className={styles.list}>
          {links.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  aria-label={link.label}
                  className={`${styles.link} ${isActive ? styles.active : ''} ${
                    hoveredItem === link.to ? styles.hovered : ''
                  }`}
                  onMouseEnter={() => setHoveredItem(link.to)}
                >
                  <span className={styles.icon}>{link.icon}</span>
                  <span className={styles.label}>{link.label}</span>
                  {link.showBadge && pendingCount > 0 && (
                    <span className={styles.badge}>{pendingCount}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={`${styles.panel} ${panelOpen ? styles.panelOpen : ''}`}>
        <ul className={styles.panelList}>
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`${styles.panelLink} ${
                  location.pathname === link.to ? styles.active : ''
                }`}
              >
                <span className={styles.icon}>{link.icon}</span>
                <span className={styles.label}>{link.label}</span>
                {link.showBadge && pendingCount > 0 && (
                  <span className={styles.badge}>{pendingCount}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
