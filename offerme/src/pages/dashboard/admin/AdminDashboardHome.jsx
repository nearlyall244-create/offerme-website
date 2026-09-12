import { Link } from 'react-router-dom'
import { getAllSubmissions, getSubmissionsByStatus } from '@/data/mockSubmissions'
import { formatDate } from '@/utils/date'
import StatusBadge from '@/components/shared/StatusBadge'
import styles from './AdminDashboardHome.module.css'

export default function AdminDashboardHome() {
  const submissions = getAllSubmissions()
  const pendingCount = getSubmissionsByStatus('pending').length
  const approvedCount = getSubmissionsByStatus('approved').length
  const rejectedCount = getSubmissionsByStatus('rejected').length

  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Overview</h1>

      <div className={styles.statsGrid}>
        <Link to="/admin/dashboard/submissions" className={`${styles.statCard} ${styles.pendingCard}`}>
          <span className={styles.statIcon}>⏳</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{pendingCount}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </Link>
        <Link to="/admin/dashboard/submissions" className={`${styles.statCard} ${styles.approvedCard}`}>
          <span className={styles.statIcon}>✅</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{approvedCount}</span>
            <span className={styles.statLabel}>Approved</span>
          </div>
        </Link>
        <Link to="/admin/dashboard/submissions" className={`${styles.statCard} ${styles.rejectedCard}`}>
          <span className={styles.statIcon}>❌</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{rejectedCount}</span>
            <span className={styles.statLabel}>Rejected</span>
          </div>
        </Link>
        <Link to="/admin/dashboard/owners" className={`${styles.statCard} ${styles.totalCard}`}>
          <span className={styles.statIcon}>👤</span>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{submissions.length}</span>
            <span className={styles.statLabel}>Total Submissions</span>
          </div>
        </Link>
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recent Submissions</h2>
        <Link to="/admin/dashboard/submissions" className={styles.viewAll}>View All →</Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Category</th>
              <th>Owner</th>
              <th>Submitted</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentSubmissions.map((sub) => (
              <tr key={sub.id}>
                <td className={styles.businessName}>{sub.businessName}</td>
                <td>{sub.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</td>
                <td>{sub.ownerName}</td>
                <td>{formatDate(sub.submittedAt)}</td>
                <td><StatusBadge status={sub.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
