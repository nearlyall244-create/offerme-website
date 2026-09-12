import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/lib/apiClient'
import styles from './DashboardSidebar.module.css'

const userLinks = [
  { to: '/', label: 'Main Page', icon: '🏠' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/sell-your-business', label: 'Sell Business', icon: '🏢' },
  { to: '/dashboard/my-businesses', label: 'My Businesses', icon: '🏪' },
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
  { to: '/business/dashboard/offers', label: 'Offers / Deals', icon: '🏷️' },
  { to: '/business/dashboard/analytics', label: 'Analytics', icon: '📈' },
  { to: '/business/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

const adminLinks = [
  { to: '/', label: 'Main Page', icon: '🏠' },
  { to: '/admin/dashboard', label: 'Overview', icon: '📊' },
  { to: '/admin/dashboard/owners', label: 'Business Owners', icon: '👤' },
  { to: '/admin/dashboard/submissions', label: 'Submissions', icon: '📋', showBadge: true },
  { to: '/admin/dashboard/offers', label: 'Offers Details', icon: '📊' },
  { to: '/admin/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export default function DashboardSidebar({ role = 'user' }) {
  const location = useLocation()
  const { userProfile } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

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
    <aside className={styles.sidebar}>
      {role === 'admin' && (
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {(userProfile?.displayName || userProfile?.owner_name || 'A')[0].toUpperCase()}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{userProfile?.displayName || userProfile?.owner_name || 'Admin'}</span>
            <span className={styles.userRole}>Admin</span>
          </div>
        </div>
      )}
      <nav className={styles.nav}>
        <ul className={styles.list}>
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`${styles.link} ${location.pathname === link.to ? styles.active : ''}`}
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
      </nav>

    </aside>
  )
}
