import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Utensils,
  ShoppingCart,
  Shirt,
  Sparkles,
  Smartphone,
  Home,
  HeartPulse,
  Car,
  GraduationCap,
  Briefcase,
  PartyPopper,
  Wrench,
  Dumbbell,
  Zap,
  Building,
  Users,
  ArrowUpRight,
  ChevronRight,
  Search,
  X,
  Layers,
} from 'lucide-react'
import { CATEGORY_GROUPS, getCategoriesByGroup } from '@/data/categories'
import styles from './CategoryWebPage.module.css'
import GroupCardBackground from './GroupCardBackground'

const MAX_VISIBLE = 3

// Curated metadata & design palette per category group
const GROUP_META = {
  'food-dining': {
    eyebrow: 'EAT & ENJOY',
    description: 'Restaurants, cafes, bakeries & street food.',
    icon: Utensils,
    color: '#f97316',
    lightBg: '#fff7ed',
  },
  'daily-needs': {
    eyebrow: 'FRESH & ESSENTIAL',
    description: 'Groceries, supermarkets & second-hand marketplace.',
    icon: ShoppingCart,
    color: '#10b981',
    lightBg: '#ecfdf5',
  },
  'fashion-lifestyle': {
    eyebrow: 'STYLE & LUXURY',
    description: 'Clothing, jewellery, gifts & accessories.',
    icon: Shirt,
    color: '#8b5cf6',
    lightBg: '#f5f3ff',
  },
  'beauty-wellness': {
    eyebrow: 'GLOW & RELAX',
    description: 'Salons, spas, cosmetics & grooming.',
    icon: Sparkles,
    color: '#ec4899',
    lightBg: '#fdf2f8',
  },
  'electronics-tech': {
    eyebrow: 'TECH & DIGITAL',
    description: 'Mobiles, computers, tech repair & IT services.',
    icon: Smartphone,
    color: '#0ea5e9',
    lightBg: '#f0f9ff',
  },
  'home-living': {
    eyebrow: 'HOME COMFORTS',
    description: 'Furniture, interior decor & furnishings.',
    icon: Home,
    color: '#d97706',
    lightBg: '#fffbeb',
  },
  'repair-construction': {
    eyebrow: 'BUILD & REPAIR',
    description: 'Contractors, plumbing, electrical & materials.',
    icon: Wrench,
    color: '#f59e0b',
    lightBg: '#fffbeb',
  },
  'healthcare-medical': {
    eyebrow: 'HEALTH & WELLNESS',
    description: 'Hospitals, clinics, doctors & pharmacies.',
    icon: HeartPulse,
    color: '#14b8a6',
    lightBg: '#f0fdfa',
  },
  'automotive-transport': {
    eyebrow: 'ON THE MOVE',
    description: 'Car & bike services, dealers, rentals & travel.',
    icon: Car,
    color: '#ef4444',
    lightBg: '#fef2f2',
  },
  'education-career': {
    eyebrow: 'LEARN & ACHIEVE',
    description: 'Schools, colleges, coaching, training & jobs.',
    icon: GraduationCap,
    color: '#6366f1',
    lightBg: '#eef2ff',
  },
  'sports-fitness': {
    eyebrow: 'FIT & ACTIVE',
    description: 'Gyms, fitness centres, academies & sports goods.',
    icon: Dumbbell,
    color: '#059669',
    lightBg: '#ecfdf5',
  },
  'events-creative': {
    eyebrow: 'CELEBRATE & CREATE',
    description: 'Event planning, mandapams, photography & rentals.',
    icon: PartyPopper,
    color: '#d946ef',
    lightBg: '#fdf4ff',
  },
  'business-finance': {
    eyebrow: 'BUSINESS & FINANCE',
    description: 'Lawyers, CAs, banking, insurance & industry.',
    icon: Briefcase,
    color: '#2563eb',
    lightBg: '#eff6ff',
  },
  'services-utilities': {
    eyebrow: 'SERVICES & UTILITIES',
    description: 'Domestic help, laundry, courier, utilities & security.',
    icon: Zap,
    color: '#0891b2',
    lightBg: '#ecfeff',
  },
  'property-realestate': {
    eyebrow: 'PROPERTY & HOMES',
    description: 'Property buying, renting, plots & real estate services.',
    icon: Building,
    color: '#7c3aed',
    lightBg: '#f5f3ff',
  },
  'family-community': {
    eyebrow: 'FAMILY & COMMUNITY',
    description: 'Kids, pet care, astrology & government services.',
    icon: Users,
    color: '#84cc16',
    lightBg: '#f7fee7',
  },
}

