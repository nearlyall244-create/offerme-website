import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  NAME_MAX,
  EMAIL_MAX,
  passwordStrength,
  isRegisterFormValid,
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from '@/utils/validation'
import styles from './Auth.module.css'

const EyeOpen = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
)
const EyeClosed = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
)

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <span className={styles.fieldError} id={id} role="alert">
      {message}
    </span>
  )
}

function StrengthMeter({ password }) {
  if (!password) return null
  const { score, label } = passwordStrength(password)
  const segClass = score === 1 ? styles.strengthSegWeak : score === 2 ? styles.strengthSegFair : styles.strengthSegStrong
  const labelClass = score === 1 ? styles.strengthLabelWeak : score === 2 ? styles.strengthLabelFair : styles.strengthLabelStrong
  return (
    <div className={styles.strengthMeter} aria-live="polite">
      <div className={styles.strengthTrack} aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`${styles.strengthSeg} ${n <= score ? segClass : ''}`} />
        ))}
      </div>
      <span className={`${styles.strengthLabel} ${labelClass}`}>Strength: {label}</span>
    </div>
  )
}

export default function RegisterForm({
  role,
  title,
  subtitle,
  loginPath,
  loginLabel = 'Login',
}) {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState({})

  const validators = {
    fullName: validateName,
    email: validateEmail,
    phoneNumber: validatePhone,
    password: validatePassword,
    confirmPassword: (v) => validateConfirmPassword(v, form.password),
  }

  const validateField = (name, value, formState = form) => {
    if (name === 'confirmPassword') return validateConfirmPassword(value, formState.password)
    if (validators[name]) return validators[name](value)
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const next = { ...form, [name]: value }
    setForm(next)
    setFormError('')
    if (touched[name] || errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value, next) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    if (name === 'password' && form.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(form.confirmPassword, value),
      }))
    }
  }

  const fieldProps = (name) => ({
    'aria-invalid': errors[name] ? 'true' : 'false',
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  const isValid = isRegisterFormValid(form)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const nextErrors = {}
    for (const key of Object.keys(validators)) {
      nextErrors[key] = validateField(key, form[key])
    }
    setErrors(nextErrors)
    setTouched({
      fullName: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
    })

    if (Object.values(nextErrors).some(Boolean) || !isValid) {
      setFormError('Please fix the highlighted fields.')
      return
    }

    setIsSubmitting(true)
    try {
      const displayName = form.fullName.trim()
      await signUp(form.email.trim(), form.password, displayName, role, form.phoneNumber.trim())
      navigate('/auth/verify-email', {
        state: { email: form.email.trim(), name: displayName, role },
      })
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.headerArea}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {formError && (
          <div className={styles.error} role="alert">
            <span className={styles.errorIcon}>⚠️</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="fullName">
              Full Name <span className={styles.requiredStar}>*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              maxLength={NAME_MAX}
              value={form.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Full Name"
              autoComplete="name"
              {...fieldProps('fullName')}
            />
            <FieldError id="fullName-error" message={errors.fullName} />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="email">
                Email <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={EMAIL_MAX}
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your email"
                autoComplete="email"
                {...fieldProps('email')}
              />
              <FieldError id="email-error" message={errors.email} />
            </div>

            <div className={styles.field}>
              <label htmlFor="phoneNumber">
                Phone Number <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={form.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="10-digit phone"
                maxLength={16}
                autoComplete="tel"
                {...fieldProps('phoneNumber')}
              />
              <FieldError id="phoneNumber-error" message={errors.phoneNumber} />
            </div>
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
                onBlur={handleBlur}
                placeholder="Enter password"
                autoComplete="new-password"
                {...fieldProps('password')}
              />
              <button
                type="button"
                className={styles.eyeToggle}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? EyeClosed : EyeOpen}
              </button>
            </div>
            <StrengthMeter password={form.password} />
            <FieldError id="password-error" message={errors.password} />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">
              Confirm Password <span className={styles.requiredStar}>*</span>
            </label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Re-enter password"
                autoComplete="new-password"
                {...fieldProps('confirmPassword')}
              />
              <button
                type="button"
                className={styles.eyeToggle}
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                tabIndex={-1}
              >
                {showConfirmPassword ? EyeClosed : EyeOpen}
              </button>
            </div>
            <FieldError id="confirmPassword-error" message={errors.confirmPassword} />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to={loginPath} className={styles.link}>
              {loginLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
