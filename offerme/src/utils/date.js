// ============================================================================
// OfferMe — Shared Date/Time Formatting Utilities
// Single source of truth for date formatting across all dashboards.
// ============================================================================

/** Format a date string to "26 Aug 2026" */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Format a time string like "14:30" to "2:30 PM" */
export function formatTime(timeStr) {
  if (!timeStr) return '—'
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

/** Format a date string to "26 Aug 2026, 2:30 PM" */
export function formatDateTime(dateStr) {
  if (!dateStr) return 'Never'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Format a category slug like "tea-shops" to "Tea Shops" */
export function formatSlug(slug) {
  if (!slug) return ''
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
