import { useRef } from 'react'
import styles from './Iconsofcat.module.css'
import { CATEGORIES } from '@/data/categories'

export default function Iconsofcat({ onSelect }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (!scrollRef.current) return
    const amount = 200
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <section className={styles.section}>
      <div className={styles.wrapper}>
        <button
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div className={styles.scrollContainer} ref={scrollRef}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={styles.categoryItem}
              onClick={() => onSelect?.(cat)}
            >
              <span className={styles.iconCircle}>
                <span className={styles.icon}>{cat.icon}</span>
              </span>
              <span className={styles.label}>{cat.name}</span>
            </button>
          ))}

          <button className={styles.categoryItem} onClick={() => onSelect?.(null)}>
            <span className={`${styles.iconCircle} ${styles.popularCircle}`}>
              <span className={styles.popularIcon}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </span>
            <span className={styles.label}>Popular Categories</span>
          </button>
        </div>

        <button
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  )
}
