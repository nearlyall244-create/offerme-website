import { verifyToken } from './_lib/verifyToken.js'
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'

const BUCKET = 'profile-avatars'
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

async function getCustomer(supabase, uid) {
  const { data, error } = await supabase
    .from('public_users')
    .select('id, avatar_path')
    .eq('firebase_uid', uid)
    .maybeSingle()
  if (error) throw error
  return data
}

export default async function handler(req, res) {
  if (!['POST', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authResult = await verifyToken(req)
    if (authResult.error) return res.status(authResult.status).json({ error: authResult.error })

    const uid = authResult.decodedToken.uid
    const supabase = getSupabaseAdmin()
    const customer = await getCustomer(supabase, uid)
    if (!customer) return res.status(403).json({ error: 'Customer profile required' })

    if (req.method === 'DELETE') {
      const { error: updateError } = await supabase
        .from('public_users')
        .update({ avatar_path: null, updated_at: new Date().toISOString() })
        .eq('id', customer.id)
      if (updateError) throw updateError
      if (customer.avatar_path) await supabase.storage.from(BUCKET).remove([customer.avatar_path])
      return res.status(200).json({ success: true, avatar_url: null })
    }

    const { file, fileName, fileType } = req.body || {}
    if (!file || !fileName || !fileType) {
      return res.status(400).json({ error: 'file (base64), fileName, and fileType are required' })
    }
    if (!ALLOWED_TYPES.includes(fileType)) {
      return res.status(400).json({ error: 'Only JPG, JPEG, PNG, and WebP images are allowed' })
    }

    const fileBuffer = Buffer.from(file, 'base64')
    if (!fileBuffer.length || fileBuffer.length > MAX_SIZE) {
      return res.status(400).json({ error: 'Image must be smaller than 5MB' })
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${uid}/${Date.now()}_${safeName}`
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, fileBuffer, {
      contentType: fileType,
      upsert: false,
    })
    if (uploadError) throw uploadError

    const { error: updateError } = await supabase
      .from('public_users')
      .update({ avatar_path: path, updated_at: new Date().toISOString() })
      .eq('id', customer.id)
    if (updateError) {
      await supabase.storage.from(BUCKET).remove([path])
      throw updateError
    }

    if (customer.avatar_path) await supabase.storage.from(BUCKET).remove([customer.avatar_path])
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60)
    return res.status(200).json({ success: true, avatar_url: signed?.signedUrl || null })
  } catch (err) {
    console.error('[profile-avatar] error:', err)
    return res.status(500).json({ error: err.message || 'Avatar upload failed' })
  }
}
