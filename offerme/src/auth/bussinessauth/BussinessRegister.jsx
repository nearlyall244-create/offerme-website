import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import styles from '../Auth.module.css'

const CATEGORIES = [
  'Grocery',
  'Clothing',
  'Electronics',
  'Restaurant',
  'Cafe',
  'Bakery',
  'Salon',
  'Beauty',
  'Pharmacy',
  'Furniture',
  'Jewellery',
  'Mobile & Accessories',
  'Home & Kitchen',
  'Sports',
  'Fitness',
  'Education',
  'Automotive',
  'Travel',
  'Services',
  'Other',
]

export default function BusinessRegister() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    // Section 1: Owner Details
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',

    // Section 2: Business Details
    businessName: '',
    businessCategory: '',
    businessDescription: '',
    businessPhoneNumber: '',
    businessEmail: '',

    // Section 3: Business Location
    businessAddress: '',
    area: '',
    city: '',
    state: '',
    pincode: '',

    // Section 4: Business Information
    openingTime: '',
    closingTime: '',
    businessLogo: null,
    businessImage: null,
  })

  const [logoPreview, setLogoPreview] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')

    // Password validation
    if (name === 'password') {
      if (value.length < 7) {
        setError('Password must be at least 7 characters.')
      } else if (!/[0-9]/.test(value)) {
        setError('Password must contain at least one number.')
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        setError('Password must contain at least one symbol.')
      }
    }

    // Confirm password validation
    if (name === 'confirmPassword') {
      if (value !== form.password) {
        setError('Passwords do not match.')
      }
    }
  }

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0]
    if (!file) return

    setForm((prev) => ({ ...prev, [field]: file }))

    const previewUrl = URL.createObjectURL(file)
    if (field === 'businessLogo') {
      setLogoPreview(previewUrl)
    } else if (field === 'businessImage') {
      setImagePreview(previewUrl)
    }
  }

  const handleRemoveFile = (field) => {
    setForm((prev) => ({ ...prev, [field]: null }))
    if (field === 'businessLogo') {
      setLogoPreview('')
    } else if (field === 'businessImage') {
      setImagePreview('')
    }
  }

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length === 10
  }

  const validatePincode = (pin) => {
    const cleaned = pin.replace(/\D/g, '')
    return cleaned.length === 6
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // 1. Owner Details Validation
    if (!form.fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!form.email.trim() || !validateEmail(form.email)) {
      setError('Please enter a valid owner email address.')
      return
    }
    if (!form.phoneNumber.trim() || !validatePhone(form.phoneNumber)) {
      setError('Please enter a valid 10-digit owner phone number.')
      return
    }
    if (!form.password) {
      setError('Please enter a password.')
      return
    }
    if (form.password.length < 7) {
      setError('Password must be at least 7 characters long.')
      return
    }
    if (!/[0-9]/.test(form.password)) {
      setError('Password must contain at least one number.')
      return
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      setError('Password must contain at least one special symbol.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // 2. Business Details Validation
    if (!form.businessName.trim()) {
      setError('Please enter your business name.')
      return
    }
    if (!form.businessCategory) {
      setError('Please select a business category.')
      return
    }
    if (!form.businessDescription.trim()) {
      setError('Please enter a business description.')
      return
    }
    if (!form.businessPhoneNumber.trim() || !validatePhone(form.businessPhoneNumber)) {
      setError('Please enter a valid 10-digit business phone number.')
      return
    }
    if (form.businessEmail.trim() && !validateEmail(form.businessEmail)) {
      setError('Please enter a valid business email address or leave it blank.')
      return
    }

    // 3. Location Validation
    if (!form.businessAddress.trim()) {
      setError('Please enter the business address.')
      return
    }
    if (!form.area.trim()) {
      setError('Please enter area or locality.')
      return
    }
    if (!form.city.trim()) {
      setError('Please enter city.')
      return
    }
    if (!form.state.trim()) {
      setError('Please enter state.')
      return
    }
    if (!form.pincode.trim() || !validatePincode(form.pincode)) {
      setError('Please enter a valid 6-digit pincode.')
      return
    }

    // 4. Business Information (Hours) Validation
    if (!form.openingTime) {
      setError('Please select business opening time.')
      return
    }
    if (!form.closingTime) {
      setError('Please select business closing time.')
      return
    }
    if (form.closingTime <= form.openingTime) {
      setError('Closing time must be later than opening time.')
      return
    }

    // All validation passed — register the business owner
    setIsSubmitting(true)

    try {
      const displayName = form.fullName.trim()
      await signUp(form.email.trim(), form.password, displayName, 'business')
      navigate('/auth/verify-email', { state: { email: form.email.trim() } })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.card} ${styles.wideCard}`}>
        <div className={styles.headerArea}>
          <h1 className={styles.title}>Create Business Account</h1>
          <p className={styles.subtitle}>List your business and reach more local customers on OfferMe</p>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className={styles.success} role="status">
            <span className={styles.successIcon}>✓</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* SECTION 1 — OWNER DETAILS */}
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Owner Details</h2>

            {/* Full Name */}
            <div className={styles.field}>
              <label htmlFor="fullName">
                Full Name <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>

            {/* Email & Phone */}
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
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
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
                  placeholder="Enter phone number"
                  maxLength={10}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className={styles.fieldRow}>
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
                    placeholder="Enter password"
                    autoComplete="new-password"
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
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.eyeToggle}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 — BUSINESS DETAILS */}
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Business Details</h2>

            {/* Business Name & Category */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="businessName">
                  Business Name <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="Enter business name"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="businessCategory">
                  Business Category <span className={styles.requiredStar}>*</span>
                </label>
                <select
                  id="businessCategory"
                  name="businessCategory"
                  className={styles.select}
                  required
                  value={form.businessCategory}
                  onChange={handleChange}
                >
                  <option value="">Select business category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Business Description */}
            <div className={styles.field}>
              <label htmlFor="businessDescription">
                Business Description <span className={styles.requiredStar}>*</span>
              </label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                className={styles.textarea}
                required
                rows={3}
                value={form.businessDescription}
                onChange={handleChange}
                placeholder="Tell customers about your business"
              />
            </div>

            {/* Business Phone & Business Email */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="businessPhoneNumber">
                  Business Phone Number <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="businessPhoneNumber"
                  name="businessPhoneNumber"
                  type="tel"
                  required
                  value={form.businessPhoneNumber}
                  onChange={handleChange}
                  placeholder="Enter business phone number"
                  maxLength={10}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="businessEmail">
                  Business Email <span className={styles.optionalTag}>[optional]</span>
                </label>
                <input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  value={form.businessEmail}
                  onChange={handleChange}
                  placeholder="Enter business email"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3 — BUSINESS LOCATION */}
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Business Location</h2>

            {/* Business Address */}
            <div className={styles.field}>
              <label htmlFor="businessAddress">
                Business Address <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="businessAddress"
                name="businessAddress"
                type="text"
                required
                value={form.businessAddress}
                onChange={handleChange}
                placeholder="Enter business address (e.g. 12, North Usman Road)"
              />
            </div>

            {/* Area & City */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="area">
                  Area / Locality <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="area"
                  name="area"
                  type="text"
                  required
                  value={form.area}
                  onChange={handleChange}
                  placeholder="Enter area or locality"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="city">
                  City <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </div>
            </div>

            {/* State & Pincode */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="state">
                  State <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  required
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="pincode">
                  Pincode <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  required
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4 — BUSINESS INFORMATION */}
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Business Information</h2>

            {/* Opening Time & Closing Time */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="openingTime">
                  Opening Time <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="openingTime"
                  name="openingTime"
                  type="time"
                  required
                  value={form.openingTime}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="closingTime">
                  Closing Time <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="closingTime"
                  name="closingTime"
                  type="time"
                  required
                  value={form.closingTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Business Logo Upload */}
            <div className={styles.field}>
              <label htmlFor="businessLogo">
                Business Logo <span className={styles.optionalTag}>[optional]</span>
              </label>
              <div className={styles.fileUploadBox}>
                <input
                  id="businessLogo"
                  name="businessLogo"
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={(e) => handleFileChange(e, 'businessLogo')}
                />
                {logoPreview && (
                  <div className={styles.imagePreview}>
                    <img src={logoPreview} alt="Logo preview" className={styles.previewThumb} />
                    <div className={styles.previewInfo}>
                      <span className={styles.previewName}>{form.businessLogo?.name || 'Selected Logo'}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => handleRemoveFile('businessLogo')}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Business Image Upload */}
            <div className={styles.field}>
              <label htmlFor="businessImage">
                Business Image <span className={styles.optionalTag}>[optional]</span>
              </label>
              <div className={styles.fileUploadBox}>
                <input
                  id="businessImage"
                  name="businessImage"
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={(e) => handleFileChange(e, 'businessImage')}
                />
                {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Business preview" className={styles.previewThumb} />
                    <div className={styles.previewInfo}>
                      <span className={styles.previewName}>{form.businessImage?.name || 'Selected Image'}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => handleRemoveFile('businessImage')}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Business Account'}
          </button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have a business account?{' '}
            <Link to="/auth/business/login" className={styles.link}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
