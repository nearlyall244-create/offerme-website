import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/utils/date'
import SubmissionDetailPanel from './SubmissionDetailPanel'
import RejectReasonModal from './RejectReasonModal'
import StatusBadge from '@/components/shared/StatusBadge'
import styles from './BusinessSubmissionApproval.module.css'

const ITEMS_PER_PAGE = 20

export default function BusinessSubmissionApproval() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const [viewingSubmission, setViewingSubmission] = useState(null)
  const [rejectingSubmission, setRejectingSubmission] = useState(null)

  useEffect(() => {
    if (!user) return
    requestAnimationFrame(async () => {
      setLoading(true)
      try {
        const token = await user.getIdToken()
        const res = await fetch('/api/admin?type=submissions', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) setSubmissions(data.submissions || [])
      } catch (err) {
        console.error('Failed to fetch submissions:', err)
      } finally {
        setLoading(false)
      }
    })
  }, [user])

  async function handleApprove(id) {
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shop_id: id, action: 'approve' }),
      })
      if (res.ok) {
        setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: 'approved', is_active: true } : s))
      }
    } catch (err) {
      console.error('Failed to approve:', err)
    }
  }

  async function handleRejectConfirm(reason) {
    if (!rejectingSubmission) return
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shop_id: rejectingSubmission.id, action: 'reject', rejection_reason: reason }),
      })
      if (res.ok) {
        setSubmissions((prev) => prev.map((s) => s.id === rejectingSubmission.id
          ? { ...s, status: 'rejected', is_active: false, rejection_reason: reason }
          : s
        ))
      }
    } catch (err) {
      console.error('Failed to reject:', err)
    }
    setRejectingSubmission(null)
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this business listing?')) return
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shop_id: id }),
      })
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete business listing')
      }
    } catch (err) {
      console.error('Failed to delete:', err)
      alert('Failed to delete business listing')
    }
  }

  const filtered = useMemo(() => {
    let result = [...submissions]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          (s.shop_name || '').toLowerCase().includes(q) ||
          (s.business_email || '').toLowerCase().includes(q) ||
          (s.enquiry_number || '').includes(q) ||
          (s.category_id || '').toLowerCase().includes(q) ||
          (s.subcategory_id || '').toLowerCase().includes(q) ||
          (s.business_owners?.owner_name || '').toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((s) => (s.status || (s.is_active ? 'approved' : 'pending')) === statusFilter)
    }

    return result
  }, [submissions, searchQuery, statusFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Business Submission Approval</h1>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by shop name, email, phone, category..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
          />
        </div>

        <select className={styles.filterSelect} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="deleted">Post Deleted</option>
        </select>
      </div>

      <div className={styles.resultsBar}>
        <span className={styles.resultCount}>
          Showing {startItem}–{endItem} of {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Shop Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className={styles.emptyCell}>Loading...</td></tr>
            ) : paginated.length > 0 ? (
              paginated.map((sub) => {
                const status = sub.status || (sub.is_active ? 'approved' : 'pending')
                return (
                  <tr key={sub.id}>
                    <td className={styles.businessName}>{sub.shop_name || '—'}</td>
                    <td>{sub.business_email || '—'}</td>
                    <td>{sub.enquiry_number || '—'}</td>
                    <td>{(sub.category_id || '—').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</td>
                    <td>{(sub.subcategory_id || '—').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</td>
                    <td>{formatDate(sub.created_at)}</td>
                    <td><StatusBadge status={status} /></td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.viewBtn} onClick={() => setViewingSubmission(sub)}>
                          View
                        </button>
                        {status === 'pending' && (
                          <>
                            <button className={styles.approveBtn} onClick={() => handleApprove(sub.id)}>
                              Approve
                            </button>
                            <button className={styles.rejectBtn} onClick={() => setRejectingSubmission(sub)}>
                              Reject
                            </button>
                          </>
                        )}
                        <button className={styles.deleteBtn} onClick={() => handleDelete(sub.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📭</span>
                    <p>No submissions found matching your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            ← Previous
          </button>
          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageNum} ${currentPage === page ? styles.pageNumActive : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button className={styles.pageBtn} disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}

      {viewingSubmission && (
        <SubmissionDetailPanel
          submission={viewingSubmission}
          onClose={() => setViewingSubmission(null)}
          onApprove={handleApprove}
          onReject={(sub) => { setViewingSubmission(null); setRejectingSubmission(sub) }}
        />
      )}

      {rejectingSubmission && (
        <RejectReasonModal
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectingSubmission(null)}
        />
      )}
    </div>
  )
}
