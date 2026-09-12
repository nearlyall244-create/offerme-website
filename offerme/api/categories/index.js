export default async function handler(req, res) {
  try {
    const { supabaseAdmin } = await import('../_lib/supabaseAdmin.js')

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { group, slug, search } = req.query

    let query = supabaseAdmin
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (group) {
      query = query.eq('group_id', group)
    }

    if (slug) {
      query = query.eq('slug', slug).single()
      const { data, error } = await query
      if (error || !data) {
        return res.status(404).json({ error: 'Category not found' })
      }
      return res.status(200).json({ category: data })
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    let categories = data || []

    if (search) {
      const q = search.toLowerCase()
      categories = categories.filter((cat) => {
        const matchesCategory =
          cat.name.toLowerCase().includes(q) ||
          (cat.tagline && cat.tagline.toLowerCase().includes(q))
        const matchesSubcategory =
          cat.sub_categories &&
          Array.isArray(cat.sub_categories) &&
          cat.sub_categories.some((sub) => sub.name.toLowerCase().includes(q))
        return matchesCategory || matchesSubcategory
      })
    }

    const categoryGroups = [
      { id: 'food-dining', name: 'Food & Dining', icon: '🍽️', description: 'Restaurants, cafes, bakeries & street food' },
      { id: 'daily-needs', name: 'Daily Needs & Essentials', icon: '🛒', description: 'Groceries, supermarkets & second-hand marketplace' },
      { id: 'fashion-lifestyle', name: 'Fashion & Lifestyle', icon: '👗', description: 'Clothing, jewellery, gifts & accessories' },
      { id: 'beauty-wellness', name: 'Beauty & Wellness', icon: '✨', description: 'Salons, spas, cosmetics & grooming' },
      { id: 'electronics-tech', name: 'Electronics & IT Services', icon: '💻', description: 'Mobiles, computers, tech repair & digital services' },
      { id: 'home-living', name: 'Home, Decor & Furniture', icon: '🛋️', description: 'Furniture, interior decor & furnishings' },
      { id: 'repair-construction', name: 'Home Repair & Construction', icon: '🔨', description: 'Contractors, plumbing, electrical & building materials' },
      { id: 'healthcare-medical', name: 'Healthcare & Medical', icon: '🏥', description: 'Hospitals, clinics, doctors & pharmacies' },
      { id: 'automotive-transport', name: 'Automotive & Travel', icon: '🚗', description: 'Car & bike services, dealers, rentals & travel' },
      { id: 'education-career', name: 'Education & Jobs', icon: '🎓', description: 'Schools, colleges, coaching, training & jobs' },
      { id: 'sports-fitness', name: 'Sports & Fitness', icon: '🏋️', description: 'Gyms, fitness centres, academies & sports goods' },
      { id: 'events-creative', name: 'Events, Wedding & Creative', icon: '🎉', description: 'Event planning, mandapams, photography & video' },
      { id: 'business-finance', name: 'Business, Legal & Finance', icon: '💼', description: 'Lawyers, CAs, banking, insurance & industry' },
      { id: 'services-utilities', name: 'Services, Utilities & Security', icon: '⚡', description: 'Domestic help, laundry, courier, utilities & security' },
      { id: 'property-realestate', name: 'Real Estate & Property', icon: '🏡', description: 'Property buying, renting, plots & real estate services' },
      { id: 'family-community', name: 'Family, Pets & Community', icon: '🐾', description: 'Kids, pet care, astrology & government services' },
    ]

    return res.status(200).json({ categories, groups: categoryGroups })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
