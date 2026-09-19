import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import styles from './Auth.module.css'

export default function EmailAction() {
  const [params] = useSearchParams()
  const { refreshProfile } = useAuth()
  const [state, setState] = useState({ loading: true, error: '' })

  useEffect(() => {
    const completeAction = async () => {
      try {
        if (params.get('mode') !== 'verifyAndChangeEmail') {
          throw new Error('This is not a valid email-change link')
        }
        await authService.applyEmailActionCode(params.get('oobCode'))
        await refreshProfile()
        setState({ loading: false, error: '' })
      } catch (err) {
        setState({ loading: false, error: err.message || 'This email-change link is invalid or has expired.' })
      }
    }
    completeAction()
  }, [params, refreshProfile])

  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <h1 className={styles.title}>Confirm email change</h1>
        {state.loading ? (
          <p className={styles.subtitle}>Verifying your new email address…</p>
        ) : state.error ? (
          <>
            <p className={styles.error} role="alert">{state.error}</p>
            <Link className={styles.link} to="/dashboard/profile">Return to your profile</Link>
          </>
        ) : (
          <>
            <p className={styles.subtitle}>Your email address has been verified and updated.</p>
            <Link className={styles.link} to="/dashboard/profile">Return to your profile</Link>
          </>
        )}
      </section>
    </main>
  )
}
