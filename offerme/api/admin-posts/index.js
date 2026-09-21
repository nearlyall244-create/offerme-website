export default async function handler(req, res) {
  try {
    const { supabaseAdmin } = await import('../_lib/supabaseAdmin.js')
    const { verifyToken } = await import('../_lib/verifyToken.js')

    // ── GET → fetch admin's own posts ──
    if (req.method === 'GET') {
      const authResult = await verifyToken(req)
      if (authResult.error) return res.status(authResult.status).json({ error: authResult.error })
      const uid = authResult.decodedToken.uid

      const { data: offers, error } = await supabaseAdmin
        .from('offers_post')
        .select('*, sell_your_bussiness(id, shop_name, shop_address, enquiry_number, shop_image_url, category_id, subcategory_id, business_email, shop_description, opening_time, closing_time, status, is_active, owner_id)')
        .eq('created_by_uid', uid)
        .eq('created_by_role', 'admin')
        .order('created_at', { ascending: false })

      if (error) return res.status(500).json({ error: error.message })

      const formatted = (offers || []).map((offer) => ({
        ...offer,
        businesses: offer.sell_your_bussiness || { shop_name: 'Admin Post' },
      }))

      return res.status(200).json({ offers: formatted })
    }

    // ── PUT → edit admin's own post (no approval needed) ──
    if (req.method === 'PUT') {
      const authResult = await verifyToken(req)
      if (authResult.error) return res.status(authResult.status).json({ error: authResult.error })
      const uid = authResult.decodedToken.uid
      const body = req.body || {}
      const offerId = body.offer_id
      if (!offerId) return res.status(400).json({ error: 'offer_id is required' })

      const { data: offer } = await supabaseAdmin
        .from('offers_post')
        .select('id, created_by_uid, created_by_role, business_id')
        .eq('id', offerId)
        .single()

      if (!offer) return res.status(404).json({ error: 'Offer not found' })
      if (offer.created_by_uid !== uid || offer.created_by_role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: you do not own this post' })
      }

      const {
        title, description, shopName, shopAddress, phoneNumber, businessEmail,
        businessCategory, businessSubcategory, openingTime, closingTime,
        imageUrl, discountPercentage, offerPrice, originalPrice, couponCode, valid_until,
      } = body

      // Update sell_your_bussiness
      if (offer.business_id) {
        const bizFields = {}
        if (shopName) bizFields.shop_name = shopName
        if (shopAddress) bizFields.shop_address = shopAddress
        if (phoneNumber) bizFields.enquiry_number = phoneNumber
        if (businessEmail) bizFields.business_email = businessEmail
        if (imageUrl) bizFields.shop_image_url = imageUrl
        if (description) bizFields.shop_description = description
        if (openingTime) bizFields.opening_time = openingTime
        if (closingTime) bizFields.closing_time = closingTime

        if (businessCategory) {
          const { data: cat } = await supabaseAdmin
            .from('categories')
            .select('id')
            .eq('slug', businessCategory)
            .maybeSingle()
          if (cat) bizFields.category_id = cat.id
        }
        if (businessSubcategory) bizFields.subcategory_id = businessSubcategory

        // Admin edits stay approved — no status reset
        if (Object.keys(bizFields).length > 0) {
          const { error: updateBizErr } = await supabaseAdmin
            .from('sell_your_bussiness')
            .update(bizFields)
            .eq('id', offer.business_id)
          if (updateBizErr) {
            console.error('[admin-posts] PUT business error:', updateBizErr)
            return res.status(500).json({ error: `Failed to update business: ${updateBizErr.message}` })
          }
        }
      }

      // Update offers_post
      const offerFields = {}
      if (title) offerFields.title = title
      if (description !== undefined) offerFields.description = description || null
      if (imageUrl) offerFields.image_url = imageUrl
      if (discountPercentage !== undefined) offerFields.discount_percent = Number(discountPercentage) || null
      if (offerPrice !== undefined) offerFields.discount_value = Number(offerPrice) || null
      if (couponCode !== undefined) offerFields.coupon_code = couponCode.trim() || null
      if (valid_until !== undefined) offerFields.valid_until = valid_until ? String(valid_until).split('T')[0] : null

      // Admin edits stay active — no is_active reset
      if (Object.keys(offerFields).length > 0) {
        const { error: updateOfferErr } = await supabaseAdmin
          .from('offers_post')
          .update(offerFields)
          .eq('id', offerId)
        if (updateOfferErr) {
          console.error('[admin-posts] PUT offer error:', updateOfferErr)
          return res.status(500).json({ error: `Failed to update offer: ${updateOfferErr.message}` })
        }
      }

      return res.status(200).json({ success: true, message: 'Post updated successfully' })
    }

    // ── DELETE → delete admin's own post ──
    if (req.method === 'DELETE') {
      const authResult = await verifyToken(req)
      if (authResult.error) return res.status(authResult.status).json({ error: authResult.error })
      const uid = authResult.decodedToken.uid
      const body = req.body || {}
      const offerId = body.offer_id
      if (!offerId) return res.status(400).json({ error: 'offer_id is required' })

      const { data: offer } = await supabaseAdmin
        .from('offers_post')
        .select('id, created_by_uid, created_by_role, business_id')
        .eq('id', offerId)
        .single()

      if (!offer) return res.status(404).json({ error: 'Offer not found' })
      if (offer.created_by_uid !== uid || offer.created_by_role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: you do not own this post' })
      }

      if (offer.business_id) {
        await supabaseAdmin
          .from('sell_your_bussiness')
          .update({ status: 'deleted', is_active: false })
          .eq('id', offer.business_id)
      }

      await supabaseAdmin.from('offers_post').delete().eq('id', offerId)
      return res.status(200).json({ success: true, message: 'Post deleted successfully' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[admin-posts] error:', err)
    return res.status(500).json({ error: err.message })
  }
}
