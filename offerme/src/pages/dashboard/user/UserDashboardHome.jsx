import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, X, SlidersHorizontal, MapPin, Star, Clock, ChevronDown } from 'lucide-react'
import { getAllListings } from '@/data/mockListings'
import { CATEGORIES } from '@/data/categories'
import styles from './UserDashboardHome.module.css'

const RECENT_KEY = 'offerme_recent_searches'
const MAX_RECENT = 5

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'reviews', label: 'Most Reviews' },
  { value: 'offers', label: 'Most Offers' },
]

const LOCATION_OPTIONS = [
  { value: 'all', label: 'All Locations' },
  { value: 'nearby', label: 'Nearby (T. Nagar)' },
  { value: 'city', label: 'In City (Chennai)' },
]

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || []
  } catch {
    return []
  }
}

function saveRecentSearch(query) {
  const trimmed = query.trim()
  if (!trimmed) return
  const recent = getRecentSearches().filter((r) => r !== trimmed)
  recent.unshift(trimmed)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

function removeRecentSearch(query) {
  const recent = getRecentSearches().filter((r) => r !== query)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
}

export default function UserDashboardHome() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [locationFilter, setLocationFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [recentSearches, setRecentSearches] = useState(getRecentSearches)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)

  const allListings = useMemo(() => getAllListings(), [])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (q.length < 2) return []
    return allListings
      .filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q)
      )
      .slice(0, 6)
  }, [search, allListings])

  // Filtered and sorted results
  const results = useMemo(() => {
    let filtered = [...allListings]

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((l) => l.category === selectedCategory)
    }

    // Search filter
    const q = search.trim().toLowerCase()
    if (q) {
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q) ||
          (l.offers && l.offers.some((o) => o.toLowerCase().includes(q)))
      )
    }

    // Location filter
    if (locationFilter === 'nearby') {
      filtered = filtered.filter((l) => l.address.toLowerCase().includes('t. nagar'))
    } else if (locationFilter === 'city') {
      filtered = filtered.filter((l) => l.address.toLowerCase().includes('chennai'))
    }

    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'reviews') {
      filtered.sort((a, b) => b.reviewCount - a.reviewCount)
    } else if (sortBy === 'offers') {
      filtered.sort((a, b) => (b.offers?.length || 0) - (a.offers?.length || 0))
    }

    return filtered
  }, [allListings, search, sortBy, locationFilter, selectedCategory])

  const handleSearch = (value) => {
    setSearch(value)
    setShowSuggestions(false)
    if (value.trim()) {
      saveRecentSearch(value.trim())
      setRecentSearches(getRecentSearches())
    }
  }

  const handleSuggestionClick = (listing) => {
    setSearch(listing.name)
    setShowSuggestions(false)
    saveRecentSearch(listing.name)
    setRecentSearches(getRecentSearches())
  }

  const handleRecentClick = (query) => {
    setSearch(query)
    setShowSuggestions(false)
  }

  const handleRecentRemove = (e, query) => {
    e.stopPropagation()
    removeRecentSearch(query)
    setRecentSearches(getRecentSearches())
  }

  const clearSearch = () => {
    setSearch('')
    setShowSuggestions(false)
  }

  const clearCategory = () => {
    setSelectedCategory(null)
  }

  const hasActiveFilters = search || selectedCategory || locationFilter !== 'all'

  return (
    <div className={styles.page}>
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>What are you looking for?</h1>
        <p className={styles.heroSubtitle}>Discover local deals, offers, and businesses near you</p>

        {/* Search Input */}
        <div className={styles.searchWrapper} ref={searchRef}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search restaurants, shops, offers..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setShowSuggestions(e.target.value.length >= 2)
              }}
              onFocus={() => search.length >= 2 && setShowSuggestions(true)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search.trim()) {
                  saveRecentSearch(search.trim())
                  setRecentSearches(getRecentSearches())
                  setShowSuggestions(false)
                }
              }}
            />
            {search && (
              <button className={styles.clearBtn} onClick={clearSearch} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={styles.suggestions} ref={suggestionsRef}>
              {suggestions.map((listing) => (
                <button
                  key={listing.id}
                  className={styles.suggestionItem}
                  onClick={() => handleSuggestionClick(listing)}
                >
                  <div className={styles.suggestionInfo}>
                    <span className={styles.suggestionName}>{listing.name}</span>
                    <span className={styles.suggestionCategory}>{listing.category.replace(/-/g, ' ')}</span>
                  </div>
                  <div className={styles.suggestionMeta}>
                    <Star size={12} />
                    <span>{listing.rating}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !search && (
          <div className={styles.recentSection}>
            <span className={styles.recentLabel}>Recent:</span>
            <div className={styles.recentChips}>
              {recentSearches.map((query) => (
                <button key={query} className={styles.recentChip} onClick={() => handleRecentClick(query)}>
                  <Clock size={12} />
                  <span>{query}</span>
                  <span className={styles.recentRemove} onClick={(e) => handleRecentRemove(e, query)}>
                    <X size={10} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Filters Bar ──────────────────────────────────────── */}
      <section className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <SlidersHorizontal size={16} />
          <select
            className={styles.filterSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <MapPin size={16} />
          <select
            className={styles.filterSelect}
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            {LOCATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button className={styles.clearFilters} onClick={() => { clearSearch(); clearCategory(); setLocationFilter('all'); setSortBy('relevance') }}>
            <X size={14} />
            Clear all
          </button>
        )}
      </section>

      {/* ── Category Chips ───────────────────────────────────── */}
      <section className={styles.categoriesSection}>
        <div className={styles.categoriesScroll}>
          <button
            className={`${styles.categoryChip} ${!selectedCategory ? styles.categoryChipActive : ''}`}
            onClick={clearCategory}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryChip} ${selectedCategory === cat.id ? styles.categoryChipActive : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────── */}
      <section className={styles.resultsSection}>
        {hasActiveFilters && (
          <p className={styles.resultsCount}>
            Showing {results.length} result{results.length !== 1 ? 's' : ''}
            {search && <> for <strong>&ldquo;{search}&rdquo;</strong></>}
          </p>
        )}

        {results.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔍</span>
            <h3 className={styles.emptyTitle}>No results found</h3>
            <p className={styles.emptyDesc}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {results.map((listing) => (
              <div key={listing.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardCategory}>{listing.category.replace(/-/g, ' ')}</span>
                  {listing.isOpen ? (
                    <span className={styles.openBadge}>Open</span>
                  ) : (
                    <span className={styles.closedBadge}>Closed</span>
                  )}
                </div>
                <h3 className={styles.cardTitle}>{listing.name}</h3>
                <p className={styles.cardDesc}>{listing.description}</p>
                <div className={styles.cardMeta}>
                  <span className={styles.rating}>
                    <Star size={14} />
                    <strong>{listing.rating}</strong>
                    <span className={styles.reviewCount}>({listing.reviewCount})</span>
                  </span>
                  <span className={styles.address}>
                    <MapPin size={12} />
                    {listing.address.length > 30 ? listing.address.slice(0, 30) + '...' : listing.address}
                  </span>
                </div>
                {listing.offers && listing.offers.length > 0 && (
                  <div className={styles.cardOffers}>
                    {listing.offers.map((offer, i) => (
                      <span key={i} className={styles.offerTag}>{offer}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
