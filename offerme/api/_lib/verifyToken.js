import { verifyFirebaseToken } from './firebaseAdmin.js'

export async function verifyToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', status: 401 }
  }

  const idToken = authHeader.split('Bearer ')[1]
  if (!idToken) {
    return { error: 'No token provided', status: 401 }
  }

  try {
    const decodedToken = await verifyFirebaseToken(idToken)
    return { decodedToken }
  } catch (err) {
    return { error: 'Invalid or expired token', status: 401 }
  }
}
