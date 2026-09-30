import { useState } from 'react'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/pages/footer/Footer'
import { validateName, validateEmail, validatePhone } from '@/utils/validation'

const MESSAGE_MAX = 5000

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fieldStyle = {
    padding: '0.625rem 0.75rem',
    fontSize: '0.9375rem',
    border: '1px solid var(--color-border)',
    borderRadius: '0.5rem',
    outline: 'none',
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFormError('')
    setErrors((prev) => {
      if (!prev[name] && !e.target.dataset.touched) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const validateField = (name, value) => {
    if (name === 'name') return validateName(value)
    if (name === 'email') return value.trim() ? validateEmail(value) : ''
    if (name === 'phone') return validatePhone(value)
    if (name === 'message') {
      const v = String(value).trim()
      if (!v) return 'Please enter your message.'
      if (v.length > MESSAGE_MAX) return `Message must be ${MESSAGE_MAX} characters or fewer.`
      return ''
    }
    return ''
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccess(false)

    const nextErrors = {}
    for (const key of Object.keys(form)) {
      nextErrors[key] = validateField(key, form[key])
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) {
      setFormError('Please fix the highlighted fields.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone_number: form.phone.trim(),
          message: form.message.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.field) setErrors((prev) => ({ ...prev, [data.field]: data.error }))
        throw new Error(data.error || 'Failed to send message. Please try again.')
      }
      setForm({ name: '', email: '', phone: '', message: '' })
      setErrors({})
      setSuccess(true)
    } catch (err) {
      setFormError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const errorStyle = { fontSize: '0.75rem', color: '#dc2626' }

  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Contact Us</h1>
        <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Have questions or feedback? We would love to hear from you.
        </p>

        {success && (
          <div
            role="status"
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#166534',
              background: '#dcfce7',
              border: '1px solid #bbf7d0',
            }}
          >
            Thanks! Your message has been sent successfully.
          </div>
        )}

        {formError && (
          <div
            role="alert"
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#991b1b',
              background: '#fee2e2',
              border: '1px solid #fecaca',
            }}
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="contact-name" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Name</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              maxLength={50}
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={errors.name ? 'true' : 'false'}
              style={fieldStyle}
            />
            {errors.name && <span style={errorStyle}>{errors.name}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="contact-email" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Email (optional)</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              maxLength={100}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={errors.email ? 'true' : 'false'}
              style={fieldStyle}
            />
            {errors.email && <span style={errorStyle}>{errors.email}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="contact-phone" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Phone Number</label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              maxLength={15}
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={errors.phone ? 'true' : 'false'}
              style={fieldStyle}
            />
            {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="contact-message" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              maxLength={5000}
              placeholder="Your message..."
              value={form.message}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={errors.message ? 'true' : 'false'}
              style={{ ...fieldStyle, fontFamily: 'inherit', resize: 'vertical' }}
            />
            {errors.message && <span style={errorStyle}>{errors.message}</span>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.75rem',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'white',
              background: 'var(--color-primary)',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  )
}
