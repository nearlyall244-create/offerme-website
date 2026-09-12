import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Iconsofcat.module.css'

const SPEED = 0.5

export default function Iconsofcat() {
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const isPaused = useRef(false)
  const animRef = useRef(null)
  const scrollPos = useRef(0)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    function autoScroll() {
      if (!scrollRef.current || isPaused.current) {
        animRef.current = requestAnimationFrame(autoScroll)
        return
      }

      const el = scrollRef.current
      scrollPos.current += SPEED

      if (scrollPos.current >= el.scrollWidth - el.clientWidth) {
        scrollPos.current = 0
        el.scrollLeft = 0
      } else {
        el.scrollLeft = scrollPos.current
      }

      animRef.current = requestAnimationFrame(autoScroll)
    }

    animRef.current = requestAnimationFrame(autoScroll)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  const handleMouseEnter = () => {
    isPaused.current = true
    if (scrollRef.current) {
      scrollPos.current = scrollRef.current.scrollLeft
    }
  }

  const handleMouseLeave = () => {
    isPaused.current = false
  }

  const handleClick = (cat) => {
    navigate(`/category/${cat.slug}`)
  }

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.scrollContainer}>
          <p style={{ padding: '1rem', color: '#888' }}>Loading categories...</p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div
        className={styles.scrollContainer}
        ref={scrollRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={styles.categoryItem}
            onClick={() => handleClick(cat)}
          >
            <span className={styles.iconCircle}>
              <span className={styles.icon}>{cat.icon}</span>
            </span>
            <span className={styles.label}>{cat.name}</span>
          </button>
        ))}

        <button
          className={styles.categoryItem}
          onClick={() => navigate('/categories')}
        >
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
    </section>
  )
}
