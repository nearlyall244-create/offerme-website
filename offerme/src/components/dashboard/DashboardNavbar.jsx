import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import logo from '@/assets/logo/logo.png'
import styles from './DashboardNavbar.module.css'

export default function DashboardNavbar({ role }) {
  const { userProfile, user } = useAuth()

  const currentRole = role || userProfile?.role

  const displayName =
    userProfile?.displayName ||
    userProfile?.owner_name ||
    userProfile?.shop_name ||
    userProfile?.name ||
    userProfile?.businessName ||
    user?.displayName ||
    (currentRole === 'business'
      ? 'Business'
      : currentRole === 'admin'
      ? 'Admin'
      : 'User')

  const initial = displayName ? displayName.trim()[0].toUpperCase() : 'U'

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/" className={styles.logo}>
          <img src={logo} alt="OfferMe" className={styles.logoImg} />
        </Link>
      </div>
      <div className={styles.right}>
        <span className={styles.name}>{displayName}</span>
        <div className={styles.avatar}>
          {initial}
        </div>
      </div>
    </header>
  )
}
