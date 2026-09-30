import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatDate } from '@/utils/date'
import styles from './AdminEnquiry.module.css'

export default function AdminEnquiry() {
  const { getToken } = useAuth()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchEnquiries = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      const res = await fetch('/api/admin?type=enquiries&limit=500', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load enquiries')
      setEnquiries(data.enquiries || [])
    } catch (err) {
      setError(err.message || 'Failed to load enquiries')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    requestAnimationFrame(() => { fetchEnquiries() })
  }, [fetchEnquiries])

  const filtered = enquiries.filter((e) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const fields = [e.name, e.email, e.phone_number, e.message].filter(Boolean).join(' ').toLowerCase()
    return fields.includes(q)
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Enquiry</h1>
        <p className={styles.subtitle}>Messages submitted from the Contact Us page.</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, email, phone, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.resultsBar}>
        <span className={styles.resultCount}>
          Showing {filtered.length} of {enquiries.length} message{enquiries.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.emptyCell}>Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={6} className={styles.emptyCell}>{error}</td></tr>
            ) : filtered.length > 0 ? (
              filtered.map((e) => (
                <tr key={e.id}>
                  <td className={styles.name}>{e.name || '—'}</td>
                  <td>{e.email || '—'}</td>
                  <td>{e.phone_number || '—'}</td>
                  <td className={styles.message}>{e.message || '—'}</td>
                  <td>{formatDate(e.created_at)}</td>
                  <td><StatusBadge status={e.status || 'new'} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>✉️</span>
                    <p>No enquiries found matching your search.</p>
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
