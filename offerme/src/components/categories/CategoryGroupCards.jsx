import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './CategoryGroupCards.module.css'

const categories = [
  {
    title: 'Real Estate',
    subtitle: 'Flats, villas, plots & rentals',
    slug: 'real-estate-property',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    icon: '🏡',
    tag: 'Property',
  },
  {
    title: 'Education & Training',
    subtitle: 'Schools, colleges, coaching & tuitions',
    slug: 'education-training',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    icon: '🎓',
    tag: 'Learning',
  },
  {
    title: 'Healthcare',
    subtitle: 'Hospitals, clinics, labs & pharmacies',
    slug: 'healthcare-medical',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&auto=format&fit=crop&q=80',
    icon: '🏥',
    tag: 'Medical',
  },
  {
    title: 'Home Services',
    subtitle: 'Plumbing, electrical, AC & repairs',
    slug: 'home-repair-maintenance',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    icon: '🔧',
    tag: 'Services',
  },
]

export default function CategoryGroupCards() {
  const navigate = useNavigate()

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>DISCOVER POPULAR CATEGORIES</span>
          <h2 className={styles.heading}>What are you looking for?</h2>
        </div>
        <Link to="/categories" className={styles.viewAllBtn}>
          <span>View All Categories</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      <div className={styles.grid}>
        {categories.map((item) => (
          <div
            key={item.slug}
            className={styles.card}
          >
            <Link to={`/category/${item.slug}`} className={styles.cardLink}>
              <div className={styles.cardTop}>
                <img
                  src={item.image}
                  alt={item.title}
                  className={styles.thumbImg}
                  loading="lazy"
                />
                <span className={styles.tag}>{item.tag}</span>
              </div>

              <div className={styles.cardBottom}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardSubtitle}>{item.subtitle}</p>
              </div>
            </Link>

            <div className={styles.arrowRow}>
              <span className={styles.exploreText}>Explore Offers</span>
              <motion.button
                type="button"
                className={styles.arrowBtn}
                onClick={() => navigate(`/category/${item.slug}`)}
                initial={{ "--shiny-x": "100%" }}
                whileHover={{ "--shiny-x": "-100%" }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 0.5,
                  type: "spring",
                  stiffness: 20,
                  damping: 15,
                  mass: 2,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </motion.button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
