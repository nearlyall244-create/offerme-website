import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import styles from './FinalCTA.module.css'

export default function FinalCTA() {
  return (
    <section className={styles.section} aria-labelledby="final-cta-heading">
      <div className={styles.container}>
        <h2 id="final-cta-heading" className={styles.heading}>
          Discover What&apos;s Around You
        </h2>
        <p className={styles.description}>
          Find local businesses, explore offers, and connect with businesses
          near you — all in one place.
        </p>

        <div className={styles.actions}>
          <Link to="/categories" className={styles.primaryBtn}>
            Explore Businesses
            <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
          </Link>
          <Link to="/sell-your-business" className={styles.secondaryBtn}>
            List Your Business
          </Link>
        </div>
      </div>
    </section>
  )
}
