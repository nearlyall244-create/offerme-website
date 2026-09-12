import styles from './UserFavorites.module.css'

export default function UserFavorites() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Favorites</h1>
      <p className={styles.empty}>No favorites yet. Browse offers and save the ones you like.</p>
    </div>
  )
}
