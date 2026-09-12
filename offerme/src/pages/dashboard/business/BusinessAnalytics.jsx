import styles from './BusinessAnalytics.module.css'

export default function BusinessAnalytics() {
  const metrics = [
    { label: 'Total Views', value: '1,234', change: '+12%', icon: '👁️' },
    { label: 'Total Likes', value: '456', change: '+8%', icon: '❤️' },
    { label: 'Comments', value: '89', change: '+5%', icon: '💬' },
    { label: 'Visitor Count', value: '2,345', change: '+15%', icon: '👥' },
  ]

  const posts = [
    { title: 'Summer Sale 20% Off', status: 'approved', views: 450, likes: 120, comments: 34 },
    { title: 'New Arrivals Weekly', status: 'pending', views: 0, likes: 0, comments: 0 },
    { title: 'Free Shipping Deal', status: 'rejected', views: 89, likes: 12, comments: 5 },
  ]

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Analytics</h1>
      <div className={styles.metricsGrid}>
        {metrics.map((m) => (
          <div key={m.label} className={styles.metricCard}>
            <span className={styles.metricIcon}>{m.icon}</span>
            <div className={styles.metricInfo}>
              <span className={styles.metricValue}>{m.value}</span>
              <span className={styles.metricLabel}>{m.label}</span>
            </div>
            <span className={styles.metricChange}>{m.change}</span>
          </div>
        ))}
      </div>

      <h2 className={styles.sectionTitle}>Post Performance</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Post</th>
              <th>Status</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, i) => (
              <tr key={i}>
                <td>{post.title}</td>
                <td>
                  <span className={`${styles.status} ${styles[post.status]}`}>
                    {post.status}
                  </span>
                </td>
                <td>{post.views}</td>
                <td>{post.likes}</td>
                <td>{post.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
