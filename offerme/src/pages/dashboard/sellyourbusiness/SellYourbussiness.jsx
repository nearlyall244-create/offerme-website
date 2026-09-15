import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import styles from './SellYourbussiness.module.css'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

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

function SearchableSelect({ label, required, options, value, onChange, placeholder, error, disabled }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const selected = options.find((o) => o.id === value)
  const displayValue = selected ? selected.name : ''

  const filtered = useMemo(() => {
    if (!query) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.name.toLowerCase().includes(q))
  }, [query, options])

  useEffect(() => {
    if (open && selected) {
      setQuery('')
    } else if (!open) {
      setQuery('')
    }
  }, [open, selected])

  const handleSelect = (opt) => {
    onChange(opt.id)
    setOpen(false)
    setQuery('')
    setHighlightIdx(-1)
  }

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault()
      setOpen(true)
      return
    }
    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault()
      handleSelect(filtered[highlightIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setQuery('')
  }

  return (
    <div className={`${styles.field} ${styles.searchableSelect} ${disabled ? styles.disabled : ''}`}>
      <label>
        {label} {required && <span className={styles.requiredStar}>*</span>}
      </label>
      <div
        className={`${styles.selectTrigger} ${error ? styles.fieldError : ''} ${open ? styles.selectOpen : ''}`}
        onClick={() => { if (!disabled) setOpen(!open) }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        ref={inputRef}
      >
        {open ? (
          <input
            className={styles.selectSearch}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setHighlightIdx(-1) }}
            placeholder={placeholder}
            autoFocus
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span className={selected ? styles.selectValue : styles.selectPlaceholder}>
            {displayValue || placeholder}
          </span>
        )}
        <div className={styles.selectIcons}>
          {selected && !disabled && (
            <span className={styles.selectClear} onClick={handleClear} role="button">✕</span>
          )}
          <span className={styles.selectArrow}>▾</span>
        </div>
      </div>
      {open && (
        <div className={styles.selectDropdown} ref={listRef}>
          {filtered.length === 0 ? (
            <div className={styles.selectNoResults}>No results found</div>
          ) : (
            filtered.map((opt, idx) => (
              <div
                key={opt.id}
                className={`${styles.selectOption} ${idx === highlightIdx ? styles.selectOptionHighlighted : ''} ${opt.id === value ? styles.selectOptionSelected : ''}`}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setHighlightIdx(idx)}
              >
                {opt.icon && <span className={styles.selectOptionIcon}>{opt.icon}</span>}
                {opt.name}
              </div>
            ))
          )}
        </div>
      )}
      {error && <span className={styles.errorText}>⚠ {error}</span>}
    </div>
  )
}

