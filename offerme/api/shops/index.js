function computeIsOpen(openingTime, closingTime) {
  if (!openingTime || !closingTime) return false
  const now = new Date()
  const [oh, om] = openingTime.split(':').map(Number)
  const [ch, cm] = closingTime.split(':').map(Number)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = oh * 60 + om
  const closeMinutes = ch * 60 + cm
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes <= closeMinutes
  }
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { supabaseAdmin } = await import('../_lib/supabaseAdmin.js')

      const { category, search, page = 1, limit = 20 } = req.query
      const offset = (page - 1) * limit

      let query = supabaseAdmin
        .from('sell_your_bussiness')
        .select('*, business_owners(owner_name, email), offers_post(id, title, listing_type, is_active)', { count: 'exact' })
        .eq('is_active', true)
        .eq('status', 'approved')

      if (category) {
        query = query.eq('category_id', category)
      }

      if (search) {
        query = query.ilike('shop_name', `%${search}%`)
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      const listings = (data || []).map(shop => ({
        id: shop.id,
        name: shop.shop_name,
        category: shop.category_id,
        subcategory: shop.subcategory_id,
        rating: 0,
        reviewCount: 0,
        address: shop.shop_address,
        description: shop.shop_description,
        phone: shop.enquiry_number || null,
        offers: (shop.offers_post || [])
          .filter(o => o.is_active)
          .map(o => o.title),
        openingTime: shop.opening_time,
        closingTime: shop.closing_time,
        isOpen: computeIsOpen(shop.opening_time, shop.closing_time),
        image: shop.shop_image_url,
        isVerified: true,
      }))

      return res.status(200).json({
        shops: listings,
        total: count,
        page: Number(page),
        limit: Number(limit),
      })
    }

    if (req.method === 'POST') {
      const { verifyToken } = await import('../_lib/verifyToken.js')
      const { supabaseAdmin } = await import('../_lib/supabaseAdmin.js')
      const { hasRole } = await import('../_lib/resolveRole.js')

      const authResult = await verifyToken(req)
      if (authResult.error) {
        return res.status(authResult.status).json({ error: authResult.error })
      }

      const { decodedToken } = authResult
      const uid = decodedToken.uid

      if (!(await hasRole(uid, 'vendor'))) {
        return res.status(403).json({ error: 'Forbidden: vendor role required' })
      }

      const { shop_name, category, phone_number, email, address, logo_url } = req.body

      if (!shop_name) {
        return res.status(400).json({ error: 'shop_name is required' })
      }

      const { data: owner } = await supabaseAdmin
        .from('business_owners')
        .select('id')
        .eq('firebase_uid', uid)
        .single()

      if (!owner) {
        return res.status(404).json({ error: 'Business owner profile not found' })
      }

      let categoryId = null
      if (category) {
        const { data: cat } = await supabaseAdmin
          .from('categories')
          .select('id')
          .eq('slug', category)
          .maybeSingle()
        if (cat) categoryId = cat.id
      }

      const { data, error } = await supabaseAdmin
        .from('sell_your_bussiness')
        .insert({
          owner_id: owner.id,
          category_id: categoryId,
          shop_name,
          shop_image_url: logo_url || null,
          shop_address: address || null,
          enquiry_number: phone_number || null,
        })
        .select()
        .single()

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      return res.status(201).json({ shop: data })
    }

    if (req.method === 'PUT') {
      const { verifyToken } = await import('../_lib/verifyToken.js')
      const { supabaseAdmin } = await import('../_lib/supabaseAdmin.js')

      const authResult = await verifyToken(req)
      if (authResult.error) {
        return res.status(authResult.status).json({ error: authResult.error })
      }

      const { decodedToken } = authResult
      const { hasRole } = await import('../_lib/resolveRole.js')
      const ADMIN_EMAILS = ['nearlyall244@gmail.com', 'delivery.adbricks@gmail.com']
      const isAdmin = ADMIN_EMAILS.includes(decodedToken.email)
      const isVendor = await hasRole(decodedToken.uid, 'vendor')
      if (!isAdmin && !isVendor) {
        return res.status(403).json({ error: 'Forbidden: vendor or admin role required' })
      }

      const { shop_id, ...updateFields } = req.body
      if (!shop_id) {
        return res.status(400).json({ error: 'shop_id is required' })
      }

      let { data: business, error: fetchError } = await supabaseAdmin
        .from('sell_your_bussiness')
        .select('id, owner_id, business_owners(firebase_uid)')
        .eq('id', shop_id)
        .maybeSingle()

      if (!business) {
        // Fallback: check if shop_id passed was owner_id
        const { data: bByOwner } = await supabaseAdmin
          .from('sell_your_bussiness')
          .select('id, owner_id, business_owners(firebase_uid)')
          .eq('owner_id', shop_id)
          .maybeSingle()
        business = bByOwner
      }

      if (!business) {
        return res.status(404).json({ error: 'Business not found' })
      }

      if (!isAdmin && business.business_owners?.firebase_uid !== decodedToken.uid) {
        return res.status(403).json({ error: 'Forbidden: you do not own this business' })
      }

      const allowed = ['shop_name', 'shop_address', 'shop_description', 'shop_image_url', 'opening_time', 'closing_time', 'enquiry_number', 'latitude', 'longitude']
      const filtered = {}
      for (const key of allowed) {
        if (updateFields[key] !== undefined) filtered[key] = updateFields[key]
      }

      if (Object.keys(filtered).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' })
      }

      const { data, error } = await supabaseAdmin
        .from('sell_your_bussiness')
        .update(filtered)
        .eq('id', business.id)
        .select()
        .single()

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      // If shop_name was updated, sync owner_name as well
      if (filtered.shop_name && business.owner_id) {
        await supabaseAdmin
          .from('business_owners')
          .update({ owner_name: filtered.shop_name, updated_at: new Date().toISOString() })
          .eq('id', business.owner_id)
      }

      return res.status(200).json({ shop: data })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
