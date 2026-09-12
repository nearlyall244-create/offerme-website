import { useState } from 'react'
import styles from './RejectReasonModal.module.css'

const QUICK_REASONS = [
  'Invalid business information',
  'Incorrect category',
  'Missing address',
  'Duplicate business',
  'Incomplete business description',
  'Business address does not match area',
  'Missing business registration documents',
  'Inappropriate content',
]

export default function RejectReasonModal({ onConfirm, onCancel }) {
  const [selectedReason, setSelectedReason] = useState(null)
  const [customReason, setCustomReason] = useState('')

  const canConfirm = selectedReason !== null || customReason.trim().length > 0

  const handleChipClick = (reason) => {
    setSelectedReason(reason)
    setCustomReason('')
  }

  const handleConfirm = () => {
    const finalReason = customReason.trim() || selectedReason
    if (finalReason) {
      onConfirm(finalReason)
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Reject Business Submission</h2>
          <button className={styles.closeBtn} onClick={onCancel}>✕</button>
        </div>

        <div className={styles.body}>
          <p className={styles.label}>Reason for rejection:</p>

          <div className={styles.chips}>
            {QUICK_REASONS.map((reason) => (
              <button
                key={reason}
                className={`${styles.chip} ${selectedReason === reason ? styles.chipActive : ''}`}
                onClick={() => handleChipClick(reason)}
              >
                {reason}
              </button>
            ))}
          </div>

          <p className={styles.customLabel}>Or type a custom reason:</p>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Enter a custom rejection reason..."
            value={customReason}
            onChange={(e) => { setCustomReason(e.target.value); setSelectedReason(null) }}
          />
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button
            className={styles.confirmBtn}
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  )
}
