import { useState } from 'react'
import styles from './PostForm.module.css'

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Health & Fitness',
  'Beauty & Spa',
  'Electronics',
  'Travel & Hotels',
  'Education',
  'Automotive',
  'Other',
]

export default function PostForm({ onSubmit, initialData = null }) {
  const [form, setForm] = useState(
    initialData || {
      shopName: '',
      category: '',
      description: '',
      offers: '',
      phone: '',
      email: '',
      address: '',
      latitude: '',
      longitude: '',
      imagePreview: '',
    }
  )
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setForm((prev) => ({ ...prev, imagePreview: ev.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) return
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString(),
        }))
        setLocationLoading(false)
      },
      () => {
        setLocationLoading(false)
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({ ...form, imageFile })
    } finally {
      setSubmitting(false)
    }
  }

  const isValid = form.shopName && form.category && form.description && form.offers && form.phone && form.email && form.address

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="shopName">Shop Name *</label>
          <input
            id="shopName"
            name="shopName"
            required
            value={form.shopName}
            onChange={handleChange}
            placeholder="My Awesome Shop"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            required
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Tell customers about your business..."
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="offers">Offers / Deals *</label>
        <textarea
          id="offers"
          name="offers"
          required
          rows={2}
          value={form.offers}
          onChange={handleChange}
          placeholder="20% off all items, Buy 1 Get 1 Free..."
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="phone">Phone Number *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={form.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="shop@business.com"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="address">Address *</label>
        <input
          id="address"
          name="address"
          required
          value={form.address}
          onChange={handleChange}
          placeholder="123 Main St, City, State"
        />
      </div>

      <div className={styles.locationRow}>
        <button type="button" onClick={handleGetLocation} className={styles.locationBtn} disabled={locationLoading}>
          {locationLoading ? 'Getting location...' : '📍 Get Current Location'}
        </button>
        {form.latitude && form.longitude && (
          <span className={styles.locationCoords}>
            {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="image">Business Image *</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {form.imagePreview && (
          <img src={form.imagePreview} alt="Preview" className={styles.preview} />
        )}
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={!isValid || submitting}
      >
        {submitting ? 'Submitting...' : initialData ? 'Update Post' : 'Submit Post'}
      </button>
    </form>
  )
}
