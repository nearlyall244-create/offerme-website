import { useState } from 'react'
import SellYourbussiness from '@/pages/dashboard/sellyourbusiness/SellYourbussiness'
import styles from './BusinessPosts.module.css'

export default function BusinessPosts() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Posts</h1>
          <p className={styles.subtitle}>Create and publish your business listings</p>
        </div>
      </div>

      {submitted ? (
        <div className={styles.empty}>
          <h3>Post submitted successfully!</h3>
          <p>Your business listing has been submitted and is awaiting admin approval.</p>
          <button onClick={() => setSubmitted(false)} className={styles.emptyAddBtn}>
            Create Another Post
          </button>
        </div>
      ) : (
        <div className={styles.formWrapper}>
          <SellYourbussiness
            embedded
            onSuccess={() => setSubmitted(true)}
          />
        </div>
      )}
    </div>
  )
}
