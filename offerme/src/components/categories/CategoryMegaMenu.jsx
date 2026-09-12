import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './CategoryMegaMenu.module.css'

export default function CategoryMegaMenu({ onClose }) {
  const menuRef = useRef(null)
  const [categories, setCategories] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        setCategories(data.categories)
        setGroups(data.groups)
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleLinkClick = () => {
    onClose()
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.megaMenu} ref={menuRef} role="menu">
        {/* Mobile close header */}
        <div className={styles.mobileClose}>
          <span className={styles.mobileCloseTitle}>All Categories</span>
          <button
            className={styles.mobileCloseBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading categories...</div>
        ) : (
        <div className={styles.columnsGrid}>
          {groups.map((group) => {
            const groupCategories = categories.filter(c => c.group_id === group.id)
            if (groupCategories.length === 0) return null

            return (
              <div key={group.id} className={styles.groupBlock}>
                <div className={styles.groupHeading}>
                  <span>{group.icon}</span>
                  {group.name}
                </div>

                {groupCategories.map((cat) => (
                  <div key={cat.id}>
                    <Link
                      to={`/category/${cat.slug}`}
                      className={styles.categoryLink}
                      onClick={handleLinkClick}
                    >
                      <span className={styles.catIcon}>{cat.icon}</span>
                      {cat.name}
                    </Link>

                    {cat.sub_categories.length > 0 && (
                      <div className={styles.subList}>
                        {cat.sub_categories.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/category/${cat.slug}/${sub.slug}`}
                            className={styles.subLink}
                            onClick={handleLinkClick}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
        )}

        <div className={styles.menuFooter}>
          <Link
            to="/categories"
            className={styles.viewAllBtn}
            onClick={handleLinkClick}
          >
            View All Categories →
          </Link>
        </div>
      </div>
    </>
  )
}
