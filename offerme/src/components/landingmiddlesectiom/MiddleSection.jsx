import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import styles from './MiddleSection.module.css'

const LOCALITIES = [
  { id: 't-nagar', name: 'T Nagar' },
  { id: 'anna-nagar', name: 'Anna Nagar' },
  { id: 'velachery', name: 'Velachery' },
  { id: 'omr', name: 'OMR' },
  { id: 'adyar', name: 'Adyar' },
]

const PROPERTY_TYPES = [
  {
    id: 'flats',
    title: 'Flats',
    image: '/images/properties/flats.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
    count: '140+ Properties',
    description: 'Modern apartments & high-rise living',
  },
  {
    id: 'villas',
    title: 'Villas',
    image: '/images/properties/villas.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
    count: '55+ Luxury Homes',
    description: 'Independent homes & gated communities',
  },
  {
    id: 'plots',
    title: 'Plots',
    image: '/images/properties/plots.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    count: '80+ Land Layouts',
    description: 'Approved residential & investment plots',
  },
]

export default function MiddleSection({ defaultLocality = 'T Nagar' }) {
  const [selectedLocality, setSelectedLocality] = useState(defaultLocality)

  return (
    <section className={styles.sectionWrapper} aria-label="Featured Properties">
      <div className={styles.container}>
        {/* Locality Selector Bar */}
        <div className={styles.localitySelector}>
          <div className={styles.localityLabel}>
            <MapPin size={16} className={styles.locationPinIcon} />
            <span>Popular Localities:</span>
          </div>
          <div className={styles.pillsList}>
            {LOCALITIES.map((loc) => {
              const isActive = selectedLocality.toLowerCase() === loc.name.toLowerCase()
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedLocality(loc.name)}
                  className={`${styles.pillBtn} ${isActive ? styles.activePill : ''}`}
                >
                  {loc.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Property Showcase Card */}
        <div className={styles.cardContainer}>
          {/* Header Row */}
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Properties in {selectedLocality}</h2>
            <Link
              to={`/category/real-estate-property?locality=${encodeURIComponent(selectedLocality)}`}
              className={styles.viewAllLink}
            >
              <span>View All</span>
              <ArrowRight size={16} className={styles.arrowIcon} />
            </Link>
          </div>

          {/* Properties 3-column Grid */}
          <div className={styles.propertyGrid}>
            {PROPERTY_TYPES.map((prop) => (
              <Link
                key={prop.id}
                to={`/category/real-estate-property?type=${prop.id}&locality=${encodeURIComponent(selectedLocality)}`}
                className={styles.propertyCard}
              >
                <div className={styles.imageContainer}>
                  <img
                    src={prop.image}
                    alt={`${prop.title} in ${selectedLocality}`}
                    className={styles.propertyImg}
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== prop.fallbackImage) {
                        e.currentTarget.src = prop.fallbackImage
                      }
                    }}
                  />
                  <div className={styles.imageOverlay} />
                  <span className={styles.countBadge}>{prop.count}</span>
                </div>
                <h3 className={styles.propertyTypeTitle}>{prop.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
