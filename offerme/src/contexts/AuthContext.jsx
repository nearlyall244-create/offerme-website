import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '@/services/authService'
import { mapFirebaseAuthError, validatePhone, validateName } from '@/utils/validation'

const AuthContext = createContext(null)

const PENDING_SIGNUP_KEY = 'offerme_pending_signup'

function savePendingSignup(pending) {
  try {
    sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(pending))
  } catch {
    /* ignore */
  }
}

function readPendingSignup() {
  try {
    const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearPendingSignup() {
  try {
    sessionStorage.removeItem(PENDING_SIGNUP_KEY)
  } catch {
    /* ignore */
  }
}

async function fetchProfile(token) {
  const res = await fetch('/api/auth?action=get-profile', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  if (!data.profile) return null

  const roleMap = { customer: 'user', vendor: 'business' }
  const normalizedRole = roleMap[data.role] || data.role

  const displayName =
    data.profile.owner_name ||
    data.profile.name ||
    data.profile.shop_name ||
    data.profile.businessName ||
    data.profile.displayName ||
    ''

  return { ...data.profile, displayName, role: normalizedRole }
}

async function postJson(url, body, token) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create account profile')
  }
  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const token = await authService.getToken()
          if (token) {
            const profile = await fetchProfile(token)
            setUserProfile(profile)
          }
        } catch {
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signUp = async (email, password, displayName, role = 'user', phone_number = '') => {
    try {
      const firebaseUser = await authService.signUp(email, password, displayName)
      savePendingSignup({
        role,
        name: displayName,
        phone_number,
        email: firebaseUser.email || email,
      })
      return firebaseUser
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err))
    }
  }

  const completePendingSignup = async () => {
    const pending = readPendingSignup()
    if (!pending) return null

    const refreshed = await authService.reloadUser()
    if (!refreshed.emailVerified) {
      throw new Error('Email not verified yet. Open the verification link and try again.')
    }

    const token = await authService.getToken(true)
    const isVendor = pending.role === 'business' || pending.role === 'vendor'
    const phoneError = validatePhone(pending.phone_number)
    if (phoneError) throw new Error(phoneError)
    const nameError = validateName(pending.name)
    if (nameError) throw new Error(nameError)

    if (isVendor) {
      const data = await postJson(
        '/api/auth?action=signup-vendor',
        {
          shop_name: pending.name || 'My Shop',
          name: pending.name,
          phone_number: pending.phone_number,
          email: pending.email,
        },
        token
      )
      setUserProfile(
        data.shop
          ? { ...data.shop, role: 'business' }
          : { firebase_uid: refreshed.uid, email: pending.email, displayName: pending.name, role: 'business' }
      )
      clearPendingSignup()
      await fetchProfile(token).then((p) => p && setUserProfile(p))
      return 'business'
    }

    const data = await postJson(
      '/api/auth?action=signup-customer',
      { name: pending.name, phone_number: pending.phone_number },
      token
    )
    setUserProfile(
      data.customer
        ? { ...data.customer, role: 'user' }
        : { firebase_uid: refreshed.uid, email: pending.email, displayName: pending.name, role: 'user' }
    )
    clearPendingSignup()
    await fetchProfile(token).then((p) => p && setUserProfile(p))
    return 'user'
  }

  const completeGoogleSignup = async (role = 'user', { name = '', phone_number = '' } = {}) => {
    const phoneError = validatePhone(phone_number)
    if (phoneError) throw new Error(phoneError)
    const nameError = validateName(name)
    if (nameError) throw new Error(nameError)

    const token = await authService.getToken()
    const isVendor = role === 'business' || role === 'vendor'

    if (isVendor) {
      const data = await postJson(
        '/api/auth?action=signup-vendor',
        {
          shop_name: name || 'My Shop',
          name,
          phone_number,
          email: user?.email,
        },
        token
      )
      setUserProfile(
        data.shop
          ? { ...data.shop, role: 'business' }
          : { firebase_uid: user?.uid, email: user?.email, displayName: name, role: 'business' }
      )
      const profile = await fetchProfile(token)
      if (profile) setUserProfile(profile)
      return 'business'
    }

    const data = await postJson(
      '/api/auth?action=signup-customer',
      { name, phone_number },
      token
    )
    setUserProfile(
      data.customer
        ? { ...data.customer, role: 'user' }
        : { firebase_uid: user?.uid, email: user?.email, displayName: name, role: 'user' }
    )
    const profile = await fetchProfile(token)
    if (profile) setUserProfile(profile)
    return 'user'
  }

  const signIn = async (email, password) => {
    return authService.signIn(email, password)
  }

  const signInWithGoogle = async (role = 'user') => {
    try {
      const firebaseUser = await authService.signInWithGoogle()
      const token = await authService.getToken()

      const res = await fetch('/api/auth?action=get-profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (data.role) {
        const roleMap = { customer: 'user', vendor: 'business' }
        const normalizedRole = roleMap[data.role] || data.role
        setUserProfile({ ...data.profile, role: normalizedRole })
        return { isNewUser: false, role: normalizedRole, needsPhone: false }
      }

      const isVendor = role === 'business' || role === 'vendor'
      return {
        isNewUser: true,
        role: isVendor ? 'business' : 'user',
        needsPhone: true,
        suggestedName: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
      }
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err))
    }
  }

  const signOut = async () => {
    clearPendingSignup()
    await authService.signOut()
    setUser(null)
    setUserProfile(null)
  }

  const sendVerificationEmail = async () => {
    await authService.sendVerificationEmail()
  }

  const reloadUser = async () => {
    return authService.reloadUser()
  }

  const getToken = async () => {
    return authService.getToken()
  }

  const updateProfile = async (data) => {
    if (!user) return
    const token = await authService.getToken()
    const resolvedName =
      data.displayName ||
      data.name ||
      data.owner_name ||
      data.shop_name ||
      data.businessName ||
      ''

    setUserProfile((prev) => ({
      ...prev,
      ...data,
      ...(resolvedName ? { displayName: resolvedName, owner_name: resolvedName, name: resolvedName } : {}),
    }))

    if (token) {
      const res = await fetch('/api/auth?action=update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to update profile')
      }
      await refreshProfile()
    }
  }

  const refreshProfile = async () => {
    const token = await authService.getToken()
    if (token) {
      const profile = await fetchProfile(token)
      setUserProfile(profile)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    completePendingSignup,
    completeGoogleSignup,
    signIn,
    signInWithGoogle,
    signOut,
    sendVerificationEmail,
    reloadUser,
    getToken,
    updateProfile,
    refreshProfile,
    isUser: userProfile?.role === 'user',
    isBusiness: userProfile?.role === 'business',
    isAdmin: userProfile?.role === 'admin',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