export default function SellYourbussiness({ onSuccess, onCancel }) {
  const { userProfile, isBusiness, getToken } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    shopName: userProfile?.owner_name || '',
    shopEmail: userProfile?.email || '',
    enquiryNumber: userProfile?.phone_number || '',
    mainCategory: '',
    subcategory: '',
    openingTime: '',
    closingTime: '',
    shopAddress: '',
    shopDescription: '',
  })
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const fileInputRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (!cancelled && res.ok) setCategories(data.categories || [])
      } catch { /* silent */ }
      finally { if (!cancelled) setCategoriesLoading(false) }
    }
    loadCategories()
    return () => { cancelled = true }
  }, [])

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.mainCategory) || null,
    [form.mainCategory, categories]
  )

  const subcategories = useMemo(() => {
    return selectedCategory?.sub_categories || []
  }, [selectedCategory])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => { if (prev[name]) { const n = { ...prev }; delete n[name]; return n } return prev })
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
    setErrors((prev) => { if (prev.image) { const n = { ...prev }; delete n.image; return n } return prev })
  }, [])

  const handleRemoveImage = useCallback(() => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const validate = () => {
    const errs = {}
    if (!form.shopName.trim()) errs.shopName = 'Shop name is required.'
    else if (form.shopName.trim().length < 3) errs.shopName = 'Must be at least 3 characters.'
    if (!form.shopEmail.trim()) errs.shopEmail = 'Shop email is required.'
    else if (!validateEmail(form.shopEmail)) errs.shopEmail = 'Enter a valid email.'
    if (!form.enquiryNumber.trim()) errs.enquiryNumber = 'Enquiry number is required.'
    else if (!validatePhone(form.enquiryNumber)) errs.enquiryNumber = 'Enter a valid 10-digit Indian number.'
    if (!form.mainCategory) errs.mainCategory = 'Select a main category.'
    if (!form.subcategory) errs.subcategory = 'Select a subcategory.'
    if (!form.openingTime) errs.openingTime = 'Required.'
    if (!form.closingTime) errs.closingTime = 'Required.'
    if (!imageFile && !imagePreview) errs.image = 'Shop image is required.'
    if (!form.shopAddress.trim()) errs.shopAddress = 'Shop address is required.'
    else if (form.shopAddress.trim().length < 10) errs.shopAddress = 'Enter at least 10 characters.'
    else if (form.shopAddress.trim().length > 200) errs.shopAddress = 'Maximum 200 characters allowed.'
    if (!form.shopDescription.trim()) errs.shopDescription = 'Shop description is required.'
    else if (form.shopDescription.trim().length < 10) errs.shopDescription = 'Enter at least 10 characters.'
    else if (form.shopDescription.trim().length > 500) errs.shopDescription = 'Maximum 500 characters allowed.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isBusiness) return
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0]
      const el = document.querySelector(`[name="${firstKey}"]`) || document.querySelector(`.${styles.imageUploadArea}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      const token = await getToken()

      let uploadedImageUrl = null
      if (imageFile) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(imageFile)
        })

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            file: base64,
            fileName: imageFile.name,
            fileType: imageFile.type,
          }),
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Image upload failed')
        uploadedImageUrl = uploadData.url
      }

      const payload = {
        shopName: form.shopName.trim(),
        businessEmail: form.shopEmail.trim(),
        businessCategory: form.mainCategory,
        businessSubcategory: form.subcategory,
        phoneNumber: form.enquiryNumber.trim(),
        shopAddress: form.shopAddress.trim(),
        description: form.shopDescription.trim(),
        imageUrl: uploadedImageUrl,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
      }

      const res = await fetch('/api/offers?action=sell-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed.')
      setSubmitted(true)
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message }))
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
            <h1 className={styles.pageTitle}>Post Shop Details</h1>
            <p className={styles.pageSubtitle}>Fill in your shop information to list your business on OfferMe.</p>
          </div>
          <div className={styles.promoWrapper}>
            <div className={styles.promoCard}>
              <div className={styles.promoIconWrapper}><span role="img">🚀</span></div>
              <h2 className={styles.promoTitle}>Become a Business Owner</h2>
              <p className={styles.promoDescription}>Upgrade to a Business Owner account to publish your business.</p>
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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Post Shop Details</h1>
          <p className={styles.pageSubtitle}>Fill in your shop information to list your business on OfferMe.</p>
        </div>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit} noValidate className={styles.form}>

            {/* Row 1: Shop Name + Shop Email */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Shop Name <span className={styles.requiredStar}>*</span></label>
                <div className={styles.inputWithIcon}>
                  <span className={styles.inputIcon}>🏪</span>
                  <input name="shopName" type="text" placeholder="Enter your shop name" value={form.shopName} onChange={handleChange} className={errors.shopName ? styles.fieldError : ''} />
                </div>
                {errors.shopName && <span className={styles.errorText}>{errors.shopName}</span>}
              </div>
              <div className={styles.field}>
                <label>Shop Email <span className={styles.requiredStar}>*</span></label>
                <div className={styles.inputWithIcon}>
                  <span className={styles.inputIcon}>✉️</span>
                  <input name="shopEmail" type="email" placeholder="Enter shop email address" value={form.shopEmail} onChange={handleChange} className={errors.shopEmail ? styles.fieldError : ''} />
                </div>
                {errors.shopEmail && <span className={styles.errorText}>{errors.shopEmail}</span>}
              </div>
            </div>

            {/* Row 2: Enquiry Number + Main Category */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Enquiry Number <span className={styles.requiredStar}>*</span></label>
                <div className={styles.inputWithIcon}>
                  <span className={styles.inputIcon}>📞</span>
                  <input name="enquiryNumber" type="tel" placeholder="Enter enquiry contact number" maxLength={10} value={form.enquiryNumber} onChange={handleChange} className={`${errors.enquiryNumber ? styles.fieldError : ''} ${styles.inputLarge}`} />
                </div>
                {errors.enquiryNumber && <span className={styles.errorText}>{errors.enquiryNumber}</span>}
              </div>
              <SearchableSelect
                label="Main Category"
                required
                options={categories}
                value={form.mainCategory}
                onChange={(val) => {
                  setForm((prev) => ({ ...prev, mainCategory: val, subcategory: '' }))
                  setErrors((prev) => { const n = { ...prev }; delete n.mainCategory; delete n.subcategory; return n })
                }}
                placeholder={categoriesLoading ? 'Loading...' : 'Select or type a main category'}
                error={errors.mainCategory}
              />
            </div>

            {/* Row 3: Subcategory + Opening Time + Closing Time */}
            <div className={styles.fieldRow3}>
              <SearchableSelect
                label="Subcategory"
                required
                options={subcategories}
                value={form.subcategory}
                onChange={(val) => {
                  setForm((prev) => ({ ...prev, subcategory: val }))
                  setErrors((prev) => { const n = { ...prev }; delete n.subcategory; return n })
                }}
                placeholder={form.mainCategory ? 'Select or type a subcategory' : 'Select main category first'}
                error={errors.subcategory}
                disabled={!form.mainCategory}
              />
              <div className={styles.field}>
                <label>Opening Time <span className={styles.requiredStar}>*</span></label>
                <div className={styles.inputWithIcon}>
                  <span className={styles.inputIcon}>🕐</span>
                  <input name="openingTime" type="time" value={form.openingTime} onChange={handleChange} className={errors.openingTime ? styles.fieldError : ''} />
                </div>
                {errors.openingTime && <span className={styles.errorText}>{errors.openingTime}</span>}
              </div>
              <div className={styles.field}>
                <label>Closing Time <span className={styles.requiredStar}>*</span></label>
                <div className={styles.inputWithIcon}>
                  <span className={styles.inputIcon}>🕐</span>
                  <input name="closingTime" type="time" value={form.closingTime} onChange={handleChange} className={errors.closingTime ? styles.fieldError : ''} />
                </div>
                {errors.closingTime && <span className={styles.errorText}>{errors.closingTime}</span>}
              </div>
            </div>

            {/* Shop Image */}
            <div className={styles.imageSection}>
              <label>Shop Image <span className={styles.requiredStar}>*</span></label>
              <div className={styles.imageLayout}>
                <div
                  className={`${styles.imageUploadArea} ${isDragOver ? styles.dragOver : ''} ${errors.image ? styles.hasError : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false) }}
                  onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleImageSelect(e.dataTransfer.files?.[0]) }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click() }}
                >
                  <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => handleImageSelect(e.target.files?.[0])} style={{ display: 'none' }} />
                  {!imagePreview && (
                    <>
                      <span className={styles.imageUploadIcon}>📷</span>
                      <p className={styles.imageUploadText}><strong>Drag & drop an image here</strong></p>
                      <p className={styles.imageUploadHint}>or</p>
                      <button type="button" className={styles.chooseImageBtn}>Choose Image</button>
                      <p className={styles.imageUploadHint}>Supported formats: JPG, JPEG, PNG (Max size 5 MB)</p>
                    </>
                  )}
                  {imagePreview && (
                    <>
                      <img src={imagePreview} alt="Preview" className={styles.imagePreviewInline} />
                      <div className={styles.imagePreviewActions}>
                        <button type="button" className={styles.chooseImageBtn} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>Replace Image</button>
                        <button type="button" className={styles.removeImageBtn} onClick={(e) => { e.stopPropagation(); handleRemoveImage() }}>Remove</button>
                      </div>
                    </>
                  )}
                </div>
                <div className={styles.imagePreviewPanel}>
                  <p className={styles.previewLabel}>Image Preview</p>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Shop preview" className={styles.previewImage} />
                  ) : (
                    <div className={styles.previewPlaceholder}>
                      <span>Your shop image will appear here</span>
                    </div>
                  )}
                </div>
              </div>
              {errors.image && <span className={styles.errorText}>{errors.image}</span>}
            </div>

            {/* Shop Address */}
            <div className={styles.field}>
              <label>Shop Address <span className={styles.requiredStar}>*</span></label>
              <div className={styles.inputWithIcon}>
                <span className={styles.inputIcon}>📍</span>
                <textarea
                  name="shopAddress"
                  placeholder="Enter your complete shop address..."
                  rows={3}
                  maxLength={200}
                  value={form.shopAddress}
                  onChange={handleChange}
                  className={`${errors.shopAddress ? styles.fieldError : ''} ${styles.addressTextarea} ${styles.inputLarge}`}
                />
              </div>
              <div className={styles.textareaFooter}>
                <span className={styles.textareaHint}>Add detailed address with landmarks, area, city etc. (Minimum 10 characters)</span>
                <span className={styles.charCount}>{form.shopAddress.length} / 200 words</span>
              </div>
              {errors.shopAddress && <span className={styles.errorText}>{errors.shopAddress}</span>}
            </div>

            {/* Shop Description */}
            <div className={styles.field}>
              <label>Shop Description <span className={styles.requiredStar}>*</span></label>
              <div className={styles.inputWithIcon}>
                <span className={styles.inputIcon}>📝</span>
                <textarea
                  name="shopDescription"
                  placeholder="Describe the business, services offered, specialties..."
                  rows={4}
                  maxLength={500}
                  value={form.shopDescription}
                  onChange={handleChange}
                  className={`${errors.shopDescription ? styles.fieldError : ''} ${styles.inputLarge}`}
                />
              </div>
              <div className={styles.textareaFooter}>
                <span className={styles.textareaHint}>Tell customers about the business (Min 10, Max 500 characters)</span>
                <span className={styles.charCount}>{form.shopDescription.length} / 500 words</span>
              </div>
              {errors.shopDescription && <span className={styles.errorText}>{errors.shopDescription}</span>}
            </div>

            {/* Submit Error */}
            {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

            {/* Actions */}
            <div className={styles.formActions}>
              {onCancel && (
                <button type="button" onClick={onCancel} disabled={isSubmitting} className={styles.cancelBtn}>Cancel</button>
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
            <p className={styles.successMessage}>Once the activation is completed, you will be able to access your account and proceed with the next steps.</p>
            <p className={styles.successMessage} style={{ fontWeight: 600 }}>Thank you for your cooperation.</p>
            <button type="button" className={styles.successBtn} onClick={() => { setSubmitted(false); onSuccess ? onSuccess() : navigate('/business/dashboard/posts') }}>Okay</button>
          </div>
        </div>
      )}
    </div>
  )
}
