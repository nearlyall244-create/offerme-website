import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { CATEGORIES } from '@/data/categories'
import styles from './SellYourbussiness.module.css'

const MAX_DESCRIPTION_LENGTH = 500
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const INITIAL_FORM = {
  shopName: '',
  businessEmail: '',
  businessCategory: '',
  phoneNumber: '',
  shopAddress: '',
  description: '',
}

/* ── Helpers ────────────────────────────────────────────────────── */

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits)
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

/* ── Component ──────────────────────────────────────────────────── */

export default function SellYourbussiness({ onSuccess, onCancel, embedded = false }) {
  const { userProfile, isBusiness, getToken } = useAuth()
  const navigate = useNavigate()

  /* ── Form state ─────────────────────────────────────────────── */
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    shopName: userProfile?.owner_name || userProfile?.shop_name || '',
    businessEmail: userProfile?.email || '',
    phoneNumber: userProfile?.phone_number || '',
  }))
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef(null)
  const formRef = useRef(null)
  const firstErrorRef = useRef(null)

  /* ── Handlers ───────────────────────────────────────────────── */

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (prev[name]) {
        const next = { ...prev }
        delete next[name]
        return next
      }
      return prev
    })
  }, [])

  const handleImageSelect = useCallback((file) => {
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: 'Please select a JPG, JPEG, PNG, or WebP image.',
      }))
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        image: `Image must be smaller than ${formatFileSize(MAX_FILE_SIZE)}. Selected: ${formatFileSize(file.size)}.`,
      }))
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setErrors((prev) => {
      if (prev.image) {
        const next = { ...prev }
        delete next.image
        return next
      }
      return prev
    })
  }, [])

  const handleFileInputChange = useCallback(
    (e) => {
      handleImageSelect(e.target.files?.[0])
    },
    [handleImageSelect]
  )

  const handleRemoveImage = useCallback(() => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      handleImageSelect(e.dataTransfer.files?.[0])
    },
    [handleImageSelect]
  )

  /* ── Validation ─────────────────────────────────────────────── */

  function validate() {
    const errs = {}

    // Shop Name
    const shopName = form.shopName.trim()
    if (!shopName) {
      errs.shopName = 'Shop name is required.'
    } else if (shopName.length < 3) {
      errs.shopName = 'Shop name must be at least 3 characters.'
    }

    // Business Email
    const businessEmail = form.businessEmail.trim()
    if (!businessEmail) {
      errs.businessEmail = 'Business email is required.'
    } else if (!validateEmail(businessEmail)) {
      errs.businessEmail = 'Please enter a valid email address.'
    }

    // Business Category
    if (!form.businessCategory) {
      errs.businessCategory = 'Please select a business category.'
    }

    // Phone Number
    const phone = form.phoneNumber.trim()
    if (!phone) {
      errs.phoneNumber = 'Phone number is required.'
    } else if (!validatePhone(phone)) {
      errs.phoneNumber = 'Please enter a valid 10-digit Indian mobile number starting with 6-9.'
    }

    // Shop Address
    const address = form.shopAddress.trim()
    if (!address) {
      errs.shopAddress = 'Shop address is required.'
    } else if (address.length < 10) {
      errs.shopAddress = 'Please enter a complete address (at least 10 characters).'
    }

    // Image
    if (!imageFile && !imagePreview) {
      errs.image = 'Shop / business image is required. Please upload an image.'
    }

    // Description
    const desc = form.description.trim()
    if (!desc) {
      errs.description = 'Business description is required.'
    } else if (desc.length < 10) {
      errs.description = 'Description must be at least 10 characters.'
    }

    return errs
  }

  /* ── Submit ─────────────────────────────────────────────────── */

  async function handleSubmit(e) {
    e.preventDefault()

    // Role gate — frontend UX only; backend enforces authorization independently
    if (!isBusiness) {
      return
    }

    const errs = validate()
    setErrors(errs)

    if (Object.keys(errs).length > 0) {
      // Scroll to first error
      const firstKey = Object.keys(errs)[0]
      const fieldEl =
        document.querySelector(`[name="${firstKey}"]`) ||
        document.querySelector(`.${styles.imageUploadArea}`)
      if (fieldEl) {
        fieldEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        fieldEl.focus()
      }
      return
    }

    try {
      const token = await getToken()
      const payload = {
        shopName: form.shopName.trim(),
        businessEmail: form.businessEmail.trim(),
        businessCategory: form.businessCategory,
        phoneNumber: form.phoneNumber.trim(),
        shopAddress: form.shopAddress.trim(),
        description: form.description.trim(),
        imageUrl: imagePreview || null,
      }

      const response = await fetch('/api/offers?action=sell-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed. Please try again.')
      }

      setSubmitted(true)
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message || 'Submission failed. Please try again.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── Normal User: Promotion Panel ───────────────────────────── */

  if (userProfile?.role === 'user') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Sell Your Business</h1>
            <p className={styles.pageSubtitle}>
              List your business and reach thousands of local customers on OfferMe.
            </p>
          </div>

          <div className={styles.promoWrapper}>
            <div className={styles.promoCard}>
              <div className={styles.promoIconWrapper}>
                <span role="img" aria-label="rocket">🚀</span>
              </div>

              <h2 className={styles.promoTitle}>Become a Business Owner</h2>
              <p className={styles.promoDescription}>
                Want to promote your business and publish offers on OfferMe?
                Upgrade to a Business Owner account to unlock powerful tools
                for growing your local presence.
              </p>

              <div className={styles.benefitsGrid}>
                <div className={styles.benefitCard}>
                  <span className={styles.benefitCardIcon} role="img" aria-label="store">🏪</span>
                  <p className={styles.benefitCardTitle}>Publish Your Business</p>
                </div>
                <div className={styles.benefitCard}>
                  <span className={styles.benefitCardIcon} role="img" aria-label="deals">🎉</span>
                  <p className={styles.benefitCardTitle}>Create Offers &amp; Deals</p>
                </div>
                <div className={styles.benefitCard}>
                  <span className={styles.benefitCardIcon} role="img" aria-label="people">👥</span>
                  <p className={styles.benefitCardTitle}>Reach Nearby Customers</p>
                </div>
                <div className={styles.benefitCard}>
                  <span className={styles.benefitCardIcon} role="img" aria-label="megaphone">📣</span>
                  <p className={styles.benefitCardTitle}>Promote to Local Users</p>
                </div>
              </div>

              <div className={styles.promoActions}>
                <a href="/auth/business/register" className={styles.promoPrimaryBtn}>
                  Become a Business Owner →
                </a>
                <button
                  type="button"
                  className={styles.promoSecondaryBtn}
                  onClick={() => navigate('/dashboard')}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Business Owner: Full Form ──────────────────────────────── */

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Sell Your Business</h1>
          <p className={styles.pageSubtitle}>
            List your business and create offers to reach local customers on OfferMe.
          </p>
        </div>

        <div className={styles.contentGrid}>
          {/* ── Left Info Panel ───────────────────────────────── */}
          <div className={styles.infoPanel}>
            <span className={styles.infoEmoji} role="img" aria-label="storefront">
              🏪
            </span>
            <h2 className={styles.infoTitle}>List Your Business in Minutes</h2>
            <p className={styles.infoDescription}>
              Fill out the form to publish your business with an exciting offer.
              Once submitted, our team will review your listing and go live within 24 hours.
            </p>

            <ul className={styles.benefitsList}>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>✓</span>
                Reach thousands of local customers
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>✓</span>
                Create deals and discount coupons
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>✓</span>
                Appear in search and category listings
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>✓</span>
                Free to list — no hidden charges
              </li>
            </ul>

            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>
                <span role="img" aria-label="info">💡</span> Good to Know
              </h3>
              <p className={styles.infoCardText}>
                Make sure your business details are accurate. Listings with complete
                information and a clear image get approved faster and attract more
                customers.
              </p>
            </div>
          </div>

          {/* ── Right Form Card ──────────────────────────────── */}
          <div className={styles.formCard}>
            <h2 className={styles.formCardTitle}>Business &amp; Offer Details</h2>
            <p className={styles.formCardSubtitle}>
              All fields marked with <span style={{ color: '#ef4444' }}>*</span> are required.
            </p>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              className={styles.form}
            >
              {/* ── Section: Business Info ────────────────────── */}
              <h3 className={styles.sectionTitle}>Business Information</h3>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="shopName">
                    Shop Name <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    id="shopName"
                    name="shopName"
                    type="text"
                    placeholder="e.g. Krishna Snacks Corner"
                    value={form.shopName}
                    onChange={handleChange}
                    className={errors.shopName ? styles.fieldError : ''}
                    aria-invalid={!!errors.shopName}
                    aria-describedby={errors.shopName ? 'err-shopName' : undefined}
                  />
                  {errors.shopName && (
                    <span className={styles.fieldError} id="err-shopName" role="alert">
                      <span className={styles.errorIcon}>⚠</span> {errors.shopName}
                    </span>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="businessEmail">
                    Business Email <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    id="businessEmail"
                    name="businessEmail"
                    type="email"
                    placeholder="e.g. contact@krishnasnacks.com"
                    value={form.businessEmail}
                    onChange={handleChange}
                    className={errors.businessEmail ? styles.fieldError : ''}
                    aria-invalid={!!errors.businessEmail}
                    aria-describedby={errors.businessEmail ? 'err-businessEmail' : undefined}
                  />
                  {errors.businessEmail && (
                    <span className={styles.fieldError} id="err-businessEmail" role="alert">
                      <span className={styles.errorIcon}>⚠</span> {errors.businessEmail}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="businessCategory">
                    Business Category <span className={styles.requiredStar}>*</span>
                  </label>
                  <select
                    id="businessCategory"
                    name="businessCategory"
                    value={form.businessCategory}
                    onChange={handleChange}
                    className={errors.businessCategory ? styles.fieldError : ''}
                    aria-invalid={!!errors.businessCategory}
                    aria-describedby={errors.businessCategory ? 'err-businessCategory' : undefined}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.businessCategory && (
                    <span className={styles.fieldError} id="err-businessCategory" role="alert">
                      <span className={styles.errorIcon}>⚠</span> {errors.businessCategory}
                    </span>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="phoneNumber">
                    Phone Number <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className={errors.phoneNumber ? styles.fieldError : ''}
                    aria-invalid={!!errors.phoneNumber}
                    aria-describedby={errors.phoneNumber ? 'err-phoneNumber' : undefined}
                  />
                  {errors.phoneNumber && (
                    <span className={styles.fieldError} id="err-phoneNumber" role="alert">
                      <span className={styles.errorIcon}>⚠</span> {errors.phoneNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="shopAddress">
                  Shop Address <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="shopAddress"
                  name="shopAddress"
                  type="text"
                  placeholder="e.g. 42 MG Road, Andheri West, Mumbai 400058"
                  value={form.shopAddress}
                  onChange={handleChange}
                  className={errors.shopAddress ? styles.fieldError : ''}
                  aria-invalid={!!errors.shopAddress}
                  aria-describedby={errors.shopAddress ? 'err-shopAddress' : undefined}
                />
                {errors.shopAddress && (
                  <span className={styles.fieldError} id="err-shopAddress" role="alert">
                    <span className={styles.errorIcon}>⚠</span> {errors.shopAddress}
                  </span>
                )}
              </div>

              <hr className={styles.sectionDivider} />

              {/* ── Section: Image Upload ─────────────────────── */}
              <h3 className={styles.sectionTitle}>
                Shop / Business Image <span className={styles.requiredStar}>*</span>
              </h3>

              {imagePreview ? (
                <div className={styles.imagePreviewContainer}>
                  <img
                    src={imagePreview}
                    alt="Shop and offer preview"
                    className={styles.imagePreview}
                  />
                  <div className={styles.imagePreviewInfo}>
                    <span>{imageFile?.name}</span>
                    <span>({formatFileSize(imageFile?.size || 0)})</span>
                  </div>
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={handleRemoveImage}
                    aria-label="Remove uploaded image"
                  >
                    ✕ Remove Image
                  </button>
                </div>
              ) : (
                <div
                  className={`${styles.imageUploadArea} ${isDragOver ? styles.dragOver : ''} ${errors.image ? styles.hasError : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      fileInputRef.current?.click()
                    }
                  }}
                  aria-label="Upload shop and offer image"
                >
                  <span className={styles.imageUploadIcon} role="img" aria-label="camera">📷</span>
                  <p className={styles.imageUploadText}>
                    <strong>Click to upload</strong> or drag and drop
                  </p>
                  <p className={styles.imageUploadHint}>
                    JPG, JPEG, PNG or WebP — Max 5 MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileInputChange}
                    className={styles.imageUploadInput}
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </div>
              )}
              {errors.image && (
                <span className={styles.fieldError} role="alert">
                  <span className={styles.errorIcon}>⚠</span> {errors.image}
                </span>
              )}

              <hr className={styles.sectionDivider} />

              {/* ── Section: Description ──────────────────────── */}
              <h3 className={styles.sectionTitle}>Additional Details</h3>

              <div className={`${styles.field} ${errors.description ? styles.fieldError : ''}`}>
                <label htmlFor="description">
                  Description <span className={styles.requiredStar}>*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Tell customers more about your business..."
                  rows={4}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  value={form.description}
                  onChange={handleChange}
                />
                {errors.description && (
                  <span className={styles.fieldError} role="alert">
                    <span className={styles.errorIcon}>⚠</span> {errors.description}
                  </span>
                )}
                <span
                  className={`${styles.charCount} ${
                    form.description.length >= MAX_DESCRIPTION_LENGTH
                      ? styles.charCountAtLimit
                      : form.description.length >= MAX_DESCRIPTION_LENGTH * 0.9
                        ? styles.charCountNearLimit
                        : ''
                  }`}
                >
                  {form.description.length} / {MAX_DESCRIPTION_LENGTH}
                </span>
              </div>

              {/* ── Submit Error Banner ── */}
              {errors.submit && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: '0.875rem',
                  }}
                >
                  {errors.submit}
                </div>
              )}

              {/* ── Submit ────────────────────────────────────── */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className={styles.spinner} aria-hidden="true" />
                      Publishing...
                    </>
                  ) : (
                    'Submit Listing'
                  )}
                </button>
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    style={{
                      padding: '0.875rem 1.75rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: '0.625rem',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface-alt, #f1f5f9)',
                      color: 'var(--color-text-muted, #64748b)',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── Success Overlay ──────────────────────────────────── */}
      {submitted && (
        <div
          className={styles.successOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Submission successful"
        >
          <div className={styles.successCard}>
            <span className={styles.successEmoji} role="img" aria-label="success">
              ✅
            </span>
            <p
              className={styles.successMessage}
              style={{
                fontSize: '1.05rem',
                color: 'var(--color-text)',
                lineHeight: 1.6,
                margin: '0 0 1rem',
              }}
            >
              Once the activation is completed, you will be able to access your account and proceed with the next steps.
            </p>
            <p
              className={styles.successMessage}
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                margin: '0 0 1.5rem',
              }}
            >
              Thank you for your cooperation.
            </p>
            <button
              type="button"
              className={styles.successBtn}
              style={{
                minWidth: '130px',
                justifyContent: 'center',
                margin: '0 auto',
                fontSize: '1rem',
                padding: '0.75rem 2rem',
              }}
              onClick={() => {
                setSubmitted(false)
                if (onSuccess) {
                  onSuccess()
                } else {
                  navigate('/business/dashboard/posts')
                }
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
