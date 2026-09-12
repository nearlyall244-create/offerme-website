// ============================================================================
// OfferMe — Mock Business Listings
// Static sample data for category detail pages (frontend-only stage).
// ============================================================================

const MOCK_LISTINGS = [
  // ── Restaurant ────────────────────────────────────────────────────────
  {
    id: 'biz-001',
    name: 'Saravana Bhavan',
    category: 'restaurant',
    subcategory: 'veg',
    rating: 4.5,
    reviewCount: 320,
    address: '25, North Usman Road, T. Nagar, Chennai',
    description: 'Authentic South Indian vegetarian meals, tiffin, and sweets since 1981.',
    offers: ['20% off on weekend lunch', 'Free dessert on orders above ₹500'],
    openingTime: '07:00',
    closingTime: '22:30',
    isOpen: true,
  },
  {
    id: 'biz-002',
    name: 'Anjappar Chettinad',
    category: 'restaurant',
    subcategory: 'non-veg',
    rating: 4.3,
    reviewCount: 215,
    address: '18, Panagal Park, T. Nagar, Chennai',
    description: 'Chettinad-style non-veg specialities — biryani, chicken, and seafood.',
    offers: ['Flat ₹100 off on biryani combos'],
    openingTime: '11:00',
    closingTime: '23:00',
    isOpen: true,
  },
  {
    id: 'biz-003',
    name: 'Murugan Idli Shop',
    category: 'restaurant',
    subcategory: 'veg',
    rating: 4.6,
    reviewCount: 540,
    address: '42, South Usman Road, T. Nagar, Chennai',
    description: 'Famous for soft idlis, crispy dosas, and aromatic filter coffee.',
    offers: ['Buy 2 combo meals get 1 free coffee'],
    openingTime: '06:30',
    closingTime: '21:00',
    isOpen: true,
  },

  // ── Tea Shops ──────────────────────────────────────────────────────────
  {
    id: 'biz-004',
    name: 'Kumbakonam Degree Coffee',
    category: 'tea-shops',
    subcategory: null,
    rating: 4.4,
    reviewCount: 180,
    address: '7, Thyagaraya Nagar, Chennai',
    description: 'Traditional filter coffee and masala chai served fresh every day.',
    offers: ['₹10 off on filter coffee combos'],
    openingTime: '05:30',
    closingTime: '21:00',
    isOpen: true,
  },

  // ── Salons ─────────────────────────────────────────────────────────────
  {
    id: 'biz-005',
    name: 'Style Hub Men\'s Salon',
    category: 'salons',
    subcategory: 'men',
    rating: 4.2,
    reviewCount: 95,
    address: '14, Pondy Bazaar, T. Nagar, Chennai',
    description: 'Modern haircuts, beard grooming, and facials for men.',
    offers: ['Hair + Beard combo at ₹299'],
    openingTime: '09:00',
    closingTime: '21:00',
    isOpen: true,
  },
  {
    id: 'biz-006',
    name: 'Lakme Salon',
    category: 'salons',
    subcategory: 'women',
    rating: 4.5,
    reviewCount: 260,
    address: '32, North Usman Road, T. Nagar, Chennai',
    description: 'Premium beauty and hair services for women.',
    offers: ['Bridal package starting at ₹4999', '15% off on hair treatments'],
    openingTime: '10:00',
    closingTime: '20:00',
    isOpen: true,
  },

  // ── Mobile ─────────────────────────────────────────────────────────────
  {
    id: 'biz-007',
    name: 'Quick Fix Mobiles',
    category: 'mobile',
    subcategory: 'repair',
    rating: 4.1,
    reviewCount: 72,
    address: '5, Burma Bazaar, T. Nagar, Chennai',
    description: 'Screen replacement, battery repair, and software fixes for all brands.',
    offers: ['Free screen protector with any repair'],
    openingTime: '10:00',
    closingTime: '20:30',
    isOpen: true,
  },

  // ── Daily Essentials ───────────────────────────────────────────────────
  {
    id: 'biz-008',
    name: 'Reliance Fresh',
    category: 'daily-essentials',
    subcategory: 'supermarket',
    rating: 4.0,
    reviewCount: 190,
    address: '88, South Usman Road, T. Nagar, Chennai',
    description: 'Groceries, fresh produce, household items and daily needs under one roof.',
    offers: ['10% off on fresh vegetables every Wednesday'],
    openingTime: '08:00',
    closingTime: '22:00',
    isOpen: true,
  },

  // ── Medical ────────────────────────────────────────────────────────────
  {
    id: 'biz-009',
    name: 'Apollo Pharmacy',
    category: 'medical-shops',
    subcategory: null,
    rating: 4.3,
    reviewCount: 310,
    address: '12, Panagal Park, T. Nagar, Chennai',
    description: 'Trusted pharmacy with prescription medicines, wellness products, and health devices.',
    offers: ['Flat 15% off on first order'],
    openingTime: '07:00',
    closingTime: '23:00',
    isOpen: true,
  },

  // ── Event Bookings ─────────────────────────────────────────────────────
  {
    id: 'biz-010',
    name: 'CaptureX Photography',
    category: 'event-bookings',
    subcategory: 'photography-videography',
    rating: 4.7,
    reviewCount: 85,
    address: '20, Habibullah Road, T. Nagar, Chennai',
    description: 'Professional wedding, event and portrait photography & videography.',
    offers: ['Pre-wedding shoot free with wedding package'],
    openingTime: '09:00',
    closingTime: '20:00',
    isOpen: true,
  },

  // ── Cake Shops ─────────────────────────────────────────────────────────
  {
    id: 'biz-011',
    name: 'Cakewalk Bakery',
    category: 'cake-shops',
    subcategory: null,
    rating: 4.4,
    reviewCount: 150,
    address: '9, Thyagaraya Road, T. Nagar, Chennai',
    description: 'Custom cakes, pastries, cookies and desserts for every occasion.',
    offers: ['10% off on birthday cakes ordered 3 days in advance'],
    openingTime: '09:00',
    closingTime: '21:00',
    isOpen: true,
  },

  // ── Pet Shops ──────────────────────────────────────────────────────────
  {
    id: 'biz-012',
    name: 'Aqua World',
    category: 'pet-shops',
    subcategory: 'fish',
    rating: 4.2,
    reviewCount: 60,
    address: '3, Kodambakkam High Road, Chennai',
    description: 'Exotic and local fish varieties, tanks, accessories and fish food.',
    offers: ['Buy 5 fish get 1 free'],
    openingTime: '10:00',
    closingTime: '20:00',
    isOpen: true,
  },

  // ── Gift Shops ─────────────────────────────────────────────────────────
  {
    id: 'biz-013',
    name: 'Wrapped with Love',
    category: 'gift-shops',
    subcategory: 'packing',
    rating: 4.6,
    reviewCount: 45,
    address: '16, Ranganathan Street, T. Nagar, Chennai',
    description: 'Beautiful gift wrapping, hampers, and packing services.',
    offers: ['Free gift card with wrapping orders over ₹300'],
    openingTime: '10:00',
    closingTime: '20:00',
    isOpen: true,
  },

  // ── Juice Shops ────────────────────────────────────────────────────────
  {
    id: 'biz-014',
    name: 'Fresh Squeeze',
    category: 'juice-shops',
    subcategory: null,
    rating: 4.3,
    reviewCount: 120,
    address: '21, Usman Road, T. Nagar, Chennai',
    description: 'Freshly squeezed fruit juices, smoothies and milkshakes.',
    offers: ['Buy 2 get 1 free on all juices'],
    openingTime: '08:00',
    closingTime: '21:00',
    isOpen: true,
  },

  // ── Vehicles ───────────────────────────────────────────────────────────
  {
    id: 'biz-015',
    name: 'SpeedFix Auto Garage',
    category: 'vehicles',
    subcategory: 'repair',
    rating: 4.1,
    reviewCount: 88,
    address: '45, Arya Gowda Road, T. Nagar, Chennai',
    description: 'Trusted two-wheeler and four-wheeler repair, denting and painting.',
    offers: ['Free vehicle wash with any servicing'],
    openingTime: '08:00',
    closingTime: '19:00',
    isOpen: true,
  },

  // ── Learning ───────────────────────────────────────────────────────────
  {
    id: 'biz-016',
    name: 'Brilliant Academy',
    category: 'learning',
    subcategory: 'neet',
    rating: 4.5,
    reviewCount: 200,
    address: '30, GN Chetty Road, T. Nagar, Chennai',
    description: 'Top NEET coaching with experienced faculty and comprehensive study material.',
    offers: ['Early bird discount — 20% off for 2025 batch'],
    openingTime: '07:00',
    closingTime: '20:00',
    isOpen: true,
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────

/** Get listings for a category (and optionally a subcategory) */
export function getListingsByCategory(categorySlug, subcategorySlug = null) {
  return MOCK_LISTINGS.filter((listing) => {
    if (listing.category !== categorySlug) return false
    if (subcategorySlug && listing.subcategory !== subcategorySlug) return false
    return true
  })
}

/** Get all listings */
export function getAllListings() {
  return MOCK_LISTINGS
}

export default MOCK_LISTINGS
