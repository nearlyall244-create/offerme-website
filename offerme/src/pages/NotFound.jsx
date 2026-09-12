import { Link } from 'react-router-dom'
import styles from './Error.module.css'

export default function NotFound() {
  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>Page not found</p>
      <Link to="/" className={styles.link}>Go Home</Link>
    </div>
  )
}
