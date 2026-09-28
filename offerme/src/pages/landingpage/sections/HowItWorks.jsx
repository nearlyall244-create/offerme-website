import { Search, Compass, CircleCheck, Handshake } from 'lucide-react'
import styles from './HowItWorks.module.css'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Search',
    description: 'Search for a business, service, category, or offer.',
  },
  {
    number: '02',
    icon: Compass,
    title: 'Discover',
    description: 'Explore businesses and offers near you.',
  },
  {
    number: '03',
    icon: CircleCheck,
    title: 'Choose',
    description: 'Find the business or offer that matches your needs.',
  },
  {
    number: '04',
    icon: Handshake,
    title: 'Connect',
    description: 'Claim an offer or connect with the business.',
  },
]

export default function HowItWorks() {
  return (
    <section className={styles.section} aria-labelledby="how-it-works-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 id="how-it-works-heading" className={styles.heading}>
            How OfferMe Works
          </h2>
          <p className={styles.subheading}>
            Discover local businesses and offers in just a few simple steps.
          </p>
        </header>

        <ol className={styles.steps}>
          {steps.map(({ number, icon: Icon, title, description }) => (
            <li key={number} className={styles.step}>
              <span className={styles.connector} aria-hidden="true" />
              <span className={styles.circle}>
                <Icon size={22} strokeWidth={2} aria-hidden="true" />
                <span className={styles.number}>{number}</span>
              </span>
              <h3 className={styles.stepTitle}>{title}</h3>
              <p className={styles.stepDesc}>{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
