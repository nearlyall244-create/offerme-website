import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Phone, Gift } from 'lucide-react'
import { offersApi } from '@/lib/apiClient'
import styles from './ClaimOfferModal.module.css'

export default function ClaimOfferModal({ offer, offers, onClose }) {
  const offerList = offers || (offer ? [offer] : [])
  const [selectedId, setSelectedId] = useState(offer?.id || offerList[0]?.id || '')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [claimCode, setClaimCode] = useState(null)

  const selectedOffer = offerList.find(o => o.id === selectedId) || offerList[0]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleClaim = async (e) => {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    if (!selectedOffer) {
      setError('Please select an offer')
      return
    }

    try {
      setLoading(true)
      setError('')
      const result = await offersApi.claim({ offer_id: selectedOffer.id, phone_number: digits })
      setClaimCode(result.claim_code)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {success ? (
          <div className={styles.successContent}>
            <div className={styles.successIcon}>
              <Gift size={32} />
            </div>
            <h2 className={styles.successTitle}>Offer Claimed!</h2>
            <p className={styles.successText}>
              Your claim for <strong>{selectedOffer?.title}</strong> has been recorded.
            </p>
            {claimCode && (
              <div className={styles.claimCodeWrap}>
                <p className={styles.claimCodeLabel}>Show this code to the business owner:</p>
                <div className={styles.claimCode}>{claimCode}</div>
              </div>
            )}
            <button className={styles.doneBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleClaim}>
            <h2 className={styles.title}>Claim Offer</h2>

            {offerList.length > 1 && (
              <div className={styles.offerList}>
                {offerList.map(o => (
                  <button
                    key={o.id}
                    type="button"
                    className={`${styles.offerItem} ${selectedId === o.id ? styles.offerActive : ''}`}
                    onClick={() => setSelectedId(o.id)}
                  >
                    <span className={styles.offerItemTitle}>{o.title}</span>
                    {o.discount_percent && <span className={styles.offerDiscount}>{o.discount_percent}% off</span>}
                  </button>
                ))}
              </div>
            )}

            {selectedOffer && (
              <div className={styles.offerHeader}>
                <p className={styles.offerName}>{selectedOffer.title}</p>
                {selectedOffer.discount_percent && (
                  <span className={styles.discount}>{selectedOffer.discount_percent}% off</span>
                )}
              </div>
            )}

            <div className={styles.body}>
              <label className={styles.label} htmlFor="claim-phone">Phone Number</label>
              <div className={styles.phoneInput}>
                <Phone size={16} className={styles.phoneIcon} />
                <input
                  id="claim-phone"
                  type="tel"
                  className={styles.input}
                  placeholder="Enter your 10-digit phone number"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError('') }}
                  autoFocus
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
            </div>
            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.claimBtn} disabled={loading || !phone.trim()}>
                {loading ? 'Claiming...' : 'Claim Offer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}
