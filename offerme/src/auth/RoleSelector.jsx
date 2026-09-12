import { Link } from 'react-router-dom'
import styles from './RoleSelector.module.css'

export default function RoleSelector() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Your Account</h1>
        <p className={styles.subtitle}>Choose how you want to use OfferMe</p>

        <div className={styles.roles}>
          <Link to="/auth/user/register" className={styles.roleCard}>
            <span className={styles.roleIcon}>👤</span>
            <h2 className={styles.roleName}>User</h2>
            <p className={styles.roleDesc}>
              Browse offers, save favorites, and discover local deals
            </p>
            <span className={styles.roleBtn}>Sign up as User</span>
          </Link>

          <Link to="/auth/business/register" className={styles.roleCard}>
            <span className={styles.roleIcon}>🏪</span>
            <h2 className={styles.roleName}>Business Owner</h2>
            <p className={styles.roleDesc}>
              List your business, post offers, and reach more customers
            </p>
            <span className={styles.roleBtn}>Sign up as Business</span>
          </Link>
        </div>

        <p className={styles.loginText}>
          Already have an account?{' '}
          <Link to="/auth/login" className={styles.loginLink}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
