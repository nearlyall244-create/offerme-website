export const firestoreService = {
  COLLECTIONS: {
    USERS: 'users',
    BUSINESSES: 'businesses',
    LISTINGS: 'listings',
    COMMENTS: 'comments',
    FAVORITES: 'favorites',
    LIKES: 'likes',
    REVIEWS: 'reviews',
    VISITS: 'visits',
  },

  async createDocument(collectionName, data) {
    const items = JSON.parse(localStorage.getItem(`demo_${collectionName}`) || '[]')
    const id = 'doc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
    const doc = { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    items.push(doc)
    localStorage.setItem(`demo_${collectionName}`, JSON.stringify(items))
    return id
  },

  async getDocument(collectionName, docId) {
    const items = JSON.parse(localStorage.getItem(`demo_${collectionName}`) || '[]')
    return items.find((d) => d.id === docId) || null
  },

  async updateDocument(collectionName, docId, data) {
    const items = JSON.parse(localStorage.getItem(`demo_${collectionName}`) || '[]')
    const idx = items.findIndex((d) => d.id === docId)
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() }
      localStorage.setItem(`demo_${collectionName}`, JSON.stringify(items))
    }
  },

  async deleteDocument(collectionName, docId) {
    const items = JSON.parse(localStorage.getItem(`demo_${collectionName}`) || '[]')
    const filtered = items.filter((d) => d.id !== docId)
    localStorage.setItem(`demo_${collectionName}`, JSON.stringify(filtered))
  },

  async queryDocuments(collectionName, conditions = []) {
    const items = JSON.parse(localStorage.getItem(`demo_${collectionName}`) || '[]')
    return items.filter((doc) => {
      return conditions.every(([field, op, value]) => {
        if (op === '==') return doc[field] === value
        return true
      })
    }).reverse()
  },

  subscribeToCollection(collectionName, conditions = [], callback) {
    const items = JSON.parse(localStorage.getItem(`demo_${collectionName}`) || '[]')
    const filtered = items.filter((doc) => {
      return conditions.every(([field, op, value]) => {
        if (op === '==') return doc[field] === value
        return true
      })
    }).reverse()
    setTimeout(() => callback(filtered), 0)
    return () => {}
  },

  async incrementField(collectionName, docId, fieldName, amount = 1) {
    const items = JSON.parse(localStorage.getItem(`demo_${collectionName}`) || '[]')
    const idx = items.findIndex((d) => d.id === docId)
    if (idx !== -1) {
      items[idx][fieldName] = (items[idx][fieldName] || 0) + amount
      items[idx].updatedAt = new Date().toISOString()
      localStorage.setItem(`demo_${collectionName}`, JSON.stringify(items))
    }
  },

  async addFavorite(userId, listingId) {
    const key = 'demo_favorites'
    const items = JSON.parse(localStorage.getItem(key) || '[]')
    const existing = items.find((f) => f.userId === userId && f.listingId === listingId)
    if (existing) {
      localStorage.setItem(key, JSON.stringify(items.filter((f) => f !== existing)))
      return false
    }
    items.push({ userId, listingId, createdAt: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(items))
    return true
  },

  async addLike(userId, listingId) {
    const key = 'demo_likes'
    const items = JSON.parse(localStorage.getItem(key) || '[]')
    const existing = items.find((l) => l.userId === userId && l.listingId === listingId)
    if (existing) {
      localStorage.setItem(key, JSON.stringify(items.filter((l) => l !== existing)))
      return false
    }
    items.push({ userId, listingId, createdAt: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(items))
    return true
  },

  async recordVisit(userId, listingId) {
    const items = JSON.parse(localStorage.getItem('demo_visits') || '[]')
    items.push({ userId, listingId, visitedAt: new Date().toISOString() })
    localStorage.setItem('demo_visits', JSON.stringify(items))
  },
}
