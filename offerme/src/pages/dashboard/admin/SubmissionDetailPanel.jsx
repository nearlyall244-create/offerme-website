import { formatDate, formatTime } from '@/utils/date'
import StatusBadge from '@/components/shared/StatusBadge'
import styles from './SubmissionDetailPanel.module.css'

export default function SubmissionDetailPanel({ submission, onClose, onApprove, onReject }) {
  if (!submission) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Business Submission Details</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Business Information</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Business Name</span>
                <span className={styles.fieldValue}>{submission.businessName}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Business Category</span>
                <span className={styles.fieldValue}>{submission.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Business Description</span>
                <span className={styles.fieldValue}>{submission.description}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Business Phone</span>
                <span className={styles.fieldValue}>{submission.businessPhone}</span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Location</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Business Address</span>
                <span className={styles.fieldValue}>{submission.businessAddress}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Area / Locality</span>
                <span className={styles.fieldValue}>{submission.areaLocality}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>City</span>
                <span className={styles.fieldValue}>{submission.city}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>State</span>
                <span className={styles.fieldValue}>{submission.state}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Pincode</span>
                <span className={styles.fieldValue}>{submission.pincode}</span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Business Hours</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Opening Time</span>
                <span className={styles.fieldValue}>{formatTime(submission.openingTime)}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Closing Time</span>
                <span className={styles.fieldValue}>{formatTime(submission.closingTime)}</span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Submission Information</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Submitted By</span>
                <span className={styles.fieldValue}>{submission.ownerName}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Submitted Date</span>
                <span className={styles.fieldValue}>{formatDate(submission.submittedAt)}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Current Status</span>
                <StatusBadge status={submission.status} />
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Last Updated</span>
                <span className={styles.fieldValue}>{formatDate(submission.updatedAt)}</span>
              </div>
              {submission.rejectionReason && (
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Rejection Reason</span>
                  <span className={`${styles.fieldValue} ${styles.rejectionReason}`}>{submission.rejectionReason}</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {submission.status === 'pending' && (
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
