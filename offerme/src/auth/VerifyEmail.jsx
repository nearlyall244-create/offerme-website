import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Auth.module.css'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { reloadUser, sendVerificationEmail, completePendingSignup, userProfile, user } = useAuth()
  const email = location.state?.email || user?.email || ''
  const [resendSent, setResendSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const routeForRole = (role) => {
    const roleMap = { customer: 'user', vendor: 'business' }
    const normalized = roleMap[role] || role || 'user'
    const routeMap = {
      user: '/dashboard',
      business: '/business/dashboard',
      admin: '/admin/dashboard',
    }
    return routeMap[normalized] || '/dashboard'
  }

  const handleCheckVerified = async () => {
    setLoading(true)
    setError('')
    try {
      const refreshed = await reloadUser()
      if (!refreshed.emailVerified) {
        setError('Email still not verified. Check your inbox and click the verification link.')
        return
      }

      try {
        await completePendingSignup()
      } catch (profileErr) {
        if (profileErr?.message && !/already exists/i.test(profileErr.message)) {
          setError(profileErr.message)
          return
        }
      }

      navigate(routeForRole(userProfile?.role || location.state?.role || 'user'))
    } catch (err) {
      setError(err.message || 'Failed to check verification status')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    try {
      await sendVerificationEmail()
      setResendSent(true)
    } catch (err) {
      setError(err.message || 'Failed to resend verification email')
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.headerArea}>
          <div className={styles.verificationIcon}>📧</div>
          <h1 className={styles.title}>Verify Your Email</h1>
          <p className={styles.subtitle}>
            We've sent a verification link to{' '}
            <strong>{email || 'your email address'}</strong>
          </p>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className={styles.verificationBox}>
          <p className={styles.verificationText}>
            Please check your inbox and click the verification link to activate your account. Your profile is created only after the email is verified. You may need to check your spam folder.
          </p>

          <div className={styles.verificationActions}>
            <button
              onClick={handleCheckVerified}
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Checking...' : "I've Verified — Continue"}
            </button>

            <button
              onClick={handleResend}
              className={styles.secondaryBtn}
              disabled={resendSent}
            >
              {resendSent ? 'Email Sent!' : 'Resend Verification Email'}
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            <Link to="/auth/login" className={styles.link}>Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
