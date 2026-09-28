import { MapPin, Search, BadgePercent, HeartHandshake } from 'lucide-react'
import styles from './WhyOfferMe.module.css'

const reasons = [
  {
    icon: MapPin,
    title: 'Local Discovery',
    description: 'Discover businesses and services around your area.',
  },
  {
    icon: Search,
    title: 'Easy Discovery',
    description: 'Search categories, businesses, and offers easily.',
  },
  {
    icon: BadgePercent,
    title: 'Offers & Savings',
    description: 'Find deals and promotions from local businesses.',
  },
  {
    icon: HeartHandshake,
    title: 'Support Local Businesses',
    description: 'Help customers discover businesses in their community.',
  },
]

export default function WhyOfferMe() {
  return (
    <section className={styles.section} aria-labelledby="why-offerme-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 id="why-offerme-heading" className={styles.heading}>
            Why OfferMe?
          </h2>
          <p className={styles.subheading}>
            Everything you need to discover local businesses, services, and
            offers in one place.
          </p>
        </header>

        <div className={styles.grid}>
          {reasons.map(({ icon: Icon, title, description }) => (
            <article key={title} className={styles.item}>
              <span className={styles.iconWrap}>
                <Icon size={20} strokeWidth={2} aria-hidden="true" />
              </span>
              <div className={styles.itemText}>
                <h3 className={styles.itemTitle}>{title}</h3>
                <p className={styles.itemDesc}>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
