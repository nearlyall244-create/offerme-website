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
          .from('offers')
          .select('*, businesses(shop_name, business_owners(firebase_uid))', { count: 'exact' })

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

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
