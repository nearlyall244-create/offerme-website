import { useState, useMemo } from 'react'
import { getAllSubmissions, getUniqueCategories, getUniqueCities, updateSubmissionStatus } from '@/data/mockSubmissions'
import { formatDate } from '@/utils/date'
import SubmissionDetailPanel from './SubmissionDetailPanel'
import RejectReasonModal from './RejectReasonModal'
import StatusBadge from '@/components/shared/StatusBadge'
import styles from './BusinessSubmissionApproval.module.css'

const ITEMS_PER_PAGE = 20

export default function BusinessSubmissionApproval() {
  const [submissions, setSubmissions] = useState(() => getAllSubmissions())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  const [viewingSubmission, setViewingSubmission] = useState(null)
  const [rejectingSubmission, setRejectingSubmission] = useState(null)

  const categories = useMemo(() => getUniqueCategories(), [])
  const cities = useMemo(() => getUniqueCities(), [])

  const filtered = useMemo(() => {
    let result = [...submissions]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.businessName.toLowerCase().includes(q) ||
          s.ownerName.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      result = result.filter((s) => s.category === categoryFilter)
    }

    if (cityFilter !== 'all') {
      result = result.filter((s) => s.city === cityFilter)
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.submittedAt) - new Date(a.submittedAt)
      if (sortBy === 'oldest') return new Date(a.submittedAt) - new Date(b.submittedAt)
      if (sortBy === 'name') return a.businessName.localeCompare(b.businessName)
      return 0
    })

    return result
  }, [submissions, searchQuery, statusFilter, categoryFilter, cityFilter, sortBy])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)

  const handleApprove = (id) => {
    updateSubmissionStatus(id, 'approved')
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'approved', updatedAt: new Date().toISOString() } : s)))
  }

  const handleRejectConfirm = (reason) => {
    if (!rejectingSubmission) return
    updateSubmissionStatus(rejectingSubmission.id, 'rejected', reason)
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === rejectingSubmission.id ? { ...s, status: 'rejected', rejectionReason: reason, updatedAt: new Date().toISOString() } : s
      )
    )
    setRejectingSubmission(null)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Business Submission Approval</h1>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by business name, owner, category, or city..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
          />
        </div>

        <select className={styles.filterSelect} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select className={styles.filterSelect} value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}>
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>

        <select className={styles.filterSelect} value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setCurrentPage(1) }}>
          <option value="all">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select className={styles.filterSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A-Z</option>
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
              <th>Business Name</th>
              <th>Owner</th>
              <th>Category</th>
              <th>City</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((sub) => (
                <tr key={sub.id}>
                  <td className={styles.businessName}>{sub.businessName}</td>
                  <td>{sub.ownerName}</td>
                  <td>{sub.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</td>
                  <td>{sub.city}</td>
                  <td>{formatDate(sub.submittedAt)}</td>
                  <td><StatusBadge status={sub.status} /></td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.viewBtn} onClick={() => setViewingSubmission(sub)}>
                        View
                      </button>
                      {sub.status === 'pending' && (
                        <>
                          <button className={styles.approveBtn} onClick={() => handleApprove(sub.id)}>
                            Approve
                          </button>
                          <button className={styles.rejectBtn} onClick={() => setRejectingSubmission(sub)}>
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
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
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
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
          <button
            className={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
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
