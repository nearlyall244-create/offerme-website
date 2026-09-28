import { Link } from 'react-router-dom'
import { Store, Tag, MapPin, Check, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import styles from './GrowYourBusiness.module.css'

const benefits = [
  'Create your business profile',
  'Showcase your products or services',
  'Publish offers and promotions',
  'Reach customers near your business',
]

const previewRows = [
  { icon: Store, label: 'Business profile' },
  { icon: Tag, label: 'Offers & promotions' },
  { icon: MapPin, label: 'Nearby customers' },
]

export default function GrowYourBusiness() {
  return (
    <section
      className={styles.section}
      aria-labelledby="grow-your-business-heading"
    >
      <div className={styles.panel}>
        <div className={styles.content}>
          <h2 id="grow-your-business-heading" className={styles.heading}>
            Grow Your Business with OfferMe
          </h2>
          <p className={styles.description}>
            Bring your local business online and help nearby customers discover
            what you offer.
          </p>

          <ul className={styles.benefitList}>
            {benefits.map((benefit) => (
              <li key={benefit} className={styles.benefit}>
                <span className={styles.check}>
                  <Check size={13} strokeWidth={3} aria-hidden="true" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <Link to="/sell-your-business" className={styles.ctaBtn}>
            List Your Business
            <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.profileCard}>
            <div className={styles.cardHeader} />
            <div className={styles.cardBody}>
              <div className={styles.identity}>
                <span className={styles.avatar}>
                  <Store size={24} strokeWidth={2} />
                </span>
                <div className={styles.identityText}>
                  <span className={styles.shopName}>Your Business</span>
                  <span className={styles.shopMeta}>
                    Products &amp; services · Near you
                  </span>
                </div>
              </div>

              <ul className={styles.previewList}>
                {previewRows.map(({ icon: Icon, label }) => (
                  <li key={label} className={styles.previewRow}>
                    <span className={styles.rowIcon}>
                      <Icon size={15} strokeWidth={2} />
                    </span>
                    <span className={styles.rowLabel}>{label}</span>
                    <Check
                      size={16}
                      strokeWidth={2.5}
                      className={styles.rowCheck}
                    />
                  </li>
                ))}
              </ul>

              <div className={styles.addRow}>
                <Plus size={15} strokeWidth={2.5} />
                Publish an offer
              </div>
            </div>
          </div>

          <span className={styles.floatingBadge}>
            <TrendingUp size={15} strokeWidth={2.5} />
            Reach nearby customers
          </span>
        </div>
      </div>
    </section>
  )
}
