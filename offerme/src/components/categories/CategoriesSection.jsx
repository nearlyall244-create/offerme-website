import { Link } from 'react-router-dom'
import { CATEGORIES } from '@/data/categories'
import styles from './CategoriesSection.module.css'

const row1 = CATEGORIES.slice(0, Math.ceil(CATEGORIES.length / 2))
const row2 = CATEGORIES.slice(Math.ceil(CATEGORIES.length / 2))

export default function CategoriesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.row}>
        <div className={styles.track}>
          {[...row1, ...row1].map((cat, i) => (
            <Link
              key={`${cat.id}-${i}`}
              to={`/category/${cat.slug}`}
              className={styles.card}
            >
              <div className={styles.iconWrap}>
                <span className={styles.icon}>{cat.icon}</span>
              </div>
              <span className={styles.name}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.track}>
          {[...row2, ...row2].map((cat, i) => (
            <Link
              key={`${cat.id}-${i}`}
              to={`/category/${cat.slug}`}
              className={styles.card}
            >
              <div className={styles.iconWrap}>
                <span className={styles.icon}>{cat.icon}</span>
              </div>
              <span className={styles.name}>{cat.name}</span>
            </Link>
          ))}
          <Link to="/categories" className={`${styles.card} ${styles.allCard}`}>
            <div className={`${styles.iconWrap} ${styles.allIconWrap}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>
            <span className={styles.name}>Popular Categories</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
