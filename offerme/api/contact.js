import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[6-9]\d{9}$/

const NAME_MAX = 100
const EMAIL_MAX = 254
const MESSAGE_MAX = 5000

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body || {}
    const name = String(body.name ?? '').trim()
    const email = String(body.email ?? '').trim()
    const phone = String(body.phone_number ?? body.phone ?? '').trim()
    const message = String(body.message ?? '').trim()

    if (!name) {
      return res.status(400).json({ error: 'Name is required', field: 'name' })
    }
    if (name.length > NAME_MAX) {
      return res.status(400).json({ error: `Name must be ${NAME_MAX} characters or fewer`, field: 'name' })
    }

    if (email && (!EMAIL_RE.test(email) || email.length > EMAIL_MAX)) {
      return res.status(400).json({ error: 'Please enter a valid email address', field: 'email' })
    }

    const digits = phone.replace(/\D/g, '')
    if (!PHONE_RE.test(digits)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit phone number', field: 'phone_number' })
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required', field: 'message' })
    }
    if (message.length > MESSAGE_MAX) {
      return res.status(400).json({ error: `Message must be ${MESSAGE_MAX} characters or fewer`, field: 'message' })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('enquiry').insert({
      name,
      email: email || null,
      phone_number: digits,
      message,
    })

    if (error) {
      console.error('[contact] insert error:', error)
      return res.status(500).json({ error: 'Failed to send message. Please try again.' })
    }

    return res.status(201).json({ success: true, message: 'Message sent successfully' })
  } catch (err) {
    console.error('[contact] error:', err)
    return res.status(500).json({ error: err.message || 'Failed to send message' })
  }
}
