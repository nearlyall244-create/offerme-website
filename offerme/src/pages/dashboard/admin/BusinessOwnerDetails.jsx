import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, formatDateTime } from '@/utils/date'
import ConfirmModal from '@/components/shared/ConfirmModal'
import styles from './BusinessOwnerDetails.module.css'

const DELETION_STATUS_LABELS = {
  no_request: 'No Request',
  requested: 'Requested',
  rejected: 'Rejected',
  approved: 'Approved',
}

export default function BusinessOwnerDetails() {
  const { user } = useAuth()
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [ownerToDelete, setOwnerToDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  // Deletion request review state
  const [viewRequestOwner, setViewRequestOwner] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [deletionActionId, setDeletionActionId] = useState(null)

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

  const handleDeletionAction = async () => {
    const target = rejectTarget
    if (!target) return
    setDeletionActionId(target.id)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          owner_id: target.id,
          action: 'reject-deletion',
          admin_response: (rejectReason || '').trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const updated = data.owner
      setOwners((prev) => prev.map((o) => (o.id === target.id ? { ...o, ...updated } : o)))
      setSelectedOwner((prev) => (prev?.id === target.id ? { ...prev, ...updated } : prev))
      setViewRequestOwner((prev) => (prev?.id === target.id ? { ...prev, ...updated } : prev))
      setRejectTarget(null)
      setRejectReason('')
    } catch (err) {
      alert(`Failed to reject request: ${err.message}`)
    } finally {
      setDeletionActionId(null)
    }
  }

  const handleDeleteOwner = useCallback((owner) => {
    setOwnerToDelete(owner)
    setShowDeleteModal(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!ownerToDelete) return
    setDeletingId(ownerToDelete.id)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/admin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ owner_id: ownerToDelete.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.details || data.error || 'Failed to delete owner')
      setOwners((prev) => prev.filter((o) => o.id !== ownerToDelete.id))
      if (selectedOwner?.id === ownerToDelete.id) {
        setSelectedOwner(null)
      }
      setShowDeleteModal(false)
      setOwnerToDelete(null)
    } catch (err) {
      alert('Failed to delete owner: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }, [ownerToDelete, selectedOwner, user])

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
                <th>Deletion Request</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((owner) => {
                const delStatus = owner.deletion_status || 'no_request'
                const delBadgeClass =
                  delStatus === 'requested'
                    ? styles.deletionBadgeRequested
                    : delStatus === 'rejected'
                      ? styles.deletionBadgeRejected
                      : delStatus === 'approved'
                        ? styles.deletionBadgeApproved
                        : styles.deletionBadgeNoRequest

                return (
                <tr key={owner.id} className={selectedOwner?.id === owner.id ? styles.rowActive : ''}>
                  <td className={styles.ownerName}>{owner.owner_name}</td>
                  <td>{owner.email}</td>
                  <td>{owner.phone_number || '—'}</td>
                  <td>{formatDate(owner.created_at)}</td>
                  <td>
                    <div className={styles.deletionCell}>
                      <span className={`${styles.deletionBadge} ${delBadgeClass}`}>
                        {DELETION_STATUS_LABELS[delStatus] || 'No Request'}
                      </span>
                      {delStatus === 'requested' && (
                        <div className={styles.deletionBtns}>
                          <button
                            className={styles.viewReqBtn}
                            onClick={() => setViewRequestOwner(owner)}
                          >
                            View Request
                          </button>
                          <button
                            className={styles.rejectReqBtn}
                            onClick={() => { setRejectReason(''); setRejectTarget(owner) }}
                            disabled={deletionActionId === owner.id}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {(delStatus === 'rejected' || delStatus === 'approved') && (
                        <div className={styles.deletionBtns}>
                          <button
                            className={styles.viewReqBtn}
                            onClick={() => setViewRequestOwner(owner)}
                          >
                            View Request
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button className={styles.viewBtn} onClick={() => setSelectedOwner(owner)}>
                        View
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteOwner(owner)}
                        disabled={deletingId === owner.id}
                      >
                        {deletingId === owner.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
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

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Business Owner"
        message={`Are you sure you want to delete "${ownerToDelete?.owner_name}"? This will permanently remove their account and all associated data. This action cannot be undone.`}
        confirmLabel="Delete"
        danger={true}
        onConfirm={confirmDelete}
        onCancel={() => { setShowDeleteModal(false); setOwnerToDelete(null) }}
      />

      {/* View Deletion Request */}
      <ConfirmModal
        open={!!viewRequestOwner}
        title="Account Deletion Request"
        confirmLabel="Close"
        hideCancel
        onConfirm={() => setViewRequestOwner(null)}
        onCancel={() => setViewRequestOwner(null)}
      >
        {viewRequestOwner && (
          <div className={styles.requestDetails}>
            <div className={styles.requestRow}>
              <span className={styles.requestLabel}>Request Message</span>
              <span className={styles.requestValue}>{viewRequestOwner.deletion_message || '—'}</span>
            </div>
            <div className={styles.requestRow}>
              <span className={styles.requestLabel}>Requested Date</span>
              <span className={styles.requestValue}>
                {viewRequestOwner.deletion_requested_at
                  ? formatDateTime(viewRequestOwner.deletion_requested_at)
                  : '—'}
              </span>
            </div>
          </div>
        )}
      </ConfirmModal>

      {/* Reject Deletion Request */}
      <ConfirmModal
        open={!!rejectTarget}
        title="Reject Account Deletion Request?"
        message="Are you sure you want to reject this account deletion request?"
        confirmLabel="Reject Request"
        cancelLabel="Cancel"
        danger
        confirmDisabled={deletionActionId === rejectTarget?.id}
        onConfirm={handleDeletionAction}
        onCancel={() => { setRejectTarget(null); setRejectReason('') }}
      >
        <div>
          <label className={styles.requestLabel} htmlFor="reject-reason" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Reason / Message (optional)
          </label>
          <textarea
            id="reject-reason"
            className={styles.requestTextarea}
            rows={3}
            maxLength={1000}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter a reason for rejecting the request..."
          />
        </div>
      </ConfirmModal>
    </div>
  )
}
