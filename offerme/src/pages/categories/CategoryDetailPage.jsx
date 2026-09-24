import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/pages/footer/Footer'
import OfferDetailModal from '@/components/shared/OfferDetailModal'
import styles from './CategoryDetailPage.module.css'

export default function CategoryDetailPage() {
  const { slug, subSlug } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [rawListings, setRawListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [detailShop, setDetailShop] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        setCategories(data.categories || [])
      } catch {
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch(`/api/shops?category=${slug}&limit=100`)
        const data = await res.json()
        setRawListings(data.shops || [])
      } catch {
        setRawListings([])
      } finally {
        setListingsLoading(false)
      }
    }
    if (slug) fetchListings()
  }, [slug])

  const category = categories.find((c) => c.slug === slug)

  const categoryListings = useMemo(() => {
    if (!subSlug) return rawListings
    return rawListings.filter((l) => l.subcategory === subSlug)
  }, [rawListings, subSlug])

  const listings = useMemo(() => {
    let result = categoryListings

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (l) =>
          (l.name || '').toLowerCase().includes(q) ||
          (l.description || '').toLowerCase().includes(q) ||
          (l.address || '').toLowerCase().includes(q) ||
          (l.offers || []).some((o) =>
            ((o.title || '') + ' ' + (o.discount_percent || '') + ' ' + (o.coupon_code || ''))
              .toLowerCase()
              .includes(q)
          )
      )
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount
      return 0
    })

    return result
  }, [categoryListings, debouncedSearch, sortBy])

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.notFound}>Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

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

  const subcategory = subSlug ? category?.sub_categories?.find((s) => s.slug === subSlug) : null
  const hasSubcategories = category.sub_categories?.length > 0

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
            {category.sub_categories?.map((sub) => (
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
          {listingsLoading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⏳</div>
              <h3 className={styles.emptyTitle}>Loading businesses...</h3>
              <p className={styles.emptyText}>Fetching latest listings</p>
            </div>
          ) : listings.length > 0 ? (
            listings.map((biz) => (
              <div key={biz.id} className={styles.listingCard}>
                <div className={styles.cardImageSection}>
                  {biz.image && (
                    <div className={styles.listingImageWrap}>
                      <img src={biz.image} alt={biz.name} className={styles.listingImage} />
                      <span className={styles.photoCount}>📷 1</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.listingName}>{biz.name}</h3>

                  <p className={styles.listingAddress}>📍 {biz.address}</p>

                  <p className={styles.listingDesc}>{biz.description}</p>

                  {biz.offers?.length > 0 && (
                    <div className={styles.offerBadges}>
                      {biz.offers.map((o) => (
                        <span key={o.id} className={styles.offerBadge}>
                          {o.discount_percent ? `${o.discount_percent}% OFF` : 'Offer'}
                          {o.discount_value ? ` · ₹${o.discount_value}` : ''}
                        </span>
                      ))}
                      {biz.offers.filter((o) => o.coupon_code).map((o) => (
                        <span key={`coupon-${o.id}`} className={styles.couponChip}>
                          Code: {o.coupon_code}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={styles.listingFooter}>
                    <span className={styles.footerTime}>⏰ {biz.openingTime} — {biz.closingTime}</span>
                    {biz.phone && (
                      <span className={styles.footerPhone}>📞 {biz.phone}</span>
                    )}
                    <button className={styles.viewDetailsBtn} onClick={() => setDetailShop(biz)}>
                      View Details →
                    </button>
                  </div>
                </div>
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

      {detailShop && (
        <OfferDetailModal shop={detailShop} onClose={() => setDetailShop(null)} />
      )}
    </div>
  )
}
