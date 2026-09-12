import { useState, useMemo } from 'react'
import { getAllOwners, getAllSubmissions, updateOwnerStatus } from '@/data/mockSubmissions'
import { formatDate, formatDateTime } from '@/utils/date'
import StatusBadge from '@/components/shared/StatusBadge'
import styles from './BusinessOwnerDetails.module.css'

export default function BusinessOwnerDetails() {
  const [owners, setOwners] = useState(() => getAllOwners())
  const [submissions] = useState(() => getAllSubmissions())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOwner, setSelectedOwner] = useState(null)

  const filtered = useMemo(() => {
    let result = [...owners]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (o) =>
          `${o.firstName} ${o.lastName}`.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.phone.includes(q)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.accountStatus === statusFilter)
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [owners, searchQuery, statusFilter])

  const getOwnerSubmissions = (ownerId) => {
    return submissions.filter((s) => s.ownerId === ownerId)
  }

  const handleStatusChange = (ownerId, newStatus) => {
    updateOwnerStatus(ownerId, newStatus)
    setOwners((prev) => prev.map((o) => (o.id === ownerId ? { ...o, accountStatus: newStatus, updatedAt: new Date().toISOString() } : o)))
    if (selectedOwner?.id === ownerId) {
      setSelectedOwner((prev) => ({ ...prev, accountStatus: newStatus }))
    }
  }

  const selectedSubmissions = selectedOwner ? getOwnerSubmissions(selectedOwner.id) : []

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
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((owner) => (
                <tr key={owner.id} className={selectedOwner?.id === owner.id ? styles.rowActive : ''}>
                  <td className={styles.ownerName}>{owner.firstName} {owner.lastName}</td>
                  <td>{owner.email}</td>
                  <td>{owner.phone}</td>
                  <td><StatusBadge status={owner.accountStatus} /></td>
                  <td>{formatDate(owner.createdAt)}</td>
                  <td>
                    <button className={styles.viewBtn} onClick={() => setSelectedOwner(owner)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>No owners found.</td>
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
                    <span className={styles.fieldValue}>{selectedOwner.firstName} {selectedOwner.lastName}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Email</span>
                    <span className={styles.fieldValue}>{selectedOwner.email}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Phone Number</span>
                    <span className={styles.fieldValue}>{selectedOwner.phone}</span>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Business Submissions</h3>
                {selectedSubmissions.length > 0 ? (
                  <div className={styles.submissionList}>
                    {selectedSubmissions.map((sub) => (
                      <div key={sub.id} className={styles.submissionItem}>
                        <div className={styles.submissionInfo}>
                          <span className={styles.submissionName}>{sub.businessName}</span>
                          <span className={styles.submissionCategory}>{sub.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                        </div>
                        <StatusBadge status={sub.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noSubmissions}>No submissions yet.</p>
                )}
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
                          className={`${styles.statusBtn} ${selectedOwner.accountStatus === s ? styles.statusBtnActive : ''} ${styles[s]}`}
                          onClick={() => handleStatusChange(selectedOwner.id, s)}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Created Date</span>
                    <span className={styles.fieldValue}>{formatDateTime(selectedOwner.createdAt)}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Updated Date</span>
                    <span className={styles.fieldValue}>{formatDateTime(selectedOwner.updatedAt)}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Last Login</span>
                    <span className={styles.fieldValue}>{formatDateTime(selectedOwner.lastLogin)}</span>
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
