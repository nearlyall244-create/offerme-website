import { Link } from 'react-router-dom'
import styles from './Error.module.css'

export default function Unauthorized() {
  return (
    <div className={styles.page}>
      <h1 className={styles.code}>403</h1>
      <p className={styles.message}>You don't have access to this page</p>
      <Link to="/" className={styles.link}>Go Home</Link>
    </div>
  )
}
