import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import styles from './PostDetailsPage.module.css'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

function StatusBadge({ status }) {
  const cls = status === 'approved' ? styles.statusApproved
    : status === 'rejected' ? styles.statusRejected
    : styles.statusPending
  return <span className={`${styles.statusBadge} ${cls}`}>{status || 'pending'}</span>
}

export default function PostDetailsPage() {
  const { getToken } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(1)
  const perPage = 10

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const token = await getToken()
        const res = await fetch('/api/admin?type=shops&limit=500', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!cancelled) setPosts(data.shops || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load posts')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [getToken])

  useEffect(() => {
    let cancelled = false
    async function loadCats() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (!cancelled && res.ok) setCategories(data.categories || [])
      } catch { /* silent */ }
    }
    loadCats()
    return () => { cancelled = true }
  }, [])

  const categoryMap = useMemo(() => {
    const map = {}
    categories.forEach((c) => { map[c.id] = c.name })
    return map
  }, [categories])

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter && (p.status || 'pending') !== statusFilter) return false
      if (categoryFilter && p.category_id !== categoryFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const fields = [p.shop_name, p.shop_address, p.business_email, p.enquiry_number, categoryMap[p.category_id], p.subcategory_id]
          .filter(Boolean).join(' ').toLowerCase()
        if (!fields.includes(q)) return false
      }
      return true
    })
  }, [posts, statusFilter, categoryFilter, search, categoryMap])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  useEffect(() => { setPage(1) }, [search, statusFilter, categoryFilter])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Post Details</h1>
        <p className={styles.subtitle}>All business listing posts with filtering and search.</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, address, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={styles.filterSelect}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className={styles.statsBar}>
        <span>Total: <strong>{filtered.length}</strong> posts</span>
        {filtered.length > perPage && <span>Page {page} of {totalPages}</span>}
      </div>

      {loading && <div className={styles.loadingState}>Loading posts...</div>}
      {error && <div className={styles.errorState}>{error}</div>}

      {!loading && !error && (
        <>
          {paged.length === 0 ? (
            <div className={styles.emptyState}>No posts found matching your filters.</div>
          ) : (
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
                  </tr>
                </thead>
                <tbody>
                  {paged.map((post) => (
                    <tr key={post.id}>
                      <td className={styles.shopNameCell}>{post.shop_name || '—'}</td>
                      <td>{post.business_email || '—'}</td>
                      <td>{post.enquiry_number || '—'}</td>
                      <td>{categoryMap[post.category_id] || post.category_id || '—'}</td>
                      <td>{post.subcategory_id || '—'}</td>
                      <td>{formatDate(post.created_at)}</td>
                      <td><StatusBadge status={post.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={styles.pageBtn}>← Prev</button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={styles.pageBtn}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
