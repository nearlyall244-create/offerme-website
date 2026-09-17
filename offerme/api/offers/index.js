export default async function handler(req, res) {
  try {
    const { supabaseAdmin } = await import('../_lib/supabaseAdmin.js')

    // ── GET → public offers list or authenticated vendor's offers ──
    if (req.method === 'GET') {
      const { category: _category, shop_id, search, page = 1, limit = 20, mine, listing_type } = req.query
      const offset = (page - 1) * limit

      if (mine === 'true') {
        const { verifyToken } = await import('../_lib/verifyToken.js')
        const authResult = await verifyToken(req)
        if (authResult.error) {
          return res.status(authResult.status).json({ error: authResult.error })
        }

        const uid = authResult.decodedToken.uid

        // Find business owner
        const { data: owner } = await supabaseAdmin
          .from('business_owners')
          .select('id, owner_name')
          .eq('firebase_uid', uid)
          .maybeSingle()

        // Find businesses
        const { data: businesses } = await supabaseAdmin
          .from('sell_your_bussiness')
          .select('id, shop_name, shop_address, enquiry_number, shop_image_url, category_id, subcategory_id, business_email, shop_description')
          .eq('owner_id', owner?.id || '00000000-0000-0000-0000-000000000000')

        const bIds = (businesses || []).map((b) => b.id)
        const businessMap = {}
        for (const b of businesses || []) {
          businessMap[b.id] = b
        }

        let query = supabaseAdmin
          .from('offers_post')
          .select('*', { count: 'exact' })

        if (listing_type) {
          query = query.eq('listing_type', listing_type)
        }

        if (bIds.length > 0) {
          query = query.or(`created_by_uid.eq.${uid},business_id.in.(${bIds.join(',')})`)
        } else {
          query = query.eq('created_by_uid', uid)
        }

        const { data: myOffers, count, error: err } = await query.order('created_at', { ascending: false })

        if (err) {
          return res.status(500).json({ error: err.message })
        }

        const formattedOffers = (myOffers || []).map((offer) => ({
          ...offer,
          businesses: businessMap[offer.business_id] || {
            shop_name: owner?.owner_name || 'My Business',
          },
        }))

        return res.status(200).json({ offers: formattedOffers, total: count || 0 })
      }

      let query = supabaseAdmin
        .from('offers_post')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      if (shop_id) {
        query = query.eq('business_id', shop_id)
      }

      if (search) {
        query = query.ilike('title', `%${search}%`)
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({
        offers: data || [],
        total: count || 0,
        page: Number(page),
        limit: Number(limit),
      })
    }

    // ── POST → create, claim, or redeem ──
    if (req.method === 'POST') {
      const { verifyToken } = await import('../_lib/verifyToken.js')
      const { action } = req.query

      const authResult = await verifyToken(req)
      if (authResult.error) {
        return res.status(authResult.status).json({ error: authResult.error })
      }

      const { decodedToken } = authResult
      const uid = decodedToken.uid

      // POST ?action=create-deal / sell-business → publish deal into offers_post
      if (action === 'create-deal' || action === 'create-offer' || action === 'sell-business' || !action) {
        const body = req.body || {}
        const {
          dealHeadline,
          title,
          discountPercentage,
          discount_percent,
          couponCode,
          coupon_code,
          originalPrice,
          offerPrice,
          expiryDate,
          valid_until,
          description,
          imageUrl,
          image_url,
          shopName,
          shop_id,
          shopAddress,
          phoneNumber,
          businessEmail,
          businessCategory,
          businessSubcategory,
          openingTime,
          closingTime,
        } = body

        const dealTitle = (dealHeadline || title || shopName || 'Business Listing').trim()
        if (!dealTitle) {
          return res.status(400).json({ error: 'Title or Shop name is required' })
        }

        if (shopName && (shopName.trim().length < 3 || shopName.trim().length > 200)) {
          return res.status(400).json({ error: 'Shop name must be 3-200 characters' })
        }

        if (businessEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(businessEmail.trim())) {
            return res.status(400).json({ error: 'Valid email is required' })
          }
        }

        if (phoneNumber) {
          const digits = phoneNumber.replace(/\D/g, '')
          if (digits.length !== 10 || !/^[6-9]\d{9}$/.test(digits)) {
            return res.status(400).json({ error: 'Valid 10-digit Indian phone number required' })
          }
        }

        if (shopAddress) {
          if (shopAddress.trim().length < 10 || shopAddress.trim().length > 200) {
            return res.status(400).json({ error: 'Address must be 10-200 characters' })
          }
        }

        if (description) {
          if (description.trim().length < 10 || description.trim().length > 500) {
            return res.status(400).json({ error: 'Description must be 10-500 characters' })
          }
        }

        // Find business owner
        let { data: owner } = await supabaseAdmin
          .from('business_owners')
          .select('id, owner_name')
          .eq('firebase_uid', uid)
          .maybeSingle()

        if (!owner) {
          const { data: newOwner } = await supabaseAdmin
            .from('business_owners')
            .insert({
              firebase_uid: uid,
              owner_name: decodedToken.name || shopName || 'Business Owner',
              email: decodedToken.email || null,
            })
            .select()
            .single()
          owner = newOwner
        }

        // Find or associate business
        let businessId = shop_id
        if (!businessId && owner) {
          const { data: business } = await supabaseAdmin
            .from('sell_your_bussiness')
            .select('id')
            .eq('owner_id', owner.id)
            .maybeSingle()
          if (business) businessId = business.id
        }

        // Look up category_id if businessCategory slug provided
        let categoryId = null
        if (businessCategory) {
          const { data: cat } = await supabaseAdmin
            .from('categories')
            .select('id')
            .eq('slug', businessCategory)
            .maybeSingle()
          if (cat) categoryId = cat.id
        }

        // Update existing business fields if found
        if (businessId && owner) {
          const updateFields = {}
          if (shopName) updateFields.shop_name = shopName
          if (shopAddress) updateFields.shop_address = shopAddress
          if (phoneNumber) updateFields.enquiry_number = phoneNumber
          if (businessEmail) updateFields.business_email = businessEmail
          if (categoryId) updateFields.category_id = categoryId
          if (businessSubcategory) updateFields.subcategory_id = businessSubcategory
          if (imageUrl || image_url) updateFields.shop_image_url = imageUrl || image_url
          if (description) updateFields.shop_description = description
          if (openingTime) updateFields.opening_time = openingTime
          if (closingTime) updateFields.closing_time = closingTime
          if (Object.keys(updateFields).length > 0) {
            const { error: updateErr } = await supabaseAdmin
              .from('sell_your_bussiness')
              .update(updateFields)
              .eq('id', businessId)
            if (updateErr) {
              console.error('[offers] sell-business update error:', updateErr)
              return res.status(500).json({ error: `Failed to update business: ${updateErr.message}` })
            }
          }
        }

        if (!businessId && shopName && owner) {
          const { data: newB, error: insertBizErr } = await supabaseAdmin
            .from('sell_your_bussiness')
            .insert({
              owner_id: owner.id,
              category_id: categoryId,
              subcategory_id: businessSubcategory || null,
              shop_name: shopName,
              shop_address: shopAddress || null,
              enquiry_number: phoneNumber || null,
              shop_image_url: imageUrl || image_url || null,
              shop_description: description || null,
              business_email: businessEmail || null,
              opening_time: openingTime || null,
              closing_time: closingTime || null,
              status: 'pending',
              is_active: false,
            })
            .select()
            .single()
          if (insertBizErr) {
            console.error('[offers] sell-business insert error:', insertBizErr)
            return res.status(500).json({ error: `Failed to create business: ${insertBizErr.message}` })
          }
          if (newB) businessId = newB.id
        }

        const discountNum = Number(discountPercentage ?? discount_percent) || null
        const discValue = Number(offerPrice) || discountNum || null
        const finalValidUntil = expiryDate || valid_until ? String(expiryDate || valid_until).split('T')[0] : null
        const todayStr = new Date().toISOString().split('T')[0]

        let fullDesc = description || ''
        if (originalPrice && offerPrice) {
          fullDesc = `Original Price: ₹${originalPrice} | Offer Price: ₹${offerPrice}${fullDesc ? ' — ' + fullDesc : ''}`
        }

        const listingType = (action === 'sell-business') ? 'sell-business' : 'offer'

        const { data: offerPost, error: insertErr } = await supabaseAdmin
          .from('offers_post')
          .insert({
            title: dealTitle,
            description: fullDesc || null,
            discount_percent: discountNum,
            discount_type: 'percentage',
            discount_value: discValue,
            coupon_code: (couponCode || coupon_code || '').trim() || null,
            image_url: imageUrl || image_url || null,
            valid_from: todayStr,
            valid_until: finalValidUntil,
            is_active: true,
            business_id: businessId || null,
            created_by_uid: uid,
            created_by_role: 'business_owner',
            listing_type: listingType,
          })
          .select()
          .single()

        if (insertErr) {
          return res.status(500).json({ error: `Failed to create offer: ${insertErr.message}` })
        }

        return res.status(201).json({
          success: true,
          message: 'Offer published successfully',
          offer: offerPost,
        })
      }

      // POST ?action=claim → customer claims an offer
      if (action === 'claim') {
        const { offer_id } = req.body
        if (!offer_id) {
          return res.status(400).json({ error: 'offer_id is required' })
        }

        const { data: offer, error: offerError } = await supabaseAdmin
          .from('offers_post')
          .select('id, is_active, valid_until')
          .eq('id', offer_id)
          .single()

        if (offerError || !offer) {
          return res.status(404).json({ error: 'Offer not found' })
        }

        if (!offer.is_active) {
          return res.status(400).json({ error: 'Offer is no longer active' })
        }

        return res.status(200).json({ message: 'Claim successful', offer })
      }
    }

    // ── DELETE → vendor removes an offer ──
    if (req.method === 'DELETE') {
      const { verifyToken } = await import('../_lib/verifyToken.js')
      const authResult = await verifyToken(req)
      if (authResult.error) return res.status(authResult.status).json({ error: authResult.error })

      const uid = authResult.decodedToken.uid
      const body = req.body || {}
      const offerId = req.query.offer_id || body.offer_id
      if (!offerId) return res.status(400).json({ error: 'offer_id is required' })

      const { data: offer } = await supabaseAdmin
        .from('offers_post')
        .select('id, created_by_uid')
        .eq('id', offerId)
        .single()

      if (!offer) return res.status(404).json({ error: 'Offer not found' })
      if (offer.created_by_uid !== uid) {
        return res.status(403).json({ error: 'Forbidden: you do not own this offer' })
      }

      await supabaseAdmin.from('offers_post').delete().eq('id', offerId)
      return res.status(200).json({ success: true, message: 'Offer deleted successfully' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[offers] outer error:', err)
    return res.status(500).json({ error: err.message })
  }
}
