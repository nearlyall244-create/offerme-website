import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import OffersDeals from '@/components/dashboard/OffersDeals'
import { Plus, Calendar, Tag, Trash2, Store, RefreshCw, Ticket } from 'lucide-react'
import styles from './OffersDealsPage.module.css'

export default function OffersDealsPage() {
  const { getToken } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const fetchOffers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      if (!token) {
        setLoading(false)
        return
      }

      const res = await fetch('/api/offers?mine=true', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load offers from offers_post')
      setOffers(data.offers || [])
    } catch (err) {
      console.error('Fetch offers error:', err)
      setError(err.message || 'Failed to load your offers')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchOffers()
  }, [fetchOffers])

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer from offers_post?')) return
    setDeletingId(offerId)
    try {
      const token = await getToken()
      const res = await fetch('/api/offers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ offer_id: offerId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete offer')
      }
      setOffers((prev) => prev.filter((o) => o.id !== offerId))
    } catch (err) {
      alert(err.message || 'Failed to delete offer')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Offers & Deals</h1>
          <p className={styles.subtitle}>
            Publish and manage special offers and discounts saved in <code>offers_post</code>
          </p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className={styles.addBtn}>
            <Plus size={18} />
            New Offer / Deal
          </button>
        )}
      </div>

      {showForm ? (
        <div className={styles.formWrapper}>
          <OffersDeals
            onSuccess={() => {
              setShowForm(false)
              fetchOffers()
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <>
          {loading ? (
            <div className={styles.loadingState}>
              <RefreshCw className={styles.spinIcon} size={24} />
              <p>Loading offers from offers_post...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button onClick={fetchOffers} className={styles.retryBtn}>Retry</button>
            </div>
          ) : offers.length === 0 ? (
            <div className={styles.empty}>
              <Store size={48} className={styles.emptyIcon} />
              <h3>No offers published yet</h3>
              <p>Create your first discount or promotional deal to attract customers to your business.</p>
              <button onClick={() => setShowForm(true)} className={styles.emptyAddBtn}>
                <Plus size={18} />
                Create New Offer / Deal
              </button>
            </div>
          ) : (
            <div className={styles.dealGrid}>
              {offers.map((deal) => {
                const isExpired = deal.valid_until && new Date(deal.valid_until) < new Date()
                const discount = deal.discount_percent || deal.discount_value

                return (
                  <div key={deal.id} className={styles.dealCard}>
                    {deal.image_url && (
                      <div className={styles.cardImageWrapper}>
                        <img src={deal.image_url} alt={deal.title} className={styles.cardImage} />
                        {discount && (
                          <span className={styles.discountBadge}>{discount}% OFF</span>
                        )}
                      </div>
                    )}

                    <div className={styles.cardBody}>
                      <div className={styles.cardHeader}>
                        <div>
                          <span className={styles.shopName}>
                            {deal.businesses?.shop_name || 'My Business'}
                          </span>
                          <h3 className={styles.dealTitle}>{deal.title}</h3>
                        </div>
                        <span
                          className={`${styles.statusBadge} ${
                            isExpired ? styles.statusExpired : styles.statusActive
                          }`}
                        >
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </div>

                      {deal.description && (
                        <p className={styles.dealDesc}>{deal.description}</p>
                      )}

                      {deal.coupon_code && (
                        <div className={styles.metaRow}>
                          <Ticket size={14} />
                          <span className={styles.couponBadge}>CODE: {deal.coupon_code}</span>
                        </div>
                      )}

                      {deal.valid_until && (
                        <div className={styles.metaRow}>
                          <Calendar size={14} />
                          <span>Valid till {new Date(deal.valid_until).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className={styles.cardFooter}>
                        <span className={styles.tableTag}>offers_post #{deal.id}</span>
                        <button
                          onClick={() => handleDelete(deal.id)}
                          disabled={deletingId === deal.id}
                          className={styles.deleteBtn}
                          title="Delete offer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
