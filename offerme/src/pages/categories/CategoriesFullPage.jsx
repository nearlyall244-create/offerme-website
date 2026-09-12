import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CATEGORIES, CATEGORY_GROUPS } from '@/data/categories'
import styles from './CategoriesFullPage.module.css'

export default function CategoriesFullPage() {
  const { categoryId } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(categoryId || 'all')

  const filteredCategories = useMemo(() => {
    let list = CATEGORIES

    if (selectedGroup !== 'all') {
      list = list.filter((cat) => cat.group === selectedGroup)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((cat) => {
        const matchesCategory =
          cat.name.toLowerCase().includes(q) ||
          (cat.tagline && cat.tagline.toLowerCase().includes(q))
        const matchesSubcategory =
          cat.subcategories &&
          cat.subcategories.some((sub) => sub.name.toLowerCase().includes(q))
        return matchesCategory || matchesSubcategory
      })
    }

    return list
  }, [selectedGroup, searchQuery])

  return (
    <div className={styles.page}>
      {/* ── Breadcrumbs ────────────────────────────────────────── */}
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <div className={styles.container}>
          <Link to="/" className={styles.crumbHome}>
            Home
          </Link>
          <span className={styles.crumbDivider}>&gt;</span>
          <span className={styles.crumbCurrent}>Categories</span>
        </div>
      </nav>

      {/* ── Page Header ────────────────────────────────────────── */}
      <div className={styles.headerSection}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <div className={styles.titleArea}>
              <h1 className={styles.pageTitle}>All Categories</h1>
              <p className={styles.pageSubtitle}>
                Explore the best local businesses, services and exclusive offers near you.
              </p>
            </div>

            {/* Live Search */}
            <div className={styles.searchBox}>
              <svg
                className={styles.searchIcon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories or services..."
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={styles.clearBtn}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Group Filters */}
          <div className={styles.filterScroll}>
            <button
              type="button"
              onClick={() => setSelectedGroup('all')}
              className={`${styles.filterChip} ${selectedGroup === 'all' ? styles.filterChipActive : ''}`}
            >
              All Categories ({CATEGORIES.length})
            </button>
            {CATEGORY_GROUPS.map((group) => {
              const count = CATEGORIES.filter((c) => c.group === group.id).length
              if (count === 0) return null
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedGroup(group.id)}
                  className={`${styles.filterChip} ${selectedGroup === group.id ? styles.filterChipActive : ''}`}
                >
                  <span className={styles.chipIcon}>{group.icon}</span>
                  {group.name} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Category Cards Grid ────────────────────────────────── */}
      <main className={styles.mainContent}>
        <div className={styles.container}>
          {filteredCategories.length === 0 ? (
            <div className={styles.noResults}>
              <span className={styles.noResultsIcon}>🔍</span>
              <h3>No categories found</h3>
              <p>We couldn't find any categories matching "{searchQuery}".</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedGroup('all')
                }}
                className={styles.resetBtn}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredCategories.map((cat) => {
                const topSubcategories = cat.subcategories ? cat.subcategories.slice(0, 5) : []

                return (
                  <div key={cat.id} className={styles.card}>
                    {/* Card Top: Title, Tagline & Right Cutout Image */}
                    <div className={styles.cardHeader}>
                      <div className={styles.cardInfo}>
                        <Link to={`/category/${cat.slug}`} className={styles.cardTitleLink}>
                          <h2 className={styles.cardTitle}>{cat.name}</h2>
                        </Link>
                        <p className={styles.cardTagline}>
                          {cat.tagline || 'Delicious food, great offers'}
                        </p>
                      </div>

                      <div className={styles.cardImageWrap}>
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className={styles.cardImage}
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Subcategories List: Top 5 */}
                    <div className={styles.subList}>
                      {topSubcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          to={`/category/${cat.slug}/${sub.slug}`}
                          className={styles.subItem}
                        >
                          <div className={styles.subNameWrap}>
                            <span className={styles.subIcon}>{sub.icon || '•'}</span>
                            <span className={styles.subName}>{sub.name}</span>
                          </div>
                          <svg
                            className={styles.subChevron}
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Link>
                      ))}
                    </div>

                    {/* Card Footer: View All Button */}
                    <div className={styles.cardFooter}>
                      <Link to={`/category/${cat.slug}`} className={styles.viewAllBtn}>
                        View All
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
