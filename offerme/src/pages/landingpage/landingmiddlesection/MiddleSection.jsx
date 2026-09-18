import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import styles from './MiddleSection.module.css'

const PROPERTY_TYPES = [
  {
    id: 'flats',
    title: 'Flats',
    image: '/images/properties/flats.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
    count: '140+ Properties',
  },
  {
    id: 'villas',
    title: 'Villas',
    image: '/images/properties/villas.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
    count: '55+ Luxury Homes',
  },
  {
    id: 'plots',
    title: 'Plots',
    image: '/images/properties/plots.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    count: '80+ Land Layouts',
  },
]

const EVENT_VENUE_TYPES = [
  {
    id: 'event-planner',
    title: 'Event Planner',
    image: '/images/events/event_planner.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
    count: '85+ Planners',
  },
  {
    id: 'kalyana-mandapams',
    title: 'Kalyana Mandapams',
    image: '/images/events/kalyana_mandapams.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80',
    count: '120+ Mandapams',
  },
  {
    id: 'party-halls',
    title: 'Party Halls',
    image: '/images/events/party_halls.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80',
    count: '95+ Venues',
  },
]

export default function MiddleSection() {
  return (
    <section className={styles.sectionWrapper} aria-label="Featured Properties and Venues">
      <div className={styles.container}>
        {/* 1st Card: Properties */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Properties </h2>
            <Link
              to="/category/real-estate-property"
              className={styles.viewAllLink}
            >
              <span>View All</span>
              <ArrowRight size={16} className={styles.arrowIcon} />
            </Link>
          </div>

          <div className={styles.propertyGrid}>
            {PROPERTY_TYPES.map((prop) => (
              <Link
                key={prop.id}
                to={`/category/real-estate-property?type=${prop.id}`}
                className={styles.propertyCard}
              >
                <div className={styles.imageContainer}>
                  <img
                    src={prop.image}
                    alt={prop.title}
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

        {/* 2nd Card: Event & Celebration Venues */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Event & Celebration Venues</h2>
            <Link
              to="/categories?search=event-venues"
              className={styles.viewAllLink}
            >
              <span>View All</span>
              <ArrowRight size={16} className={styles.arrowIcon} />
            </Link>
          </div>

          <div className={styles.propertyGrid}>
            {EVENT_VENUE_TYPES.map((venue) => (
              <Link
                key={venue.id}
                to={`/categories?type=${venue.id}`}
                className={styles.propertyCard}
              >
                <div className={styles.imageContainer}>
                  <img
                    src={venue.image}
                    alt={venue.title}
                    className={styles.propertyImg}
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== venue.fallbackImage) {
                        e.currentTarget.src = venue.fallbackImage
                      }
                    }}
                  />
                  <div className={styles.imageOverlay} />
                  <span className={styles.countBadge}>{venue.count}</span>
                </div>
                <h3 className={styles.propertyTypeTitle}>{venue.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
