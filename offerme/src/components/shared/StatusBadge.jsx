import styles from './StatusBadge.module.css'

const STATUS_LABELS = {
  active: 'Active',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${styles[status] || ''}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}
