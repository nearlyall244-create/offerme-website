import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '@/services/authService'

const AuthContext = createContext(null)

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
    const firebaseUser = await authService.signUp(email, password, displayName)
    const token = await authService.getToken()

    const isVendor = role === 'business' || role === 'vendor'

    if (isVendor) {
      const res = await fetch('/api/auth?action=signup-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shop_name: displayName || 'My Shop', phone_number }),
      })
      const data = await res.json()
      setUserProfile(data.shop ? { ...data.shop, role: 'business' } : { firebase_uid: firebaseUser.uid, email, displayName, role: 'business' })
    } else {
      const res = await fetch('/api/auth?action=signup-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: displayName, phone_number }),
      })
      const data = await res.json()
      setUserProfile(data.customer ? { ...data.customer, role: 'user' } : { firebase_uid: firebaseUser.uid, email, displayName, role: 'user' })
    }

    return firebaseUser
  }

  const signIn = async (email, password) => {
    return authService.signIn(email, password)
  }

  const signInWithGoogle = async (role = 'user') => {
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
      return { isNewUser: false, role: normalizedRole }
    }

    const isVendor = role === 'business' || role === 'vendor'
    if (isVendor) {
      const res = await fetch('/api/auth?action=signup-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shop_name: firebaseUser.displayName || 'My Shop', phone_number: null }),
      })
      const result = await res.json()
      setUserProfile(result.shop ? { ...result.shop, role: 'business' } : { firebase_uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName, role: 'business' })
      return { isNewUser: true, role: 'business' }
    } else {
      const res = await fetch('/api/auth?action=signup-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: firebaseUser.displayName || null, phone_number: null }),
      })
      const result = await res.json()
      setUserProfile(result.customer ? { ...result.customer, role: 'user' } : { firebase_uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName, role: 'user' })
      return { isNewUser: true, role: 'user' }
    }
  }

  const signOut = async () => {
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
