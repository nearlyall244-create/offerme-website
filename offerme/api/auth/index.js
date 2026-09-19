export default async function handler(req, res) {
  try {
  const { action } = req.query

  if (action === 'get-profile') {
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

      const uid = authResult.decodedToken.uid
      const email = authResult.decodedToken.email

      const ADMIN_EMAILS = ['nearlyall244@gmail.com', 'delivery.adbricks@gmail.com']

      if (email && ADMIN_EMAILS.includes(email)) {
        let adminName = email.split('@')[0]

        const { data: adminRecordByFirebase } = await supabaseAdmin
          .from('admin_log')
          .select('name')
          .eq('firebase_uid', uid)
          .maybeSingle()

        if (adminRecordByFirebase?.name) {
          adminName = adminRecordByFirebase.name
        } else {
          const { data: adminRecordByAdmin } = await supabaseAdmin
            .from('admin_log')
            .select('name')
            .eq('admin_uid', uid)
            .maybeSingle()
          if (adminRecordByAdmin?.name) {
            adminName = adminRecordByAdmin.name
          }
        }

        return res.status(200).json({ role: 'admin', profile: { firebase_uid: uid, email, name: adminName } })
      }

      const { data: customer } = await supabaseAdmin
        .from('public_users')
        .select('*')
        .eq('firebase_uid', uid)
        .maybeSingle()

      if (customer) {
        // Firebase is the source of truth for an email address. This also syncs
        // the database only after Firebase has completed an email-change action.
        let profile = customer
        if (email && customer.email !== email) {
          const { data: syncedCustomer, error: syncError } = await supabaseAdmin
            .from('public_users')
            .update({ email, updated_at: new Date().toISOString() })
            .eq('id', customer.id)
            .select()
            .single()
          if (!syncError && syncedCustomer) profile = syncedCustomer
        }

        // Avatar objects live in a private bucket. Only this authenticated
        // profile response includes a short-lived URL for the image.
        if (profile.avatar_path) {
          const { data: signedAvatar } = await supabaseAdmin.storage
            .from('profile-avatars')
            .createSignedUrl(profile.avatar_path, 60 * 60)
          if (signedAvatar?.signedUrl) {
            profile = { ...profile, avatar_url: signedAvatar.signedUrl }
          }
        }

        return res.status(200).json({ role: 'customer', profile })
      }

      const { data: owner } = await supabaseAdmin
        .from('business_owners')
        .select('*')
        .eq('firebase_uid', uid)
        .maybeSingle()

      if (owner) {
        return res.status(200).json({ role: 'vendor', profile: owner })
      }

      return res.status(200).json({ role: null, profile: null })
    } catch (err) {
      console.error('[auth] get-profile error:', err)
      return res.status(500).json({ error: err.message || String(err) })
    }
  }

  if (action === 'update-profile') {
    if (req.method !== 'PUT' && req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }
    try {
      const { verifyToken } = await import('../_lib/verifyToken.js')
      const { supabaseAdmin } = await import('../_lib/supabaseAdmin.js')

      const authResult = await verifyToken(req)
      if (authResult.error) {
        return res.status(authResult.status).json({ error: authResult.error })
      }

      const uid = authResult.decodedToken.uid
      const email = authResult.decodedToken.email
      const body = req.body || {}
      const name = body.name || body.owner_name || body.businessName || body.shop_name || body.displayName

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' })
      }

      const trimmedName = name.trim()

      const ADMIN_EMAILS = ['nearlyall244@gmail.com', 'delivery.adbricks@gmail.com']
      const isAdmin = email && ADMIN_EMAILS.includes(email)

      const { data: owner } = await supabaseAdmin
        .from('business_owners')
        .select('*')
        .eq('firebase_uid', uid)
        .maybeSingle()

      if (owner) {
        const { data: updatedOwner, error: updateErr } = await supabaseAdmin
          .from('business_owners')
          .update({ owner_name: trimmedName, updated_at: new Date().toISOString() })
          .eq('id', owner.id)
          .select()
          .single()

        if (updateErr) {
          return res.status(500).json({ error: updateErr.message })
        }

        await supabaseAdmin
          .from('sell_your_bussiness')
          .update({ shop_name: trimmedName, updated_at: new Date().toISOString() })
          .eq('owner_id', owner.id)

        return res.status(200).json({ success: true, profile: updatedOwner })
      }

      const { data: customer } = await supabaseAdmin
        .from('public_users')
        .select('*')
        .eq('firebase_uid', uid)
        .maybeSingle()

      if (customer) {
        const phoneNumber = String(body.phone_number ?? body.phone ?? customer.phone_number ?? '').trim()
        const phoneDigits = phoneNumber.replace(/\D/g, '')
        const location = String(body.location ?? customer.location ?? '').trim()
        const bio = String(body.bio ?? customer.bio ?? '').trim()
        const avatarPath = body.avatar_path === undefined ? customer.avatar_path : body.avatar_path

        if (!/^\d{10}$/.test(phoneDigits)) {
          return res.status(400).json({ error: 'Phone number must contain exactly 10 digits' })
        }
        if (location.length > 120) {
          return res.status(400).json({ error: 'Location must be 120 characters or fewer' })
        }
        if (bio.length > 500) {
          return res.status(400).json({ error: 'Bio must be 500 characters or fewer' })
        }
        if (avatarPath !== null && avatarPath !== undefined && !String(avatarPath).startsWith(`${uid}/`)) {
          return res.status(400).json({ error: 'Invalid avatar path' })
        }

        const { data: updatedCustomer, error: updateCustErr } = await supabaseAdmin
          .from('public_users')
          .update({
            name: trimmedName,
            phone_number: phoneDigits,
            location: location || null,
            bio: bio || null,
            avatar_path: avatarPath || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customer.id)
          .select()
          .single()

        if (updateCustErr) {
          return res.status(500).json({ error: updateCustErr.message })
        }

        return res.status(200).json({ success: true, profile: updatedCustomer })
      }

      if (isAdmin) {
        const { data: existingByFirebase } = await supabaseAdmin
          .from('admin_log')
          .select('id')
          .eq('firebase_uid', uid)
          .maybeSingle()

        if (existingByFirebase) {
          const { error: updErr } = await supabaseAdmin
            .from('admin_log')
            .update({ name: trimmedName })
            .eq('id', existingByFirebase.id)
          if (updErr) return res.status(500).json({ error: updErr.message })
          return res.status(200).json({ success: true, profile: { firebase_uid: uid, email, name: trimmedName } })
        }

        const { data: existingByAdmin } = await supabaseAdmin
          .from('admin_log')
          .select('id')
          .eq('admin_uid', uid)
          .maybeSingle()

        if (existingByAdmin) {
          const { error: updErr } = await supabaseAdmin
            .from('admin_log')
            .update({ name: trimmedName })
            .eq('id', existingByAdmin.id)
          if (updErr) return res.status(500).json({ error: updErr.message })
          return res.status(200).json({ success: true, profile: { firebase_uid: uid, email, name: trimmedName } })
        }

        const { error: insErr } = await supabaseAdmin
          .from('admin_log')
          .insert({ firebase_uid: uid, admin_uid: uid, name: trimmedName, email })
        if (insErr) return res.status(500).json({ error: insErr.message })
        return res.status(200).json({ success: true, profile: { firebase_uid: uid, email, name: trimmedName } })
      }

      return res.status(404).json({ error: 'User profile not found' })
    } catch (err) {
      console.error('[auth] update-profile error:', err)
      return res.status(500).json({ error: err.message || String(err) })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (action === 'delete-account') {
    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' })
    }
    try {
      const { verifyToken } = await import('../_lib/verifyToken.js')
      const { supabaseAdmin } = await import('../_lib/supabaseAdmin.js')
      const { deleteFirebaseUser } = await import('../_lib/firebaseAdmin.js')

      const authResult = await verifyToken(req)
      if (authResult.error) {
        return res.status(authResult.status).json({ error: authResult.error })
      }

      const uid = authResult.decodedToken.uid

      const { data: customer } = await supabaseAdmin
        .from('public_users')
        .select('id, avatar_path')
        .eq('firebase_uid', uid)
        .maybeSingle()

      if (customer) {
        if (customer.avatar_path) {
          await supabaseAdmin.storage
            .from('profile-avatars')
            .remove([customer.avatar_path])
        }
        await supabaseAdmin.from('public_users').delete().eq('id', customer.id)
      }

      const { data: owner } = await supabaseAdmin
        .from('business_owners')
        .select('id')
        .eq('firebase_uid', uid)
        .maybeSingle()

      if (owner) {
        await supabaseAdmin.from('sell_your_bussiness').delete().eq('owner_id', owner.id)
        await supabaseAdmin.from('business_owners').delete().eq('id', owner.id)
      }

      await supabaseAdmin.from('admin_log').delete().eq('firebase_uid', uid)

      await deleteFirebaseUser(uid)

      return res.status(200).json({ success: true, message: 'Account deleted successfully.' })
    } catch (err) {
      console.error('[auth] delete-account error:', err)
      return res.status(500).json({ error: err.message || 'Failed to delete account.' })
    }
  }

  if (action === 'signup-customer') {
    try {
      const { verifyToken } = await import('../_lib/verifyToken.js')
      const { setCustomClaims } = await import('../_lib/firebaseAdmin.js')
      const { supabaseAdmin } = await import('../_lib/supabaseAdmin.js')

      const authResult = await verifyToken(req)
      if (authResult.error) {
        return res.status(authResult.status).json({ error: authResult.error })
      }

      const { decodedToken } = authResult
      const uid = decodedToken.uid
      const body = req.body || {}
      const { name, phone_number } = body

      const { data: existing, error: existErr } = await supabaseAdmin
        .from('public_users')
        .select('id')
        .eq('firebase_uid', uid)
        .maybeSingle()

      if (existErr) {
        return res.status(500).json({ error: `Lookup error: ${existErr.message}` })
      }

      if (existing) {
        return res.status(200).json({ message: 'Customer already exists', customer: existing })
      }

      const { data, error } = await supabaseAdmin
        .from('public_users')
        .insert({
          firebase_uid: uid,
          name: name || decodedToken.name || null,
          phone_number: phone_number || null,
          email: decodedToken.email || null,
        })
        .select()
        .single()

      if (error) {
        return res.status(500).json({ error: `Insert error: ${error.message}` })
      }

      try {
        await setCustomClaims(uid, { role: 'customer' })
      } catch (claimErr) {
        return res.status(201).json({
          message: 'Customer profile created (role claim pending)',
          customer: data,
          warning: claimErr.message,
        })
      }

      return res.status(201).json({ message: 'Customer profile created', customer: data })
    } catch (err) {
      console.error('[auth] signup-customer error:', err)
      return res.status(500).json({ error: err.message || String(err) })
    }
  }

  if (action === 'signup-vendor') {
    try {
      const { verifyToken } = await import('../_lib/verifyToken.js')
      const { setCustomClaims } = await import('../_lib/firebaseAdmin.js')
      const { supabaseAdmin } = await import('../_lib/supabaseAdmin.js')

      const authResult = await verifyToken(req)
      if (authResult.error) {
        return res.status(authResult.status).json({ error: authResult.error })
      }

      const { decodedToken } = authResult
      const uid = decodedToken.uid
      const body = req.body || {}
      const { shop_name, phone_number, email, address, category } = body

      if (!shop_name) {
        return res.status(400).json({ error: 'shop_name is required' })
      }

      const { data: existingOwner, error: existOwnerErr } = await supabaseAdmin
        .from('business_owners')
        .select('id')
        .eq('firebase_uid', uid)
        .maybeSingle()

      if (existOwnerErr) {
        return res.status(500).json({ error: `Lookup error: ${existOwnerErr.message}` })
      }

      let ownerId = existingOwner?.id

      if (!ownerId) {
        const { data: newOwner, error: ownerErr } = await supabaseAdmin
          .from('business_owners')
          .insert({
            firebase_uid: uid,
            owner_name: decodedToken.name || shop_name,
            email: email || decodedToken.email || null,
            phone_number: phone_number || null,
          })
          .select()
          .single()

        if (ownerErr) {
          return res.status(500).json({ error: `Owner insert error: ${ownerErr.message}` })
        }
        ownerId = newOwner.id
      }

      const { data: existingShop } = await supabaseAdmin
        .from('sell_your_bussiness')
        .select('id')
        .eq('owner_id', ownerId)
        .maybeSingle()

      if (existingShop) {
        return res.status(200).json({ message: 'Business already exists', shop: existingShop })
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

      const { data, error: bizInsertErr } = await supabaseAdmin
        .from('sell_your_bussiness')
        .insert({
          owner_id: ownerId,
          category_id: categoryId,
          shop_name,
          shop_address: address || null,
          enquiry_number: phone_number || null,
        })
        .select()
        .single()

      if (bizInsertErr) {
        console.error('[auth] sell_your_bussiness insert error:', bizInsertErr)
        return res.status(500).json({ error: `Insert error: ${bizInsertErr.message}` })
      }

      try {
        await setCustomClaims(uid, { role: 'vendor' })
      } catch (claimErr) {
        return res.status(201).json({
          message: 'Vendor business created (role claim pending)',
          shop: data,
          warning: claimErr.message,
        })
      }

      return res.status(201).json({ message: 'Vendor business created', shop: data })
    } catch (err) {
      console.error('[auth] signup-vendor error:', err)
      return res.status(500).json({ error: err.message || String(err) })
    }
  }

  return res.status(404).json({ error: `Unknown action: ${action}` })
  } catch (err) {
    console.error('[auth] outer error:', err)
    return res.status(500).json({ error: err.message || String(err) })
  }
}
