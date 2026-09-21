import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle } from 'lucide-react'
import styles from './SuccessModal.module.css'

export default function SuccessModal({ open, icon, title, message, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          {icon || <CheckCircle size={48} />}
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <button className={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  )
}
