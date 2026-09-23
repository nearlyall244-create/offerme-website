import { createRemoteJWKSet, jwtVerify } from 'jose'

const GOOGLE_JWKS_URL = new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID

let jwks = null

function getJWKS() {
  if (!jwks) {
    jwks = createRemoteJWKSet(GOOGLE_JWKS_URL)
  }
  return jwks
}

export async function verifyFirebaseToken(idToken) {
  const keySet = getJWKS()
  const { payload } = await jwtVerify(idToken, keySet, {
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    audience: FIREBASE_PROJECT_ID,
  })
  return { uid: payload.sub, ...payload }
}

async function ensureFirebaseApp(label) {
  const { initializeApp, cert, applicationDefault, getApps } = await import('firebase-admin/app')

  if (getApps().length === 0) {
    let initError = null

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        initializeApp({ credential: applicationDefault() })
      } catch (e) {
        initError = `GAC failed: ${e.message}`
        console.error('[firebaseAdmin] GAC failed:', e.message)
      }
    }

    if (getApps().length === 0 && process.env.FIREBASE_PRIVATE_KEY_B64) {
      try {
        const key = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, 'base64').toString('utf8')
        initializeApp({
          credential: cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: key.replace(/\\n/g, '\n'),
          }),
        })
      } catch (e) {
        initError = `${initError ? initError + '; ' : ''}cert B64 failed: ${e.message}`
        console.error('[firebaseAdmin] cert B64 failed:', e.message)
      }
    }

    if (getApps().length === 0) {
      const hasGac = !!process.env.GOOGLE_APPLICATION_CREDENTIALS
      const hasCert = !!(
        process.env.FIREBASE_PRIVATE_KEY_B64 &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        FIREBASE_PROJECT_ID
      )

      if (!hasGac && !hasCert) {
        const missing = []
        if (!process.env.FIREBASE_PRIVATE_KEY_B64) missing.push('FIREBASE_PRIVATE_KEY_B64')
        if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL')
        if (!FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID')
        throw new Error(
          `Missing env vars: ${missing.join(', ')} (or GOOGLE_APPLICATION_CREDENTIALS)`
        )
      }

      throw new Error(
        `Firebase Admin SDK not initialized${initError ? ` (${initError})` : ''} for ${label}`
      )
    }
  }
}

export async function deleteFirebaseUser(uid) {
  try {
    await ensureFirebaseApp('deleteFirebaseUser')
    const { getAuth } = await import('firebase-admin/auth')
    await getAuth().deleteUser(uid)
  } catch (e) {
    console.error('[firebaseAdmin] deleteUser failed:', e.message)
    throw e
  }
}

export async function setCustomClaims(uid, claims) {
  try {
    await ensureFirebaseApp('setCustomClaims')
    const { getAuth } = await import('firebase-admin/auth')
    await getAuth().setCustomUserClaims(uid, claims)
  } catch (e) {
    console.error('[firebaseAdmin] setCustomClaims failed:', e.message)
  }
}

export async function isEmailVerified(uid) {
  await ensureFirebaseApp('isEmailVerified')
  const { getAuth } = await import('firebase-admin/auth')
  const user = await getAuth().getUser(uid)
  return !!user.emailVerified
}
