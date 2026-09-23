const NAME_MIN = 2
const NAME_MAX = 50
const EMAIL_MAX = 100
const PHONE_DIGITS = 10
const SHOP_NAME_MAX = 50

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizePhone(input) {
  let digits = String(input ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return digits
}

export function validateSignupProfile(body, { kind }) {
  const name = String(body.name ?? body.owner_name ?? '').trim()
  const shopName = String(body.shop_name ?? '').trim()
  const phoneRaw = body.phone_number ?? body.phone ?? ''
  const email = String(body.email ?? '').trim()
  const digits = normalizePhone(phoneRaw)

  if (!digits || digits.length !== PHONE_DIGITS) {
    return { error: 'Phone number must contain exactly 10 digits' }
  }

  if (email && email.length > EMAIL_MAX) {
    return { error: `Email must be ${EMAIL_MAX} characters or fewer` }
  }
  if (email && !EMAIL_RE.test(email)) {
    return { error: 'Invalid email address' }
  }

  if (kind === 'customer') {
    if (!name || name.length < NAME_MIN) {
      return { error: `Name must be at least ${NAME_MIN} characters` }
    }
    if (name.length > NAME_MAX) {
      return { error: `Name must be ${NAME_MAX} characters or fewer` }
    }
    return { name, phone_number: digits }
  }

  if (!shopName || shopName.length < NAME_MIN) {
    return { error: 'shop_name is required' }
  }
  if (shopName.length > SHOP_NAME_MAX) {
    return { error: `shop_name must be ${SHOP_NAME_MAX} characters or fewer` }
  }
  if (name && name.length > NAME_MAX) {
    return { error: `Name must be ${NAME_MAX} characters or fewer` }
  }

  return { name, shop_name: shopName, phone_number: digits }
}
