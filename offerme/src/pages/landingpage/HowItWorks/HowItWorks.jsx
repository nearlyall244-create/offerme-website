import { useNavigate } from 'react-router-dom'
import styles from './HowItWorks.module.css'

const STEPS = [
  {
    num: 1,
    title: 'Register your business',
    desc: 'Open the merchant portal and submit your business details.',
  },
  {
    num: 2,
    title: 'Get verified',
    desc: 'Our team reviews and verifies your listing for authenticity.',
  },
  {
    num: 3,
    title: 'Add your offers',
    desc: 'Publish your menu, offers, and upcoming events from the dashboard.',
  },
  {
    num: 4,
    title: 'Go live',
    desc: 'Your business appears to nearby shoppers browsing your category.',
  },
]

export default function HowItWorks() {
  const navigate = useNavigate()

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        Four steps to your first<br />customer.
      </h2>

      <div className={styles.grid}>
        {STEPS.map((step) => (
          <div key={step.num} className={styles.card}>
            <span className={styles.num}>{step.num}</span>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.desc}>{step.desc}</p>
          </div>
        ))}
      </div>

      <button className={styles.cta} onClick={() => navigate('/auth/business/register')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        Go to Merchant Portal
      </button>
    </section>
  )
}
