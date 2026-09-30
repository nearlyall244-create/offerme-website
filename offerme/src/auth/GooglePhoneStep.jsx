import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { NAME_MAX, validateName, validatePhone } from '@/utils/validation'
import styles from './Auth.module.css'
import roleStyles from './RoleSelector.module.css'

const ROLE_OPTIONS = [
  {
    role: 'user',
    icon: '👤',
    name: 'User',
    desc: 'Browse offers, save favorites, and discover local deals',
    label: 'Sign up as User',
  },
  {
    role: 'business',
    icon: '🏪',
    name: 'Business Owner',
    desc: 'List your business, post offers, and reach more customers',
    label: 'Sign up as Business',
  },
]

export default function GooglePhoneStep({ suggestedName = '', email = '', onDone, onCancel }) {
  const { completeGoogleSignup } = useAuth()
  const [selectedRole, setSelectedRole] = useState(null)
  const [name, setName] = useState(suggestedName)
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRole) return
    setFormError('')
    const nameErr = validateName(name)
    const phoneErr = validatePhone(phone)
    setErrors({ name: nameErr, phone: phoneErr })
    if (nameErr || phoneErr) {
      setFormError('Please fix the highlighted fields.')
      return
    }

    setSubmitting(true)
    try {
      const finalRole = await completeGoogleSignup(selectedRole, {
        name: name.trim(),
        phone_number: phone.trim(),
      })
      onDone(finalRole)
    } catch (err) {
      setFormError(err.message || 'Failed to complete signup.')
      setSubmitting(false)
    }
  }

  if (!selectedRole) {
    return (
      <div className={styles.phoneStepBox}>
        <p className={styles.phoneStepHint}>
          {email ? <>Signed in as <strong>{email}</strong>. </> : null}
          Choose how you want to use OfferMe to finish creating your account.
        </p>

        <div className={styles.roleChoiceGrid}>
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.role}
              type="button"
              className={roleStyles.roleCard}
              onClick={() => {
                setFormError('')
                setSelectedRole(option.role)
              }}
            >
              <span className={roleStyles.roleIcon}>{option.icon}</span>
              <span className={roleStyles.roleName}>{option.name}</span>
              <span className={roleStyles.roleDesc}>{option.desc}</span>
              <span className={roleStyles.roleBtn}>{option.label}</span>
            </button>
          ))}
        </div>

        {onCancel && (
          <div className={styles.verificationActions}>
            <button type="button" className={styles.secondaryBtn} onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
          </div>
        )}
      </div>
    )
  }

  const selectedRoleLabel = selectedRole === 'business' ? 'Business Owner' : 'User'

  return (
    <div className={styles.phoneStepBox}>
      <p className={styles.phoneStepHint}>
        {email ? <>Signed in as <strong>{email}</strong>. </> : null}
        Enter your name and phone number to finish creating your account. A valid phone number is required.
      </p>

      <p className={styles.roleChoiceNote}>
        Signing up as <strong>{selectedRoleLabel}</strong>{' '}
        <button
          type="button"
          className={styles.roleChangeBtn}
          onClick={() => {
            setSelectedRole(null)
            setFormError('')
            setErrors({})
          }}
          disabled={submitting}
        >
          Change
        </button>
      </p>

      {formError && (
        <div className={styles.error} role="alert">
          <span className={styles.errorIcon}>⚠️</span>
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="google-name">
            Full Name <span className={styles.requiredStar}>*</span>
          </label>
          <input
            id="google-name"
            name="name"
            type="text"
            required
            maxLength={NAME_MAX}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setErrors((p) => ({ ...p, name: '' }))
              setFormError('')
            }}
            onBlur={() => setErrors((p) => ({ ...p, name: validateName(name) }))}
            placeholder="Full Name"
            autoComplete="name"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'google-name-error' : undefined}
          />
          {errors.name && (
            <span className={styles.fieldError} id="google-name-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="google-phone">
            Phone Number <span className={styles.requiredStar}>*</span>
          </label>
          <input
            id="google-phone"
            name="phone"
            type="tel"
            required
            maxLength={16}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setErrors((p) => ({ ...p, phone: '' }))
              setFormError('')
            }}
            onBlur={() => setErrors((p) => ({ ...p, phone: validatePhone(phone) }))}
            placeholder="10-digit phone"
            autoComplete="tel"
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'google-phone-error' : undefined}
          />
          {errors.phone && (
            <span className={styles.fieldError} id="google-phone-error" role="alert">
              {errors.phone}
            </span>
          )}
        </div>

        <div className={styles.verificationActions}>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Saving...' : 'Continue'}
          </button>
          {onCancel && (
            <button type="button" className={styles.secondaryBtn} onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
