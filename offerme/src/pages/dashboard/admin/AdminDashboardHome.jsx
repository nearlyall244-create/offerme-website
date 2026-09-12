import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/utils/date'
import StatusBadge from '@/components/shared/StatusBadge'
import styles from './AdminDashboardHome.module.css'

export default function AdminDashboardHome() {
  const { user } = useAuth()
  const [owners, setOwners] = useState([])
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      try {
        const token = await user.getIdToken()
        const headers = { Authorization: `Bearer ${token}` }

        const [ownersRes, shopsRes] = await Promise.all([
          fetch('/api/admin?type=owners', { headers }),
          fetch('/api/admin?type=shops', { headers }),
        ])

        const ownersData = await ownersRes.json()
        const shopsData = await shopsRes.json()

        if (ownersRes.ok) setOwners(ownersData.owners || [])
        if (shopsRes.ok) setShops(shopsData.shops || [])
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const pendingCount = shops.filter((s) => s.status === 'pending').length
  const approvedCount = shops.filter((s) => s.status === 'approved' || s.is_active).length
  const rejectedCount = shops.filter((s) => s.status === 'rejected').length

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Overview</h1>

      <div className={styles.statsGrid}>
        <Link to="/admin/dashboard/submissions" className={`${styles.statCard} ${styles.pendingCard}`}>
          <span className={styles.statIcon}>⏳</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{loading ? '—' : pendingCount}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </Link>
        <Link to="/admin/dashboard/submissions" className={`${styles.statCard} ${styles.approvedCard}`}>
          <span className={styles.statIcon}>✅</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{loading ? '—' : approvedCount}</span>
            <span className={styles.statLabel}>Approved</span>
          </div>
        </Link>
        <Link to="/admin/dashboard/submissions" className={`${styles.statCard} ${styles.rejectedCard}`}>
          <span className={styles.statIcon}>❌</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{loading ? '—' : rejectedCount}</span>
            <span className={styles.statLabel}>Rejected</span>
          </div>
        </Link>
        <Link to="/admin/dashboard/owners" className={`${styles.statCard} ${styles.totalCard}`}>
          <span className={styles.statIcon}>👤</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{loading ? '—' : owners.length}</span>
            <span className={styles.statLabel}>Business Owners</span>
          </div>
        </Link>
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recent Shops</h2>
        <Link to="/admin/dashboard/submissions" className={styles.viewAll}>View All →</Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Shop Name</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className={styles.emptyCell}>Loading...</td></tr>
            ) : shops.length === 0 ? (
              <tr><td colSpan={4} className={styles.emptyCell}>No shops yet.</td></tr>
            ) : (
              shops.slice(0, 5).map((shop) => (
                <tr key={shop.id}>
                  <td className={styles.businessName}>{shop.shop_name}</td>
                  <td>{shop.business_owners?.owner_name || '—'}</td>
                  <td><StatusBadge status={shop.is_active ? 'active' : 'pending'} /></td>
                  <td>{formatDate(shop.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
