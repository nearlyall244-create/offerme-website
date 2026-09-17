import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, formatDateTime } from '@/utils/date'
import styles from './BusinessOwnerDetails.module.css'

export default function BusinessOwnerDetails() {
  const { user } = useAuth()
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOwner, setSelectedOwner] = useState(null)

  useEffect(() => {
    requestAnimationFrame(async () => {
      if (!user) return
      try {
        setLoading(true)
        setError(null)
        const token = await user.getIdToken()
        const res = await fetch('/api/admin?type=owners', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setOwners(data.owners || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })
  }, [user])

  const filtered = useMemo(() => {
    let result = [...owners]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (o) =>
          (o.owner_name || '').toLowerCase().includes(q) ||
          (o.email || '').toLowerCase().includes(q) ||
          (o.phone_number || '').includes(q)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.account_status === statusFilter)
    }

    return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [owners, searchQuery, statusFilter])

  const handleStatusChange = async (ownerId, newStatus) => {
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ owner_id: ownerId, account_status: newStatus })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOwners((prev) => prev.map((o) => (o.id === ownerId ? { ...o, account_status: newStatus } : o)))
      if (selectedOwner?.id === ownerId) {
        setSelectedOwner((prev) => ({ ...prev, account_status: newStatus }))
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Business Owner Details</h1>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className={styles.content}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((owner) => (
                <tr key={owner.id} className={selectedOwner?.id === owner.id ? styles.rowActive : ''}>
                  <td className={styles.ownerName}>{owner.owner_name}</td>
                  <td>{owner.email}</td>
                  <td>{owner.phone_number || '—'}</td>
                  <td>{formatDate(owner.created_at)}</td>
                  <td>
                    <button className={styles.viewBtn} onClick={() => setSelectedOwner(owner)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>
                    {error ? `Error: ${error}` : 'No owners found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedOwner && (
          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>Owner Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedOwner(null)}>✕</button>
            </div>

            <div className={styles.detailBody}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Owner Information</h3>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Full Name</span>
                    <span className={styles.fieldValue}>{selectedOwner.owner_name}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Email</span>
                    <span className={styles.fieldValue}>{selectedOwner.email}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Phone Number</span>
                    <span className={styles.fieldValue}>{selectedOwner.phone_number}</span>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Business Submissions</h3>
                <p className={styles.noSubmissions}>Submissions will appear here once businesses are added.</p>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Account Information</h3>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Account Status</span>
                    <div className={styles.statusActions}>
                      {['active', 'pending', 'suspended'].map((s) => (
                        <button
                          key={s}
                          className={`${styles.statusBtn} ${selectedOwner.account_status === s ? styles.statusBtnActive : ''} ${styles[s]}`}
                          onClick={() => handleStatusChange(selectedOwner.id, s)}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Created Date</span>
                    <span className={styles.fieldValue}>{formatDateTime(selectedOwner.created_at)}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Firebase UID</span>
                    <span className={styles.fieldValue} style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{selectedOwner.firebase_uid}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
