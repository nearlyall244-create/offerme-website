import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, X, Star, MapPin, ChevronDown } from 'lucide-react'
import HerosecBelowcard from './HerosecBelowcard'
import FoldText from './FoldText'
import styles from './HeroSection.module.css'

const LOCATIONS = [
  { value: 'all', label: 'All Chennai' },
  { value: 't-nagar', label: 'T Nagar, Chennai' },
  { value: 'vadapalani', label: 'Vadapalani, Chennai' },
  { value: 'porur', label: 'Porur, Chennai' },
]

const AREA_KEYWORDS = {
  't-nagar': ['t. nagar', 't nagar', 'pondy bazaar', 'usman road', 'panagal park'],
  'vadapalani': ['vadapalani', 'habibullah road', 'aristos road'],
  'porur': ['porur', 'kodambakkam', 'aryagowda road'],
}

function matchesLocation(listing, locationValue) {
  if (locationValue === 'all') return true
  const keywords = AREA_KEYWORDS[locationValue] || []
  const addr = (listing.address || '').toLowerCase()
  return keywords.some((kw) => addr.includes(kw))
}

export default function HeroSection() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('t-nagar')
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)
  const locationRef = useRef(null)
  const navigate = useNavigate()

  const [allListings, setAllListings] = useState([])
  const [allCategories, setAllCategories] = useState([])

  useEffect(() => {
    fetch('/api/shops?limit=100')
      .then(r => r.json())
      .then(d => setAllListings(d.shops || []))
      .catch(() => {})
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setAllCategories(d.categories || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocationDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLocationLabel = LOCATIONS.find((l) => l.value === location)?.label || 'T Nagar, Chennai'

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || q.length < 2) return []

    const allAreas = ['t nagar', 'vadapalani', 'porur']
    const matchedAreas = allAreas.filter((area) => area.includes(q))
    let results = []

    matchedAreas.forEach((area) => {
      const locEntry = LOCATIONS.find((l) => l.label.toLowerCase().includes(area))
      if (locEntry) {
        results.push({ type: 'area', id: `area-${locEntry.value}`, label: locEntry.label, locationValue: locEntry.value })
      }
    })

    allCategories.forEach((cat) => {
      if (results.length >= 6) return
      if ((cat.name || '').toLowerCase().includes(q)) {
        results.push({ type: 'category', id: `cat-${cat.id}`, name: cat.name, icon: cat.icon, slug: cat.slug })
      }
      if (cat.sub_categories && Array.isArray(cat.sub_categories)) {
        cat.sub_categories.forEach((sub) => {
          if (results.length >= 6) return
          if ((sub.name || '').toLowerCase().includes(q)) {
            results.push({ type: 'subcategory', id: `sub-${sub.id || sub.slug}`, name: sub.name, icon: sub.icon, parentSlug: cat.slug, subSlug: sub.slug })
          }
        })
      }
    })

    const filteredListings = allListings
      .filter((l) => matchesLocation(l, location))
      .filter((l) =>
        (l.name || '').toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q) ||
        (l.category || '').toLowerCase().includes(q) ||
        (l.address || '').toLowerCase().includes(q)
      )
      .slice(0, Math.max(0, 6 - results.length))
    filteredListings.forEach((l) => {
      if (results.length >= 6) return
      results.push({ type: 'business', id: l.id, name: l.name, category: l.category, rating: l.rating, address: l.address })
    })

    return results.slice(0, 6)
  }, [query, location, allListings, allCategories])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())
    if (location !== 'all') params.set('location', location)
    navigate(`/categories?${params.toString()}`)
  }

  const handleSuggestionClick = (item) => {
    if (item.type === 'area') {
      setLocation(item.locationValue)
      setQuery('')
    } else if (item.type === 'category') {
      navigate(`/category/${item.slug}`)
      setQuery('')
    } else if (item.type === 'subcategory') {
      navigate(`/category/${item.parentSlug}/${item.subSlug}`)
      setQuery('')
    } else {
      setQuery(item.name)
      navigate(`/category/${item.category}`)
    }
    setShowSuggestions(false)
  }

  const handleLocationSelect = (value) => {
    setLocation(value)
    setShowLocationDropdown(false)
  }

  const clearSearch = () => {
    setQuery('')
    setShowSuggestions(false)
  }

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top Headline */}
          <div className={styles.headerBlock}>
            <h1 className={styles.title}>
              <FoldText
                text="Find the Best Offers Near You"
                splitBy="char"
                hinge="top"
                trigger="loop"
                repeatDelay={10}
                duration={0.65}
                stagger={0.04}
                ease="power3.out"
                perspective={700}
                creaseShading={0.55}
                fontSize="1em"
                fontWeight="inherit"
                color="currentColor"
                style={{ lineHeight: '1.15', letterSpacing: '-0.025em' }}
              />
            </h1>
            <p className={styles.subheadline}>
              Search across 5,000+ local businesses, verified deals & neighborhood services
            </p>
          </div>

          {/* Wide Centered Search Bar (Justdial-inspired) */}
          <div className={styles.searchRow}>
            <div className={styles.searchWrapper} ref={searchRef}>
              <form onSubmit={handleSearch} className={styles.searchBar}>
                {/* Location Dropdown */}
                <div className={styles.locationDropdown} ref={locationRef}>
                  <button
                    type="button"
                    className={styles.locationBtn}
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    aria-label="Select city location"
                  >
                    <MapPin size={17} className={styles.locationPin} />
                    <span className={styles.locationLabel}>{selectedLocationLabel}</span>
                    <ChevronDown size={14} className={`${styles.locationChevron} ${showLocationDropdown ? styles.locationChevronOpen : ''}`} />
                  </button>

                  {showLocationDropdown && (
                    <div className={styles.locationMenu}>
                      {LOCATIONS.map((loc) => (
                        <button
                          key={loc.value}
                          type="button"
                          className={`${styles.locationOption} ${location === loc.value ? styles.locationOptionActive : ''}`}
                          onClick={() => handleLocationSelect(loc.value)}
                        >
                          <MapPin size={14} />
                          {loc.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.searchDivider} />

                {/* Search Text Input */}
                <Search className={styles.searchIcon} size={19} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search for restaurants, shops, services, offers..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setShowSuggestions(e.target.value.length >= 2)
                  }}
                  onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  name="offerme_hero_search"
                />

                {query && (
                  <button type="button" className={styles.clearBtn} onClick={clearSearch} aria-label="Clear search">
                    <X size={16} />
                  </button>
                )}

                <button type="submit" className={styles.searchBtn}>
                  Search
                </button>
              </form>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className={styles.suggestions}>
                  {suggestions.map((item) => {
                    if (item.type === 'area') {
                      return (
                        <button key={item.id} className={styles.suggestionItem} onClick={() => handleSuggestionClick(item)}>
                          <div className={styles.suggestionInfo}>
                            <span className={styles.suggestionName}>
                              <MapPin size={14} className={styles.suggestionPin} />
                              {item.label}
                            </span>
                            <span className={styles.suggestionType}>Location</span>
                          </div>
                        </button>
                      )
                    }
                    if (item.type === 'category') {
                      return (
                        <button key={item.id} className={styles.suggestionItem} onClick={() => handleSuggestionClick(item)}>
                          <div className={styles.suggestionInfo}>
                            <span className={styles.suggestionName}>
                              <span>{item.icon}</span> {item.name}
                            </span>
                            <span className={styles.suggestionType}>Category</span>
                          </div>
                        </button>
                      )
                    }
                    if (item.type === 'subcategory') {
                      return (
                        <button key={item.id} className={styles.suggestionItem} onClick={() => handleSuggestionClick(item)}>
                          <div className={styles.suggestionInfo}>
                            <span className={styles.suggestionName}>
                              <span>{item.icon}</span> {item.name}
                            </span>
                            <span className={styles.suggestionType}>Subcategory</span>
                          </div>
                        </button>
                      )
                    }
                    return (
                      <button key={item.id} className={styles.suggestionItem} onClick={() => handleSuggestionClick(item)}>
                        <div className={styles.suggestionInfo}>
                          <span className={styles.suggestionName}>{item.name}</span>
                          <span className={styles.suggestionMeta}>
                            <Star size={12} />
                            {item.rating} · {(item.category || '').replace(/-/g, ' ')}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Justdial-Inspired Discovery Layout: Promotional Banner + Categories + Feature Strip ── */}
          <HerosecBelowcard />
        </motion.div>
      </div>
    </section>
  )
}
