import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import styles from '../Auth.module.css'

export default function UserLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, signInWithGoogle, reloadUser, sendVerificationEmail } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNeedsVerification(false)

    if (!form.email.trim()) { setError('Please enter your email.'); return }
    if (!form.password) { setError('Please enter your password.'); return }

    setLoading(true)
    try {
      const firebaseUser = await signIn(form.email.trim(), form.password)

      if (!firebaseUser.emailVerified) {
        setNeedsVerification(true)
        setLoading(false)
        return
      }

      navigate('/dashboard')
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
      await signInWithGoogle('user')
      navigate('/dashboard')
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
        navigate('/dashboard')
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
        <div className={styles.headerArea}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Login to discover local deals</p>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {needsVerification ? (
          <div className={styles.verificationBox}>
            <div className={styles.verificationIcon}>📧</div>
            <h2 className={styles.verificationTitle}>Verify Your Email</h2>
            <p className={styles.verificationText}>
              We sent a verification link to <strong>{form.email}</strong>. Please check your inbox and click the link to verify your account.
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
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.field}>
                <label htmlFor="email">
                  Email <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="password">
                  Password <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={styles.eyeToggle}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
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
          <p className={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/auth/user/register" className={styles.link}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
