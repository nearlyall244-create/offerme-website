import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Auth.module.css'

export default function UnifiedLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const { signIn, signInWithGoogle, reloadUser, sendVerificationEmail, getToken, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const routeByRole = (role) => {
    const routeMap = { user: '/dashboard', business: '/business/dashboard', admin: '/admin/dashboard' }
    navigate(routeMap[role] || '/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNeedsVerification(false)
    try {
      const firebaseUser = await signIn(email, password)

      if (!firebaseUser.emailVerified) {
        setNeedsVerification(true)
        setLoading(false)
        return
      }

      const token = await getToken()
      const res = await fetch('/api/auth?action=get-profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (!data.role) {
        setError('No account found for this email. Please sign up first.')
        setLoading(false)
        return
      }

      const roleMap = { customer: 'user', vendor: 'business' }
      const normalizedRole = roleMap[data.role] || data.role
      await refreshProfile()
      routeByRole(normalizedRole)
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const { role } = await signInWithGoogle('user')
      routeByRole(role)
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail()
      setResendSent(true)
    } catch (err) {
      setError(err.message || 'Failed to resend verification email')
    }
  }

  const handleCheckVerified = async () => {
    try {
      const refreshed = await reloadUser()
      if (refreshed.emailVerified) {
        setNeedsVerification(false)
        handleSubmit({ preventDefault: () => {} })
      } else {
        setError('Email still not verified. Check your inbox.')
      }
    } catch (err) {
      setError(err.message || 'Failed to check verification status')
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your OfferMe account</p>

        {error && <div className={styles.error}>{error}</div>}

        {needsVerification ? (
          <div className={styles.verificationBox}>
            <div className={styles.verificationIcon}>📧</div>
            <h2 className={styles.verificationTitle}>Verify Your Email</h2>
            <p className={styles.verificationText}>
              We sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to verify your account.
            </p>
            <div className={styles.verificationActions}>
              <button onClick={handleCheckVerified} className={styles.submitBtn}>
                I've Verified — Continue
              </button>
              <button
                onClick={handleResendVerification}
                className={styles.secondaryBtn}
                disabled={resendSent}
              >
                {resendSent ? 'Email Sent!' : 'Resend Verification Email'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="you@example.com"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Your password"
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <button onClick={handleGoogleSignIn} className={styles.googleBtn} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div className={styles.footer}>
          <p>Don't have an account? <Link to="/auth/signup">Sign up</Link></p>
        </div>
      </div>
    </div>
  )
}
