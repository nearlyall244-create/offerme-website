import { formatDate } from '@/utils/date'
import StatusBadge from '@/components/shared/StatusBadge'
import styles from './SubmissionDetailPanel.module.css'

export default function SubmissionDetailPanel({ submission, onClose, onApprove, onReject }) {
  if (!submission) return null

  const status = submission.status || (submission.is_active ? 'approved' : 'pending')

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Business Submission Details</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {submission.shop_image_url && (
            <section className={styles.section}>
              <img
                src={submission.shop_image_url}
                alt={submission.shop_name}
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '0.5rem' }}
              />
            </section>
          )}

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Business Information</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Business Name</span>
                <span className={styles.fieldValue}>{submission.shop_name}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Business Email</span>
                <span className={styles.fieldValue}>{submission.business_email || '—'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Business Category</span>
                <span className={styles.fieldValue}>{(submission.category_id || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Subcategory</span>
                <span className={styles.fieldValue}>{(submission.subcategory_id || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '—'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Phone Number</span>
                <span className={styles.fieldValue}>{submission.enquiry_number || '—'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Description</span>
                <span className={styles.fieldValue}>{submission.shop_description || '—'}</span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Location</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Business Address</span>
                <span className={styles.fieldValue}>{submission.shop_address || '—'}</span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Submission Information</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Submitted By</span>
                <span className={styles.fieldValue}>{submission.business_owners?.owner_name || '—'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Owner Email</span>
                <span className={styles.fieldValue}>{submission.business_owners?.email || '—'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Submitted Date</span>
                <span className={styles.fieldValue}>{formatDate(submission.created_at)}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Current Status</span>
                <StatusBadge status={status} />
              </div>
              {submission.rejection_reason && (
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Rejection Reason</span>
                  <span className={`${styles.fieldValue} ${styles.rejectionReason}`}>{submission.rejection_reason}</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {status === 'pending' && (
          <div className={styles.footer}>
            <button className={styles.approveBtn} onClick={() => onApprove(submission.id)}>
              Approve
            </button>
            <button className={styles.rejectBtn} onClick={() => onReject(submission)}>
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
