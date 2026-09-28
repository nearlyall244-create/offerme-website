import { Store, Tag, Handshake, TrendingUp } from 'lucide-react'
import styles from './WhatWeDo.module.css'

const features = [
  {
    icon: Store,
    title: 'Discover Local Businesses',
    description: 'Find restaurants, shops, services, and businesses near you.',
  },
  {
    icon: Tag,
    title: 'Explore Offers',
    description:
      'Discover special offers, discounts, and promotions from local businesses.',
  },
  {
    icon: Handshake,
    title: 'Connect with Businesses',
    description: 'Connect with local businesses for products and services.',
  },
  {
    icon: TrendingUp,
    title: 'Help Businesses Grow',
    description:
      'Give local businesses a simple way to reach nearby customers.',
  },
]

export default function WhatWeDo() {
  return (
    <section className={styles.section} aria-labelledby="what-we-do-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 id="what-we-do-heading" className={styles.heading}>
            What We Do
          </h2>
          <p className={styles.subheading}>
            Making local discovery simple, useful, and convenient.
          </p>
        </header>

        <div className={styles.grid}>
          {features.map(({ icon: Icon, title, description }) => (
            <article key={title} className={styles.card}>
              <span className={styles.iconWrap}>
                <Icon size={24} strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
