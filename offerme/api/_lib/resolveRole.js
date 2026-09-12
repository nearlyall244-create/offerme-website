import { getSupabaseAdmin } from './supabaseAdmin.js'

export async function resolveRole(firebaseUid) {
  const supabase = getSupabaseAdmin()
  const roles = []

  const { data: user } = await supabase
    .from('public_users')
    .select('id')
    .eq('firebase_uid', firebaseUid)
    .limit(1)

  if (user && user.length > 0) roles.push('customer')

  const { data: owner } = await supabase
    .from('business_owners')
    .select('id')
    .eq('firebase_uid', firebaseUid)
    .limit(1)

  if (owner && owner.length > 0) roles.push('vendor')

  return roles
}

export async function hasRole(firebaseUid, requiredRole) {
  if (requiredRole === 'admin') return false
  const roles = await resolveRole(firebaseUid)
  return roles.includes(requiredRole)
}
