import styles from '@/pages/dashboard/DashboardHome.module.css'

export default function BusinessDashboardHome() {
  const stats = [
    { label: 'Total Views', value: '1,234', icon: '👁️' },
    { label: 'Total Likes', value: '456', icon: '❤️' },
    { label: 'Comments', value: '89', icon: '💬' },
    { label: 'Active Posts', value: '12', icon: '📋' },
  ]

  return (
    <div className={styles.page}>
      <h2 className={styles.sectionTitle}>Business Overview</h2>
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <span className={styles.statIcon}>{stat.icon}</span>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>Recent Posts</h2>
      <div className={styles.emptyState}>
        <p>No posts yet. Create your first offer post to reach customers.</p>
      </div>
    </div>
  )
}
