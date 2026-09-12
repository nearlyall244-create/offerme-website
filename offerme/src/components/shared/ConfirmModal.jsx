import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './ConfirmModal.module.css'

export default function ConfirmModal({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  success = false,
  successMessage = '',
  onConfirm,
  onCancel,
  children,
}) {
  const modalRef = useRef(null)
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open || success) return
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    confirmRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel, success])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={styles.overlay}
      onClick={success ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className={styles.modal} ref={modalRef} onClick={(e) => e.stopPropagation()}>
        {success ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className={styles.successMessage}>{successMessage}</p>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h2 id="confirm-modal-title" className={styles.title}>{title}</h2>
              <button className={styles.closeBtn} onClick={onCancel} aria-label="Close">✕</button>
            </div>
            <p className={styles.message}>{message}</p>
            {children}
            <div className={styles.footer}>
              <button className={styles.cancelBtn} onClick={onCancel}>{cancelLabel}</button>
              <button
                ref={confirmRef}
                className={`${styles.confirmBtn} ${danger ? styles.danger : ''}`}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
