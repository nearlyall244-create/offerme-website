import { auth } from '@/config/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendEmailVerification,
  onAuthStateChanged,
  reload,
} from 'firebase/auth'

const googleProvider = new GoogleAuthProvider()

export const authService = {
  async signUp(email, password, displayName) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      const { updateProfile } = await import('firebase/auth')
      await updateProfile(user, { displayName })
    }
    await sendEmailVerification(user)
    return user
  },

  async signIn(email, password) {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
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
    await sendEmailVerification(user)
  },

  async reloadUser() {
    const user = auth.currentUser
    if (!user) throw new Error('No user signed in')
    await reload(user)
    return user
  },

  getCurrentUser() {
    return auth.currentUser
  },

  async getToken() {
    const user = auth.currentUser
    if (!user) return null
    return user.getIdToken()
  },

  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback)
  },
}
