export const NAME_MIN = 2
export const NAME_MAX = 50
export const EMAIL_MAX = 100
export const PHONE_DIGITS = 10
export const PASSWORD_MIN = 7

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SYMBOL_RE = /[!@#$%^&*(),.?":{}|<>]/

export function normalizePhone(input) {
  let digits = String(input ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return digits
}

export function validateName(value) {
  const name = String(value ?? '').trim()
  if (!name) return 'Please enter your full name.'
  if (name.length < NAME_MIN) return `Name must be at least ${NAME_MIN} characters.`
  if (name.length > NAME_MAX) return `Name must be ${NAME_MAX} characters or fewer.`
  if (!/[^\s]/.test(name)) return 'Please enter your full name.'
  return ''
}

export function validateEmail(value) {
  const email = String(value ?? '').trim()
  if (!email) return 'Please enter a valid email address.'
  if (email.length > EMAIL_MAX) return `Email must be ${EMAIL_MAX} characters or fewer.`
  if (!EMAIL_RE.test(email)) return 'Please enter a valid email address.'
  return ''
}

export function validatePhone(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return 'Please enter a valid 10-digit phone number.'
  const digits = normalizePhone(raw)
  if (digits.length !== PHONE_DIGITS) return 'Please enter a valid 10-digit phone number.'
  return ''
}

export function validatePassword(value) {
  const password = String(value ?? '')
  if (!password) return 'Please enter a password.'
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters long.`
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.'
  if (!SYMBOL_RE.test(password)) return 'Password must contain at least one special symbol.'
  return ''
}

export function validateConfirmPassword(confirm, password) {
  if (!confirm) return 'Please confirm your password.'
  if (confirm !== password) return 'Passwords do not match.'
  return ''
}

export function passwordStrength(password) {
  const value = String(password ?? '')
  if (!value) return { score: 0, label: '' }
  let score = 0
  if (value.length >= PASSWORD_MIN) score += 1
  if (value.length >= 12) score += 1
  if (/[0-9]/.test(value)) score += 1
  if (SYMBOL_RE.test(value)) score += 1
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
  if (score <= 1) return { score: 1, label: 'Weak' }
  if (score <= 3) return { score: 2, label: 'Fair' }
  return { score: 3, label: 'Strong' }
}

export function isRegisterFormValid({ fullName, email, password, confirmPassword, phoneNumber }) {
  return (
    !validateName(fullName) &&
    !validateEmail(email) &&
    !validatePhone(phoneNumber) &&
    !validatePassword(password) &&
    !validateConfirmPassword(confirmPassword, password)
  )
}

export function mapFirebaseAuthError(err) {
  const code = err?.code || ''
  const messages = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Use at least 7 characters with a number and symbol.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/wrong-password': 'Invalid email or password.',
    'auth/user-not-found': 'Invalid email or password.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  }
  if (messages[code]) return messages[code]
  return err?.message || 'Something went wrong. Please try again.'
}
