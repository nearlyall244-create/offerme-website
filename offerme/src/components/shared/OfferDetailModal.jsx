import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, MapPin, Phone, Clock, Tag } from 'lucide-react'
import { formatDate } from '@/utils/date'
import styles from './OfferDetailModal.module.css'

function parseDescPrice(description, label) {
  if (!description) return null
  const m = description.match(new RegExp(`${label}:\\s*₹?\\s*([\\d.,]+)`, 'i'))
  return m ? m[1] : null
}

export default function OfferDetailModal({ shop, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!shop) return null

  const offers = shop.offers || []

  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="offer-detail-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className={styles.header}>
          {shop.image && <img src={shop.image} alt={shop.name} className={styles.heroImage} />}
          <div className={styles.headerInfo}>
            <h2 id="offer-detail-title" className={styles.shopName}>{shop.name}</h2>
            {shop.address && (
              <p className={styles.meta}><MapPin size={14} /> {shop.address}</p>
            )}
            {(shop.openingTime || shop.closingTime) && (
              <p className={styles.meta}><Clock size={14} /> {shop.openingTime} — {shop.closingTime}</p>
            )}
            {shop.phone && (
              <p className={styles.meta}><Phone size={14} /> {shop.phone}</p>
            )}
            {shop.description && <p className={styles.shopDesc}>{shop.description}</p>}
          </div>
        </div>

        <div className={styles.offersSection}>
          <h3 className={styles.sectionTitle}><Tag size={15} /> Offers</h3>

          {offers.length === 0 ? (
            <p className={styles.emptyText}>No active offers right now. Check back soon!</p>
          ) : (
            offers.map((o) => {
              const originalPrice = parseDescPrice(o.description, 'Original Price')
              const offerPrice = o.discount_value ?? parseDescPrice(o.description, 'Offer Price')

              return (
                <div key={o.id} className={styles.offerCard}>
                  <div className={styles.offerTop}>
                    <span className={styles.offerTitle}>{o.title}</span>
                    {o.discount_percent ? (
                      <span className={styles.discountBadge}>{o.discount_percent}% OFF</span>
                    ) : null}
                  </div>

                  <div className={styles.priceRow}>
                    {originalPrice && <span className={styles.originalPrice}>₹{originalPrice}</span>}
                    {offerPrice && <span className={styles.offerPrice}>₹{offerPrice}</span>}
                    {o.coupon_code && <span className={styles.couponChip}>Code: {o.coupon_code}</span>}
                  </div>

                  <div className={styles.offerFooter}>
                    {o.valid_until && (
                      <span className={styles.validUntil}>Valid until {formatDate(o.valid_until)}</span>
                    )}
                  </div>

                  {o.description && !o.description.startsWith('Original Price:') && (
                    <p className={styles.offerDesc}>{o.description}</p>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.doneBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
