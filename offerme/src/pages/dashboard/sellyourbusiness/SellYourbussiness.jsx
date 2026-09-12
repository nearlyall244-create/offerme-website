import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import styles from './SellYourbussiness.module.css'

const MAX_DESCRIPTION_LENGTH = 500
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const INITIAL_FORM = {
  shopName: '',
  shopEmail: '',
  enquiryNumber: '',
  mainCategory: '',
  subcategory: '',
  openingTime: '09:00 AM',
  closingTime: '09:00 PM',
  shopAddress: '',
}

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

export default function SellYourbussiness({ onSuccess, onCancel, embedded = false }) {
  const { userProfile, isBusiness, getToken } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    shopName: userProfile?.owner_name || userProfile?.shop_name || '',
    shopEmail: userProfile?.email || '',
    enquiryNumber: userProfile?.phone_number || '',
  }))
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const fileInputRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (!cancelled && res.ok) {
          setCategories(data.categories || [])
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setCategoriesLoading(false)
      }
    }
    loadCategories()
    return () => { cancelled = true }
  }, [])

  const selectedCategory = useMemo(
    () => categories.find((cat) => String(cat.id) === String(form.mainCategory)) || null,
    [form.mainCategory, categories]
  )

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
      setErrors((prev) => ({ ...prev, image: 'Please select a JPG, JPEG, PNG, or WebP image.' }))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, image: `Image must be smaller than ${formatFileSize(MAX_FILE_SIZE)}.` }))
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

  const handleFileInputChange = useCallback((e) => {
    handleImageSelect(e.target.files?.[0])
  }, [handleImageSelect])

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

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    handleImageSelect(e.dataTransfer.files?.[0])
  }, [handleImageSelect])

  function validate() {
    const errs = {}

    const shopName = form.shopName.trim()
    if (!shopName) errs.shopName = 'Shop name is required.'
    else if (shopName.length < 3) errs.shopName = 'Shop name must be at least 3 characters.'

    const shopEmail = form.shopEmail.trim()
    if (!shopEmail) errs.shopEmail = 'Shop email is required.'
    else if (!validateEmail(shopEmail)) errs.shopEmail = 'Please enter a valid email address.'

    const phone = form.enquiryNumber.trim()
    if (!phone) errs.enquiryNumber = 'Enquiry number is required.'
    else if (!validatePhone(phone)) errs.enquiryNumber = 'Please enter a valid 10-digit Indian mobile number.'

    if (!form.mainCategory) errs.mainCategory = 'Please select a main category.'
    if (!form.subcategory) errs.subcategory = 'Please select a subcategory.'

    if (!form.openingTime) errs.openingTime = 'Opening time is required.'
    if (!form.closingTime) errs.closingTime = 'Closing time is required.'

    if (!imageFile && !imagePreview) errs.image = 'Shop image is required.'

    const address = form.shopAddress.trim()
    if (!address) errs.shopAddress = 'Shop address is required.'
    else if (address.length < 10) errs.shopAddress = 'Please enter a complete address (at least 10 characters).'

    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isBusiness) return

    const errs = validate()
    setErrors(errs)

    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0]
      const fieldEl = document.querySelector(`[name="${firstKey}"]`) || document.querySelector(`.${styles.imageUploadArea}`)
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
        businessEmail: form.shopEmail.trim(),
        businessCategory: form.mainCategory,
        businessSubcategory: form.subcategory,
        phoneNumber: form.enquiryNumber.trim(),
        shopAddress: form.shopAddress.trim(),
        description: `Opening: ${form.openingTime} | Closing: ${form.closingTime}`,
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
      if (!response.ok) throw new Error(data.error || 'Submission failed.')

      setSubmitted(true)
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message || 'Submission failed.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Normal User: Promotion Panel
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
                Upgrade to a Business Owner account to unlock powerful tools.
              </p>
              <div className={styles.promoActions}>
                <a href="/auth/business/register" className={styles.promoPrimaryBtn}>Become a Business Owner →</a>
                <button type="button" className={styles.promoSecondaryBtn} onClick={() => navigate('/dashboard')}>Maybe Later</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Business Owner: Full Form
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Post Shop Details</h1>
          <p className={styles.pageSubtitle}>
            Fill in your shop information to list your business on OfferMe.
          </p>
        </div>

        <div className={styles.formCard}>
          <form ref={formRef} onSubmit={handleSubmit} noValidate className={styles.form}>

            {/* Row 1: Shop Name + Shop Email */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="shopName">Shop Name <span className={styles.requiredStar}>*</span></label>
                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  placeholder="Enter your shop name"
                  value={form.shopName}
                  onChange={handleChange}
                  className={errors.shopName ? styles.fieldError : ''}
                />
                {errors.shopName && <span className={styles.errorText}>⚠ {errors.shopName}</span>}
              </div>
              <div className={styles.field}>
                <label htmlFor="shopEmail">Shop Email <span className={styles.requiredStar}>*</span></label>
                <input
                  id="shopEmail"
                  name="shopEmail"
                  type="email"
                  placeholder="Enter shop email address"
                  value={form.shopEmail}
                  onChange={handleChange}
                  className={errors.shopEmail ? styles.fieldError : ''}
                />
                {errors.shopEmail && <span className={styles.errorText}>⚠ {errors.shopEmail}</span>}
              </div>
            </div>

            {/* Row 2: Enquiry Number + Main Category */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="enquiryNumber">Enquiry Number <span className={styles.requiredStar}>*</span></label>
                <input
                  id="enquiryNumber"
                  name="enquiryNumber"
                  type="tel"
                  placeholder="Enter enquiry contact number"
                  maxLength={10}
                  value={form.enquiryNumber}
                  onChange={handleChange}
                  className={errors.enquiryNumber ? styles.fieldError : ''}
                />
                {errors.enquiryNumber && <span className={styles.errorText}>⚠ {errors.enquiryNumber}</span>}
              </div>
              <div className={styles.field}>
                <label htmlFor="mainCategory">Main Category <span className={styles.requiredStar}>*</span></label>
                <select
                  id="mainCategory"
                  name="mainCategory"
                  value={form.mainCategory}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, mainCategory: e.target.value, subcategory: '' }))
                    setErrors((prev) => {
                      if (prev.mainCategory) {
                        const next = { ...prev }
                        delete next.mainCategory
                        delete next.subcategory
                        return next
                      }
                      return prev
                    })
                  }}
                  className={errors.mainCategory ? styles.fieldError : ''}
                >
                  <option value="">{categoriesLoading ? 'Loading...' : 'Select or type a main category'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                {errors.mainCategory && <span className={styles.errorText}>⚠ {errors.mainCategory}</span>}
              </div>
            </div>

            {/* Row 3: Subcategory + Opening Time */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="subcategory">Subcategory <span className={styles.requiredStar}>*</span></label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  disabled={!form.mainCategory}
                  className={errors.subcategory ? styles.fieldError : ''}
                >
                  <option value="">{form.mainCategory ? 'Select or type a subcategory' : 'Select main category first'}</option>
                  {selectedCategory?.sub_categories?.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.icon} {sub.name}</option>
                  ))}
                </select>
                {errors.subcategory && <span className={styles.errorText}>⚠ {errors.subcategory}</span>}
              </div>
              <div className={styles.field}>
                <label htmlFor="openingTime">Opening Time <span className={styles.requiredStar}>*</span></label>
                <input
                  id="openingTime"
                  name="openingTime"
                  type="time"
                  value={form.openingTime.replace(/ (AM|PM)/, '')}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':')
                    const hour = parseInt(h, 10)
                    const ampm = hour >= 12 ? 'PM' : 'AM'
                    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                    setForm((prev) => ({ ...prev, openingTime: `${String(h12).padStart(2, '0')}:${m} ${ampm}` }))
                  }}
                  className={errors.openingTime ? styles.fieldError : ''}
                />
                {errors.openingTime && <span className={styles.errorText}>⚠ {errors.openingTime}</span>}
              </div>
            </div>

            {/* Row 4: Closing Time */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="closingTime">Closing Time <span className={styles.requiredStar}>*</span></label>
                <input
                  id="closingTime"
                  name="closingTime"
                  type="time"
                  value={form.closingTime.replace(/ (AM|PM)/, '')}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':')
                    const hour = parseInt(h, 10)
                    const ampm = hour >= 12 ? 'PM' : 'AM'
                    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                    setForm((prev) => ({ ...prev, closingTime: `${String(h12).padStart(2, '0')}:${m} ${ampm}` }))
                  }}
                  className={errors.closingTime ? styles.fieldError : ''}
                />
                {errors.closingTime && <span className={styles.errorText}>⚠ {errors.closingTime}</span>}
              </div>
              <div className={styles.field} />
            </div>

            {/* Shop Image */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Shop Image <span className={styles.requiredStar}>*</span></label>
                {imagePreview ? (
                  <div className={styles.imagePreviewContainer}>
                    <img src={imagePreview} alt="Shop preview" className={styles.imagePreview} />
                    <div className={styles.imagePreviewInfo}>
                      <span>{imageFile?.name}</span>
                      <span>({formatFileSize(imageFile?.size || 0)})</span>
                    </div>
                    <button type="button" className={styles.removeImageBtn} onClick={handleRemoveImage}>✕ Remove</button>
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
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
                  >
                    <span className={styles.imageUploadIcon}>📷</span>
                    <p className={styles.imageUploadText}>Drag & drop an image here</p>
                    <p className={styles.imageUploadHint}>or</p>
                    <button type="button" className={styles.chooseImageBtn}>Choose Image</button>
                    <p className={styles.imageUploadHint}>Supported formats: JPG, JPEG, PNG (Max size 5 MB)</p>
                    <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileInputChange} className={styles.imageUploadInput} />
                  </div>
                )}
                {errors.image && <span className={styles.errorText}>⚠ {errors.image}</span>}
              </div>
            </div>

            {/* Shop Address */}
            <div className={styles.field}>
              <label htmlFor="shopAddress">Shop Address <span className={styles.requiredStar}>*</span></label>
              <textarea
                id="shopAddress"
                name="shopAddress"
                placeholder="Enter your complete shop address..."
                rows={3}
                maxLength={300}
                value={form.shopAddress}
                onChange={handleChange}
                className={errors.shopAddress ? styles.fieldError : ''}
              />
              <span className={styles.charCount}>{form.shopAddress.length} / 300</span>
              {errors.shopAddress && <span className={styles.errorText}>⚠ {errors.shopAddress}</span>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className={styles.submitError}>{errors.submit}</div>
            )}

            {/* Actions */}
            <div className={styles.formActions}>
              {onCancel && (
                <button type="button" onClick={onCancel} disabled={isSubmitting} className={styles.cancelBtn}>
                  Cancel
                </button>
              )}
              <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                {isSubmitting ? 'Publishing...' : 'Submit Post'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Overlay */}
      {submitted && (
        <div className={styles.successOverlay} role="dialog" aria-modal="true">
          <div className={styles.successCard}>
            <span className={styles.successEmoji}>✅</span>
            <p className={styles.successMessage}>
              Once the activation is completed, you will be able to access your account and proceed with the next steps.
            </p>
            <p className={styles.successMessage} style={{ fontWeight: 600 }}>
              Thank you for your cooperation.
            </p>
            <button
              type="button"
              className={styles.successBtn}
              onClick={() => {
                setSubmitted(false)
                if (onSuccess) onSuccess()
                else navigate('/business/dashboard/posts')
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
