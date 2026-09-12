export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { verifyToken } = await import('../_lib/verifyToken.js')
    const { supabaseAdmin } = await import('../_lib/supabaseAdmin.js')

    const authResult = await verifyToken(req)
    if (authResult.error) {
      return res.status(authResult.status).json({ error: authResult.error })
    }

    const { decodedToken } = authResult
    const { hasRole } = await import('../_lib/resolveRole.js')
    if (!(await hasRole(decodedToken.uid, 'customer'))) {
      return res.status(403).json({ error: 'Forbidden: customer role required' })
    }

    const { data: customer, error: custError } = await supabaseAdmin
      .from('public_users')
      .select('id')
      .eq('firebase_uid', decodedToken.uid)
      .single()

    if (custError || !customer) {
      return res.status(404).json({ error: 'Customer profile not found' })
    }

    const { data, error } = await supabaseAdmin
      .from('offer_redemptions')
      .select('*, offers(title, description, discount_percent, coupon_code, valid_until, businesses(shop_name))')
      .eq('customer_id', customer.id)
      .order('claimed_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ claims: data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