function getGroupMeta(group) {
  if (GROUP_META[group.id]) {
    return GROUP_META[group.id]
  }
  return {
    eyebrow: group.name.toUpperCase(),
    description: group.description || 'Explore local businesses near you.',
    icon: Layers,
    color: '#2563eb',
    lightBg: '#eff6ff',
  }
}

export default function CategoryWebPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { categoryId } = useParams()

  const filteredGroups = useMemo(() => {
    let groups = CATEGORY_GROUPS

    if (categoryId) {
      groups = groups.filter((g) => g.id === categoryId)
    }

    if (!searchQuery.trim()) {
      return groups
        .map((group) => ({
          ...group,
          categories: getCategoriesByGroup(group.id),
          meta: getGroupMeta(group),
        }))
        .filter((g) => g.categories.length > 0)
    }

    const query = searchQuery.toLowerCase().trim()

    return groups
      .map((group) => {
        const categories = getCategoriesByGroup(group.id).filter(
          (cat) =>
            cat.name.toLowerCase().includes(query) ||
            cat.subcategories.some((sub) => sub.name.toLowerCase().includes(query))
        )
        return {
          ...group,
          categories,
          meta: getGroupMeta(group),
        }
      })
      .filter((g) => g.categories.length > 0)
  }, [searchQuery, categoryId])

  const totalCount = filteredGroups.reduce((sum, g) => sum + g.categories.length, 0)

  return (
    <div className={styles.page}>
      {/* Header & Search */}
      <div className={styles.pageHeader}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search categories (e.g. Home Cleaning, Pest Control, Plumbing)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {searchQuery && (
          <p className={styles.resultCount}>
            {totalCount} {totalCount === 1 ? 'category' : 'categories'} found
          </p>
        )}

        {categoryId && (
          <div className={styles.categoryBreadcrumb}>
            <Link to="/categories" className={styles.backLink}>
              ← All Categories
            </Link>
          </div>
        )}
      </div>

      {/* Group Cards Grid */}
      {filteredGroups.length > 0 ? (
        <div className={`${styles.groupsGrid} ${categoryId ? styles.groupsGridSingle : ''}`}>
          {filteredGroups.map((group) => {
            const { meta } = group
            const IconComponent = meta.icon || Layers
            const visible = categoryId ? group.categories : group.categories.slice(0, MAX_VISIBLE)
            const totalGroupCategories = group.categories.length

            return (
              <div
                key={group.id}
                className={styles.groupCard}
                style={{
                  '--group-color': meta.color,
                  '--group-bg-light': meta.lightBg,
                }}
              >
                {/* Professional gradient background */}
                <GroupCardBackground groupId={group.id} />

                {/* Top Accent Line */}
                <div className={styles.cardAccentBar} />

                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderText}>
                    <span className={styles.cardEyebrow}>{meta.eyebrow}</span>
                    <h2 className={styles.cardTitle}>{group.name}</h2>
                    <p className={styles.cardDescription}>{meta.description}</p>
                  </div>
                  <div className={styles.cardBadge} aria-hidden="true">
                    <IconComponent size={22} strokeWidth={2.2} />
                  </div>
                </div>

                {/* Category List */}
                <ul className={`${styles.categoryList} ${categoryId ? styles.categoryListThreeCols : ''}`}>
                  {visible.map((cat) => {
                    return (
                      <li key={cat.id}>
                        <Link to={`/category/${cat.slug}`} className={styles.categoryItem}>
                          <span className={styles.timelineNode}>
                            <span className={styles.nodeCircle} />
                          </span>
                          <span className={styles.categoryName}>{cat.name}</span>
                          <span className={styles.categoryArrow}>
                            <ChevronRight size={16} strokeWidth={2.2} />
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>

                {/* Bottom Action Button (only on main categories overview page) */}
                {!categoryId && (
                  <div className={styles.cardFooter}>
                    <Link to={`/categories/${group.id}`} className={styles.exploreBtn}>
                      <span>+ see more</span>
                      <span className={styles.exploreArrow}>
                        <ArrowUpRight size={17} strokeWidth={2.4} />
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔍</span>
          <h3>No categories found</h3>
          <p>No categories match &quot;{searchQuery}&quot;. Try a different search term.</p>
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  )
}
