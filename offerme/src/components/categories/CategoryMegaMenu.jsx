import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_GROUPS, getCategoriesByGroup } from '@/data/categories'
import styles from './CategoryMegaMenu.module.css'

export default function CategoryMegaMenu({ onClose }) {
  const menuRef = useRef(null)

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

        <div className={styles.columnsGrid}>
          {CATEGORY_GROUPS.map((group) => {
            const groupCategories = getCategoriesByGroup(group.id)
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

                    {cat.subcategories.length > 0 && (
                      <div className={styles.subList}>
                        {cat.subcategories.map((sub) => (
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
