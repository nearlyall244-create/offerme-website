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

export async function setCustomClaims(uid, claims) {
  try {
    const { initializeApp, cert, applicationDefault, getApps } = await import('firebase-admin/app')
    const { getAuth } = await import('firebase-admin/auth')

    if (getApps().length === 0) {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        try {
          initializeApp({ credential: applicationDefault() })
        } catch (e) {
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
          console.error('[firebaseAdmin] cert B64 failed:', e.message)
        }
      }

      if (getApps().length === 0) {
        console.error('[firebaseAdmin] Could not initialize for custom claims')
        return
      }
    }

    await getAuth().setCustomUserClaims(uid, claims)
  } catch (e) {
    console.error('[firebaseAdmin] setCustomClaims failed:', e.message)
  }
}
