import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/utils/date'
import StatusBadge from '@/components/shared/StatusBadge'
import styles from './AdminOffers.module.css'

export default function AdminOffers() {
  const { getToken } = useAuth()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [busyId, setBusyId] = useState(null)

  const fetchOffers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      const res = await fetch('/api/admin?type=offers&limit=500', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load offers')
      setOffers(data.offers || [])
    } catch (err) {
      setError(err.message || 'Failed to load offers')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    requestAnimationFrame(() => { fetchOffers() })
  }, [fetchOffers])

  const handleAction = async (offerId, action) => {
    if (action === 'reject' && !window.confirm('Reject this offer?')) return
    setBusyId(offerId)
    try {
      const token = await getToken()
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ offer_id: offerId, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, is_active: action === 'approve' } : o)))
    } catch (err) {
      alert(err.message || 'Action failed')
    } finally {
      setBusyId(null)
    }
  }

  const offerStatus = (o) => {
    if (!o.is_active) return 'pending'
    if (o.valid_until && String(o.valid_until).slice(0, 10) < new Date().toISOString().split('T')[0]) {
      return 'expired'
    }
    return 'approved'
  }

  const filtered = offers.filter((o) => {
    const st = offerStatus(o)
    if (statusFilter === 'pending' && st !== 'pending') return false
    if (statusFilter === 'approved' && st !== 'approved') return false
    if (statusFilter === 'expired' && st !== 'expired') return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const fields = [o.title, o.coupon_code, o.sell_your_bussiness?.shop_name, o.sell_your_bussiness?.business_owners?.owner_name]
        .filter(Boolean).join(' ').toLowerCase()
      if (!fields.includes(q)) return false
    }
    return true
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Offers Details</h1>
        <p className={styles.subtitle}>Review and approve offers before they appear publicly.</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by title, coupon, shop, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="pending">Pending Approval</option>
          <option value="approved">Active</option>
          <option value="expired">Expired</option>
          <option value="all">All</option>
        </select>
      </div>

      <div className={styles.resultsBar}>
        <span className={styles.resultCount}>
          Showing {filtered.length} of {offers.length} offer{offers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Shop</th>
              <th>Discount</th>
              <th>Offer Price</th>
              <th>Coupon</th>
              <th>Valid Till</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className={styles.emptyCell}>Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={8} className={styles.emptyCell}>{error}</td></tr>
            ) : filtered.length > 0 ? (
              filtered.map((o) => {
                const st = offerStatus(o)
                return (
                  <tr key={o.id}>
                    <td className={styles.offerTitle}>{o.title || '—'}</td>
                    <td>{o.sell_your_bussiness?.shop_name || '—'}</td>
                    <td>{o.discount_percent ? `${o.discount_percent}%` : '—'}</td>
                    <td>{o.discount_value ? `₹${o.discount_value}` : '—'}</td>
                    <td>{o.coupon_code || '—'}</td>
                    <td>{o.valid_until ? formatDate(o.valid_until) : '—'}</td>
                    <td><StatusBadge status={st} /></td>
                    <td>
                      <div className={styles.actions}>
                        {!o.is_active && (
                          <>
                            <button
                              className={styles.approveBtn}
                              onClick={() => handleAction(o.id, 'approve')}
                              disabled={busyId === o.id}
                            >
                              Approve
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => handleAction(o.id, 'reject')}
                              disabled={busyId === o.id}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {o.is_active && (
                          <button
                            className={styles.rejectBtn}
                            onClick={() => handleAction(o.id, 'reject')}
                            disabled={busyId === o.id}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🏷️</span>
                    <p>No offers found matching your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
