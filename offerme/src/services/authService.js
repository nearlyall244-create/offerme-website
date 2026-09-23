import { auth } from '@/config/firebase'
import { mapFirebaseAuthError } from '@/utils/validation'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendEmailVerification,
  onAuthStateChanged,
  reload,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  verifyBeforeUpdateEmail,
  applyActionCode,
} from 'firebase/auth'

const googleProvider = new GoogleAuthProvider()

const verifyContinueUrl = () => `${window.location.origin}/auth/verify-email`

export const authService = {
  async signUp(email, password, displayName) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) {
        const { updateProfile } = await import('firebase/auth')
        await updateProfile(user, { displayName })
      }
      await sendEmailVerification(user, {
        url: verifyContinueUrl(),
      })
      return user
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err))
    }
  },

  async signIn(email, password) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      return user
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err))
    }
  },

  async signInWithGoogle() {
    const { user } = await signInWithPopup(auth, googleProvider)
    return user
  },

  async signOut() {
    await firebaseSignOut(auth)
  },

  async sendVerificationEmail() {
    const user = auth.currentUser
    if (!user) throw new Error('No user signed in')
    await sendEmailVerification(user, {
      url: verifyContinueUrl(),
    })
  },

  async reloadUser() {
    const user = auth.currentUser
    if (!user) throw new Error('No user signed in')
    await reload(user)
    return user
  },

  async requestEmailChange(newEmail, currentPassword = '') {
    const user = auth.currentUser
    if (!user) throw new Error('No user signed in')

    const normalizedEmail = newEmail.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error('Please enter a valid email address')
    }
    if (normalizedEmail === user.email?.toLowerCase()) {
      throw new Error('That is already your current email address')
    }

    const usesPassword = user.providerData.some((provider) => provider.providerId === 'password')
    if (usesPassword) {
      if (!currentPassword) throw new Error('Enter your current password to continue')
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
    } else if (user.providerData.some((provider) => provider.providerId === 'google.com')) {
      await reauthenticateWithPopup(user, googleProvider)
    } else {
      throw new Error('Please sign in again with your original sign-in method before changing your email')
    }

    await verifyBeforeUpdateEmail(user, normalizedEmail, {
      url: `${window.location.origin}/auth/email-action`,
      handleCodeInApp: true,
    })
  },

  async applyEmailActionCode(code) {
    if (!code) throw new Error('This email verification link is missing its action code')
    await applyActionCode(auth, code)
    const user = auth.currentUser
    if (user) {
      await reload(user)
      await user.getIdToken(true)
    }
  },

  async changePassword(newPassword) {
    const user = auth.currentUser
    if (!user) throw new Error('No user signed in')

    const usesPassword = user.providerData.some((p) => p.providerId === 'password')
    if (!usesPassword) {
      throw new Error('Your account uses a social login. Password change is not available.')
    }

    const { updatePassword } = await import('firebase/auth')
    await updatePassword(user, newPassword)
  },

  getCurrentUser() {
    return auth.currentUser
  },

  async getToken(forceRefresh = false) {
    const user = auth.currentUser
    if (!user) return null
    return user.getIdToken(forceRefresh)
  },

  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback)
  },
}
