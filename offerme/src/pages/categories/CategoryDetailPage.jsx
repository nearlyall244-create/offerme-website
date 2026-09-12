import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCategoryBySlug, getSubcategoryBySlug } from '@/data/categories'
import { getListingsByCategory } from '@/data/mockListings'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/pages/footer/Footer'
import styles from './CategoryDetailPage.module.css'

function StarRating({ rating }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  let stars = ''
  for (let i = 0; i < full; i++) stars += '★'
  if (half) stars += '★'
  const remaining = 5 - full - (half ? 1 : 0)
  for (let i = 0; i < remaining; i++) stars += '☆'
  return <span className={styles.ratingStars}>{stars}</span>
}

export default function CategoryDetailPage() {
  const { slug, subSlug } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')

  const category = getCategoryBySlug(slug)

  if (!category) {
    return (
      <div>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.notFound}>
            <div className={styles.notFoundIcon}>🔍</div>
            <h1 className={styles.notFoundTitle}>Category Not Found</h1>
            <p className={styles.notFoundText}>
              The category you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/categories" className={styles.backLink}>
              ← Browse All Categories
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const subcategory = subSlug ? getSubcategoryBySlug(slug, subSlug) : null
  const hasSubcategories = category.subcategories.length > 0

  // Get listings filtered by category and optional subcategory
  const rawListings = getListingsByCategory(slug, subSlug || null)

  // Search and sort
  const listings = useMemo(() => {
    let result = rawListings

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q)
      )
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount
      return 0
    })

    return result
  }, [rawListings, searchQuery, sortBy])

  return (
    <div>
      <Navbar />
      <main className={styles.page}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link to="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link to="/categories" className={styles.breadcrumbLink}>Categories</Link>
          <span className={styles.breadcrumbSep}>›</span>
          {subcategory ? (
            <>
              <Link to={`/category/${slug}`} className={styles.breadcrumbLink}>
                {category.name}
              </Link>
              <span className={styles.breadcrumbSep}>›</span>
              <span className={styles.breadcrumbCurrent}>{subcategory.name}</span>
            </>
          ) : (
            <span className={styles.breadcrumbCurrent}>{category.name}</span>
          )}
        </nav>

        {/* Category Header */}
        <div className={styles.categoryHeader}>
          <span className={styles.categoryIcon}>
            {subcategory ? subcategory.icon : category.icon}
          </span>
          <div className={styles.categoryInfo}>
            <h1 className={styles.categoryName}>
              {subcategory ? `${category.name} — ${subcategory.name}` : category.name}
            </h1>
            <p className={styles.categoryDesc}>
              {subcategory ? subcategory.description : category.description}
            </p>
          </div>
        </div>

        {/* Subcategory Navigation Tabs */}
        {hasSubcategories && (
          <div className={styles.subNav}>
            <Link
              to={`/category/${slug}`}
              className={`${styles.subCard} ${!subSlug ? styles.subCardActive : ''}`}
            >
              <span className={styles.subCardName + ' ' + styles.allTab}>All</span>
            </Link>
            {category.subcategories.map((sub) => (
              <Link
                key={sub.id}
                to={`/category/${slug}/${sub.slug}`}
                className={`${styles.subCard} ${subSlug === sub.slug ? styles.subCardActive : ''}`}
              >
                <span className={styles.subCardIcon}>{sub.icon}</span>
                <span className={styles.subCardName}>{sub.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Toolbar — Search, Sort, Count */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={`Search in ${category.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating">Sort by Rating</option>
            <option value="name">Sort by Name</option>
            <option value="reviews">Sort by Reviews</option>
          </select>

          <span className={styles.resultCount}>
            {listings.length} result{listings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Business Listing Cards */}
        <div className={styles.listings}>
          {listings.length > 0 ? (
            listings.map((biz) => (
              <div key={biz.id} className={styles.listingCard}>
                <div className={styles.listingTop}>
                  <h3 className={styles.listingName}>{biz.name}</h3>
                  <span className={`${styles.listingBadge} ${biz.isOpen ? styles.badgeOpen : styles.badgeClosed}`}>
                    {biz.isOpen ? '● Open' : '● Closed'}
                  </span>
                </div>

                <div className={styles.listingRating}>
                  <StarRating rating={biz.rating} />
                  <span className={styles.ratingValue}>{biz.rating}</span>
                  <span>({biz.reviewCount} reviews)</span>
                </div>

                <p className={styles.listingAddress}>📍 {biz.address}</p>
                <p className={styles.listingDesc}>{biz.description}</p>

                {biz.offers.length > 0 && (
                  <div className={styles.listingOffers}>
                    {biz.offers.map((offer, idx) => (
                      <span key={idx} className={styles.offerTag}>
                        <span className={styles.offerIcon}>🏷️</span>
                        {offer}
                      </span>
                    ))}
                  </div>
                )}

                <p className={styles.listingHours}>
                  ⏰ {biz.openingTime} — {biz.closingTime}
                </p>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <h3 className={styles.emptyTitle}>No businesses found</h3>
              <p className={styles.emptyText}>
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Businesses will appear here once listed. Check back soon!'}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
