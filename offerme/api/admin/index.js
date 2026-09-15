export default async function handler(req, res) {
  try {
    const { verifyToken } = await import('../_lib/verifyToken.js')
    const { supabaseAdmin } = await import('../_lib/supabaseAdmin.js')

    const authResult = await verifyToken(req)
    if (authResult.error) {
      return res.status(authResult.status).json({ error: authResult.error })
    }

    const { decodedToken } = authResult

    const ADMIN_EMAILS = ['nearlyall244@gmail.com', 'delivery.adbricks@gmail.com']
    const isAdmin = ADMIN_EMAILS.includes(decodedToken.email)
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: admin role required' })
    }

    // ── POST → create post on behalf of business owner ──
    if (req.method === 'POST') {
      const { action } = req.query

      if (action === 'create-post') {
        const body = req.body || {}
        const {
          shopName,
          shopEmail,
          phoneNumber,
          businessCategory,
          businessSubcategory,
          openingTime,
          closingTime,
          shopAddress,
          imageUrl,
          shopDescription,
        } = body

        // --- Input Validation ---
        const validationErrors = {}

        if (!shopName || shopName.trim().length < 3) {
          validationErrors.shopName = 'Shop name must be at least 3 characters'
        } else if (shopName.trim().length > 200) {
          validationErrors.shopName = 'Shop name must be less than 200 characters'
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!shopEmail || !emailRegex.test(shopEmail.trim())) {
          validationErrors.shopEmail = 'Valid email is required'
        }

        const digits = (phoneNumber || '').replace(/\D/g, '')
        if (digits.length !== 10 || !/^[6-9]\d{9}$/.test(digits)) {
          validationErrors.phoneNumber = 'Valid 10-digit Indian phone number required'
        }

        if (!businessCategory) {
          validationErrors.businessCategory = 'Category is required'
        }

        if (!shopAddress || shopAddress.trim().length < 10) {
          validationErrors.shopAddress = 'Address must be at least 10 characters'
        } else if (shopAddress.trim().length > 200) {
          validationErrors.shopAddress = 'Address must be less than 200 characters'
        }

        if (shopDescription && shopDescription.trim().length > 500) {
          validationErrors.shopDescription = 'Description must be less than 500 characters'
        }

        if (Object.keys(validationErrors).length > 0) {
          return res.status(400).json({ error: 'Validation failed', details: validationErrors })
        }

        // --- Rate Limiting: 20 posts per admin per day ---
        const oneDayAgo = new Date(Date.now() - 86400000).toISOString()
        const { count: recentPosts } = await supabaseAdmin
          .from('admin_logs')
          .select('*', { count: 'exact', head: true })
          .eq('admin_uid', decodedToken.uid)
          .eq('action', 'create_post_on_behalf')
          .gte('created_at', oneDayAgo)

        if ((recentPosts || 0) >= 20) {
          return res.status(429).json({ error: 'Daily post limit reached. Maximum 20 posts per day.' })
        }

        // --- Validate category exists ---
        let categoryId = null
        if (businessCategory) {
          const { data: cat } = await supabaseAdmin
            .from('categories')
            .select('id')
            .eq('id', businessCategory)
            .maybeSingle()
          if (!cat) {
            return res.status(400).json({ error: 'Invalid category' })
          }
          categoryId = cat.id
        }

        // --- Duplicate Check (by shop_name + business_email) ---
        const { data: existing } = await supabaseAdmin
          .from('sell_your_bussiness')
          .select('id')
          .eq('shop_name', shopName.trim())
          .eq('business_email', shopEmail.trim())
          .maybeSingle()

        if (existing) {
          return res.status(409).json({ error: 'A listing with this shop name and email already exists' })
        }

        // --- Find or Create Placeholder Owner (required by database constraint) ---
        const PLACEHOLDER_EMAIL = 'admin-created@offerme.in'
        let { data: placeholderOwner } = await supabaseAdmin
          .from('business_owners')
          .select('id')
          .eq('email', PLACEHOLDER_EMAIL)
          .maybeSingle()

        if (!placeholderOwner) {
          const { data: newOwner, error: ownerError } = await supabaseAdmin
            .from('business_owners')
            .insert({
              firebase_uid: '00000000-0000-0000-0000-000000000000',
              owner_name: 'Admin Created Listing',
              email: PLACEHOLDER_EMAIL,
            })
            .select()
            .single()

          if (ownerError) {
            return res.status(500).json({ error: `Failed to create placeholder owner: ${ownerError.message}` })
          }
          placeholderOwner = newOwner
        }

        // --- Insert into sell_your_bussiness ---
        const { data: newBusiness, error: businessError } = await supabaseAdmin
          .from('sell_your_bussiness')
          .insert({
            owner_id: placeholderOwner.id,
            category_id: categoryId,
            subcategory_id: businessSubcategory || null,
            shop_name: shopName.trim(),
            business_email: shopEmail.trim(),
            enquiry_number: digits,
            shop_address: shopAddress.trim(),
            shop_image_url: imageUrl || null,
            shop_description: shopDescription || null,
            opening_time: openingTime || null,
            closing_time: closingTime || null,
            status: 'pending',
            is_active: false,
          })
          .select()
          .single()

        if (businessError) {
          return res.status(500).json({ error: `Failed to create business: ${businessError.message}` })
        }

        // --- Insert into offers_post ---
        const todayStr = new Date().toISOString().split('T')[0]
        const { data: offerPost, error: offerError } = await supabaseAdmin
          .from('offers_post')
          .insert({
            title: shopName.trim(),
            description: shopDescription || null,
            image_url: imageUrl || null,
            valid_from: todayStr,
            is_active: true,
            business_id: newBusiness.id,
            created_by_uid: decodedToken.uid,
            created_by_role: 'admin',
            listing_type: 'sell-business',
          })
          .select()
          .single()

        if (offerError) {
          console.error('[admin] create-post offer insert error:', offerError)
        }

        // --- Log to admin_logs ---
        await supabaseAdmin.from('admin_logs').insert({
          admin_uid: decodedToken.uid,
          admin_email: decodedToken.email,
          action: 'create_post_on_behalf',
          target_type: 'business',
          target_id: newBusiness.id,
          details: {
            shop_name: shopName.trim(),
            business_email: shopEmail.trim(),
            category_id: categoryId,
            placeholder_owner_id: placeholderOwner.id,
            created_at: new Date().toISOString(),
          },
        })

        return res.status(201).json({
          success: true,
          message: 'Post created successfully. Pending approval.',
          business: { id: newBusiness.id, shop_name: shopName.trim() },
          offer: offerPost ? { id: offerPost.id } : null,
        })
      }

      return res.status(400).json({ error: 'Invalid action' })
    }

    // ── GET ?type=shops → list businesses / GET ?type=offers → list offers ──
    if (req.method === 'GET') {
      const { type, status, page = 1, limit = 20 } = req.query
      const offset = (page - 1) * limit

      if (type === 'owners') {
        const { data, count, error } = await supabaseAdmin
          .from('business_owners')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          return res.status(500).json({ error: error.message })
        }

        return res.status(200).json({
          owners: data,
          total: count,
          page: Number(page),
          limit: Number(limit),
        })
      }

      if (type === 'shops') {
        let query = supabaseAdmin
          .from('sell_your_bussiness')
          .select('*, business_owners(owner_name, email, firebase_uid)', { count: 'exact' })

        if (status === 'active') {
          query = query.eq('is_active', true)
        } else if (status === 'inactive') {
          query = query.eq('is_active', false)
        }

        const { data, count, error } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          return res.status(500).json({ error: error.message })
        }

        return res.status(200).json({
          shops: data,
          total: count,
          page: Number(page),
          limit: Number(limit),
        })
      }

      if (type === 'submissions') {
        let query = supabaseAdmin
          .from('sell_your_bussiness')
          .select('*, business_owners(owner_name, email, firebase_uid)', { count: 'exact' })

        if (status === 'pending') {
          query = query.eq('status', 'pending')
        } else if (status === 'approved') {
          query = query.eq('status', 'approved')
        } else if (status === 'rejected') {
          query = query.eq('status', 'rejected')
        }

        const { data, count, error } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          return res.status(500).json({ error: error.message })
        }

        return res.status(200).json({
          submissions: data,
          total: count,
          page: Number(page),
          limit: Number(limit),
        })
      }

      if (type === 'offers') {
        let query = supabaseAdmin
          .from('offers_post')
          .select('*, sell_your_bussiness(shop_name, business_owners(owner_name, email, firebase_uid))', { count: 'exact' })

        if (status === 'active') {
          query = query.eq('is_active', true)
        } else if (status === 'inactive') {
          query = query.eq('is_active', false)
        }

        const { data, count, error } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          return res.status(500).json({ error: error.message })
        }

        return res.status(200).json({
          offers: data,
          total: count,
          page: Number(page),
          limit: Number(limit),
        })
      }

      return res.status(400).json({ error: 'type=shops or type=offers is required' })
    }

    // ── PUT → admin toggles business active/inactive OR update owner status OR approve/reject submission ──
    if (req.method === 'PUT') {
      const { shop_id, owner_id, account_status, action, rejection_reason } = req.body

      if (owner_id && account_status) {
        const { data, error } = await supabaseAdmin
          .from('business_owners')
          .update({ account_status })
          .eq('id', owner_id)
          .select()
          .single()

        if (error) {
          return res.status(500).json({ error: error.message })
        }

        await supabaseAdmin.from('admin_logs').insert({
          admin_uid: decodedToken.uid,
          action: 'update_owner_status',
          target_type: 'business_owner',
          target_id: String(owner_id),
          details: { account_status },
        })

        return res.status(200).json({ message: 'Owner status updated', owner: data })
      }

      if (shop_id && action) {
        if (action === 'approve') {
          const { data, error } = await supabaseAdmin
            .from('sell_your_bussiness')
            .update({ status: 'approved', is_active: true })
            .eq('id', shop_id)
            .select()
            .single()

          if (error) {
            return res.status(500).json({ error: error.message })
          }

          await supabaseAdmin.from('admin_logs').insert({
            admin_uid: decodedToken.uid,
            action: 'approve_submission',
            target_type: 'business',
            target_id: String(shop_id),
            details: { shop_name: data.shop_name },
          })

          return res.status(200).json({ message: 'Submission approved', shop: data })
        }

        if (action === 'reject') {
          const { data, error } = await supabaseAdmin
            .from('sell_your_bussiness')
            .update({ status: 'rejected', is_active: false, rejection_reason: rejection_reason || null })
            .eq('id', shop_id)
            .select()
            .single()

          if (error) {
            return res.status(500).json({ error: error.message })
          }

          await supabaseAdmin.from('admin_logs').insert({
            admin_uid: decodedToken.uid,
            action: 'reject_submission',
            target_type: 'business',
            target_id: String(shop_id),
            details: { shop_name: data.shop_name, rejection_reason },
          })

          return res.status(200).json({ message: 'Submission rejected', shop: data })
        }
      }

      const { offer_id } = req.body

      if (offer_id && action) {
        if (action === 'approve') {
          const { data, error } = await supabaseAdmin
            .from('offers_post')
            .update({ is_active: true })
            .eq('id', offer_id)
            .select()
            .single()

          if (error) {
            return res.status(500).json({ error: error.message })
          }

          await supabaseAdmin.from('admin_logs').insert({
            admin_uid: decodedToken.uid,
            action: 'approve_offer',
            target_type: 'offer',
            target_id: String(offer_id),
            details: { title: data.title },
          })

          return res.status(200).json({ message: 'Offer approved', offer: data })
        }

        if (action === 'reject') {
          const { data, error } = await supabaseAdmin
            .from('offers_post')
            .update({ is_active: false })
            .eq('id', offer_id)
            .select()
            .single()

          if (error) {
            return res.status(500).json({ error: error.message })
          }

          await supabaseAdmin.from('admin_logs').insert({
            admin_uid: decodedToken.uid,
            action: 'reject_offer',
            target_type: 'offer',
            target_id: String(offer_id),
            details: { title: data.title, rejection_reason },
          })

          return res.status(200).json({ message: 'Offer rejected', offer: data })
        }
      }

      if (!shop_id) {
        return res.status(400).json({ error: 'shop_id or owner_id is required' })
      }

      const { data: business, error: fetchError } = await supabaseAdmin
        .from('sell_your_bussiness')
        .select('id, is_active, shop_name')
        .eq('id', shop_id)
        .single()

      if (fetchError || !business) {
        return res.status(404).json({ error: 'Business not found' })
      }

      const newStatus = !business.is_active
      const { data, error } = await supabaseAdmin
        .from('sell_your_bussiness')
        .update({ is_active: newStatus })
        .eq('id', shop_id)
        .select()
        .single()

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      await supabaseAdmin.from('admin_logs').insert({
        admin_uid: decodedToken.uid,
        action: newStatus ? 'activate_business' : 'deactivate_business',
        target_type: 'business',
        target_id: String(shop_id),
        details: { shop_name: business.shop_name, is_active: newStatus },
      })

      return res.status(200).json({
        message: newStatus ? 'Business activated' : 'Business deactivated',
        shop: data,
      })
    }

    // ── DELETE → admin deletes a business submission ──
    if (req.method === 'DELETE') {
      const { shop_id } = req.body
      if (!shop_id) {
        return res.status(400).json({ error: 'shop_id is required' })
      }

      const { data: business, error: fetchError } = await supabaseAdmin
        .from('sell_your_bussiness')
        .select('id, shop_name')
        .eq('id', shop_id)
        .single()

      if (fetchError || !business) {
        return res.status(404).json({ error: 'Business not found' })
      }

      const { error } = await supabaseAdmin
        .from('sell_your_bussiness')
        .delete()
        .eq('id', shop_id)

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      await supabaseAdmin.from('admin_logs').insert({
        admin_uid: decodedToken.uid,
        action: 'delete_submission',
        target_type: 'business',
        target_id: String(shop_id),
        details: { shop_name: business.shop_name },
      })

      return res.status(200).json({ message: 'Business deleted successfully' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
