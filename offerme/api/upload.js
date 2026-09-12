import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { verifyToken } from './_lib/verifyToken.js'

const BUCKET = 'business-images'
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authResult = await verifyToken(req)
    if (authResult.error) {
      return res.status(authResult.status).json({ error: authResult.error })
    }

    const uid = authResult.decodedToken.uid
    const { file, fileName, fileType } = req.body

    if (!file || !fileName || !fileType) {
      return res.status(400).json({ error: 'file (base64), fileName, and fileType are required' })
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return res.status(400).json({ error: 'Only JPG, JPEG, PNG, and WebP images are allowed' })
    }

    const fileBuffer = Buffer.from(file, 'base64')
    if (fileBuffer.length > MAX_SIZE) {
      return res.status(400).json({ error: 'Image must be smaller than 5MB' })
    }

    const timestamp = Date.now()
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${uid}/${timestamp}_${safeName}`

    const supabase = getSupabaseAdmin()
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, fileBuffer, {
        contentType: fileType,
        upsert: false,
      })

    if (uploadError) {
      console.error('[upload] Supabase storage error:', uploadError)
      return res.status(500).json({ error: `Upload failed: ${uploadError.message}` })
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path)

    return res.status(200).json({
      success: true,
      url: urlData.publicUrl,
    })
  } catch (err) {
    console.error('[upload] outer error:', err)
    return res.status(500).json({ error: err.message })
  }
}
