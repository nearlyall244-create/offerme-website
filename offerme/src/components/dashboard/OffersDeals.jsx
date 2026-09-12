import { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import styles from './OffersDeals.module.css'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function OffersDeals({ onSuccess, onCancel, initialData = null }) {
  const { getToken, userProfile } = useAuth()

  const [form, setForm] = useState({
    dealHeadline: initialData?.title || '',
    discountPercentage: initialData?.discount_percent ? String(initialData.discount_percent) : '',
    couponCode: initialData?.coupon_code || '',
    originalPrice: initialData?.original_price ? String(initialData.original_price) : '',
    offerPrice: initialData?.discount_value ? String(initialData.discount_value) : '',
    expiryDate: initialData?.valid_until ? String(initialData.valid_until).split('T')[0] : '',
    description: initialData?.description || '',
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || '')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef(null)

  // Calculate savings info
  const origNum = Number(form.originalPrice)
  const offerNum = Number(form.offerPrice)
  let discountInfo = null
  if (origNum > 0 && offerNum > 0 && offerNum <= origNum) {
    const saved = origNum - offerNum
    const pct = ((saved / origNum) * 100).toFixed(0)
    discountInfo = { saved: saved.toFixed(0), pct }
  }

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => {
      const updated = { ...prev, [name]: value }
      // If user inputs originalPrice and offerPrice, auto-suggest discount percentage if empty or matching
      if ((name === 'originalPrice' || name === 'offerPrice') && !prev.discountPercentage) {
        const o = Number(name === 'originalPrice' ? value : prev.originalPrice)
        const p = Number(name === 'offerPrice' ? value : prev.offerPrice)
        if (o > 0 && p > 0 && p <= o) {
          updated.discountPercentage = Math.round(((o - p) / o) * 100).toString()
        }
      }
      return updated
    })

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
        image: 'Please select a JPG, PNG, or WebP image.',
      }))
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        image: 'Image must be smaller than 5MB.',
      }))
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.image
      return next
    })
  }, [])

  const handleRemoveImage = useCallback(() => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const validate = () => {
    const errs = {}

    if (!form.dealHeadline.trim()) {
      errs.dealHeadline = 'Deal / Offer headline is required.'
    } else if (form.dealHeadline.trim().length < 5) {
      errs.dealHeadline = 'Headline must be at least 5 characters.'
    }

    const disc = Number(form.discountPercentage)
    if (!form.discountPercentage.trim()) {
      errs.discountPercentage = 'Discount percentage is required.'
    } else if (isNaN(disc) || disc < 1 || disc > 100) {
      errs.discountPercentage = 'Must be between 1% and 100%.'
    }

    if (!form.couponCode.trim()) {
      errs.couponCode = 'Custom coupon code is required.'
    } else if (!/^[A-Za-z0-9_-]+$/.test(form.couponCode.trim())) {
      errs.couponCode = 'Coupon code can only contain letters, numbers, and hyphens.'
    }

    const orig = Number(form.originalPrice)
    if (!form.originalPrice.trim()) {
      errs.originalPrice = 'Original price is required.'
    } else if (isNaN(orig) || orig <= 0) {
      errs.originalPrice = 'Original price must be greater than 0.'
    }

    const off = Number(form.offerPrice)
    if (!form.offerPrice.trim()) {
      errs.offerPrice = 'Offer / Deal price is required.'
    } else if (isNaN(off) || off <= 0) {
      errs.offerPrice = 'Offer price must be greater than 0.'
    } else if (orig > 0 && off > orig) {
      errs.offerPrice = 'Offer price cannot be greater than original price.'
    }

    if (!form.expiryDate) {
      errs.expiryDate = 'Deal expiry date is required.'
    } else {
      const expiry = new Date(form.expiryDate + 'T23:59:59')
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (expiry < today) {
        errs.expiryDate = 'Expiry date must be in the future.'
      }
    }

    if (!imagePreview && !imageFile) {
      errs.image = 'Offer banner / product image is required.'
    }

    if (!form.description.trim()) {
      errs.description = 'Offer description / terms are required.'
    } else if (form.description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters.'
    }

    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)

    if (Object.keys(errs).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('Authentication required. Please log in again.')
      }

      // Convert image preview or file if present
      let uploadedImageUrl = imagePreview || null

      const payload = {
        dealHeadline: form.dealHeadline.trim(),
        discountPercentage: Number(form.discountPercentage),
        couponCode: form.couponCode.trim(),
        originalPrice: Number(form.originalPrice),
        offerPrice: Number(form.offerPrice),
        expiryDate: form.expiryDate,
        description: form.description.trim(),
        imageUrl: uploadedImageUrl,
        shopName: userProfile?.shop_name || userProfile?.owner_name || 'My Business',
      }

      const res = await fetch('/api/offers?action=create-deal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save offer to offers_post.')
      }

      setSubmitSuccess(true)
      if (onSuccess) {
        onSuccess(data.offer)
      }
    } catch (err) {
      console.error('OffersDeals submit error:', err)
      setErrors((prev) => ({ ...prev, submit: err.message || 'Failed to publish deal.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {/* Visual match to screenshot: Green vertical line + "Offer / Deal Details" */}
        <h2 className={styles.sectionTitle}>Offer / Deal Details</h2>
      </div>

      {submitSuccess && (
        <div className={styles.globalSuccess}>
          <CheckCircle2 size={18} />
          <span>Deal published successfully to OfferMe!</span>
        </div>
      )}

      {errors.submit && (
        <div className={styles.globalError}>
          <AlertCircle size={18} />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Deal / Offer Headline * */}
        <div className={`${styles.field} ${errors.dealHeadline ? styles.fieldError : ''}`}>
          <label htmlFor="dealHeadline">
            Deal / Offer Headline <span className={styles.requiredStar}>*</span>
          </label>
          <input
            id="dealHeadline"
            name="dealHeadline"
            type="text"
            placeholder="e.g. Flat 30% Off on All Snacks This Weekend!"
            value={form.dealHeadline}
            onChange={handleChange}
          />
          {errors.dealHeadline && (
            <span className={styles.errorText}>
              <AlertCircle size={14} /> {errors.dealHeadline}
            </span>
          )}
        </div>

        {/* Two-column: Discount Percentage (%) * & Custom Coupon Code (optional) */}
        <div className={styles.fieldRow}>
          <div className={`${styles.field} ${errors.discountPercentage ? styles.fieldError : ''}`}>
            <label htmlFor="discountPercentage">
              Discount Percentage (%) <span className={styles.requiredStar}>*</span>
            </label>
            <input
              id="discountPercentage"
              name="discountPercentage"
              type="number"
              min="1"
              max="100"
              placeholder="e.g. 30"
              value={form.discountPercentage}
              onChange={handleChange}
            />
            {errors.discountPercentage && (
              <span className={styles.errorText}>
                <AlertCircle size={14} /> {errors.discountPercentage}
              </span>
            )}
          </div>

          <div className={`${styles.field} ${errors.couponCode ? styles.fieldError : ''}`}>
            <label htmlFor="couponCode">
              Custom Coupon Code <span className={styles.requiredStar}>*</span>
            </label>
            <input
              id="couponCode"
              name="couponCode"
              type="text"
              placeholder="e.g. SNACK30"
              value={form.couponCode}
              onChange={handleChange}
            />
            {errors.couponCode && (
              <span className={styles.errorText}>
                <AlertCircle size={14} /> {errors.couponCode}
              </span>
            )}
          </div>
        </div>

        {/* Two-column: Original Price (₹) * & Offer / Deal Price (₹) * */}
        <div className={styles.fieldRow}>
          <div className={`${styles.field} ${errors.originalPrice ? styles.fieldError : ''}`}>
            <label htmlFor="originalPrice">
              Original Price (₹) <span className={styles.requiredStar}>*</span>
            </label>
            <input
              id="originalPrice"
              name="originalPrice"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 500"
              value={form.originalPrice}
              onChange={handleChange}
            />
            {errors.originalPrice && (
              <span className={styles.errorText}>
                <AlertCircle size={14} /> {errors.originalPrice}
              </span>
            )}
          </div>

          <div className={`${styles.field} ${errors.offerPrice ? styles.fieldError : ''}`}>
            <label htmlFor="offerPrice">
              Offer / Deal Price (₹) <span className={styles.requiredStar}>*</span>
            </label>
            <input
              id="offerPrice"
              name="offerPrice"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 350"
              value={form.offerPrice}
              onChange={handleChange}
            />
            {errors.offerPrice && (
              <span className={styles.errorText}>
                <AlertCircle size={14} /> {errors.offerPrice}
              </span>
            )}
          </div>
        </div>

        {/* Calculated Savings info */}
        {discountInfo && (
          <div className={styles.savingsBanner}>
            <span className={styles.savingsIcon}>💰</span>
            <span>
              Your customers save ₹{discountInfo.saved} ({discountInfo.pct}% off) with this deal!
            </span>
          </div>
        )}

        {/* Deal Expiry Date * */}
        <div className={`${styles.field} ${errors.expiryDate ? styles.fieldError : ''}`}>
          <label htmlFor="expiryDate">
            Deal Expiry Date <span className={styles.requiredStar}>*</span>
          </label>
          <input
            id="expiryDate"
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.expiryDate && (
            <span className={styles.errorText}>
              <AlertCircle size={14} /> {errors.expiryDate}
            </span>
          )}
        </div>

        {/* Banner Image * */}
        <div className={`${styles.field} ${errors.image ? styles.fieldError : ''}`}>
          <label>
            Offer Banner / Product Image <span className={styles.requiredStar}>*</span>
          </label>
          {imagePreview ? (
            <div className={styles.previewContainer}>
              <img src={imagePreview} alt="Deal preview" className={styles.previewImg} />
              <button
                type="button"
                onClick={handleRemoveImage}
                className={styles.removeImgBtn}
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              className={`${styles.imageUploadArea} ${isDragOver ? styles.dragOver : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                handleImageSelect(e.dataTransfer.files?.[0])
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => handleImageSelect(e.target.files?.[0])}
              />
              <div className={styles.uploadPrompt}>
                <UploadCloud size={28} className={styles.uploadIcon} />
                <span>Click or drag image to upload banner (JPG, PNG, WebP &lt; 5MB)</span>
              </div>
            </div>
          )}
          {errors.image && (
            <span className={styles.errorText}>
              <AlertCircle size={14} /> {errors.image}
            </span>
          )}
        </div>

        {/* Description / Terms * */}
        <div className={`${styles.field} ${errors.description ? styles.fieldError : ''}`}>
          <label htmlFor="description">
            Offer Description / Terms <span className={styles.requiredStar}>*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="e.g. Valid on all dine-in orders. Cannot be combined with other offers."
            value={form.description}
            onChange={handleChange}
          />
          {errors.description && (
            <span className={styles.errorText}>
              <AlertCircle size={14} /> {errors.description}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          {onCancel && (
            <button type="button" onClick={onCancel} className={styles.cancelBtn}>
              Cancel
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Publishing to offers_post...
              </>
            ) : (
              'Publish Offer / Deal'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
