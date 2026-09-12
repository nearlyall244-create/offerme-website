import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import SellYourbussiness from '@/pages/dashboard/sellyourbusiness/SellYourbussiness'
import { Plus, Tag, Calendar, MapPin, Phone, Trash2, Store, RefreshCw, Ticket } from 'lucide-react'
import styles from './BusinessPosts.module.css'

export default function BusinessPosts() {
  const { getToken } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      if (!token) {
        setLoading(false)
        return
      }

      const res = await fetch('/api/offers?mine=true', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load posts')
      setPosts(data.offers || [])
    } catch (err) {
      console.error('Fetch posts error:', err)
      setError(err.message || 'Failed to load your posts')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleDeletePost = async (offerId) => {
    if (!window.confirm('Are you sure you want to remove this post?')) return
    setDeletingId(offerId)
    try {
      const token = await getToken()
      const res = await fetch('/api/offers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ offer_id: offerId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete post')
      }
      setPosts((prev) => prev.filter((p) => p.id !== offerId))
    } catch (err) {
      alert(err.message || 'Failed to delete post')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Posts</h1>
          <p className={styles.subtitle}>Manage and publish your business listings & offers</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className={styles.addBtn}>
            <Plus size={18} />
            Sell Business
          </button>
        )}
      </div>

      {showForm ? (
        <div className={styles.formWrapper}>
          <SellYourbussiness
            embedded
            onSuccess={() => {
              setShowForm(false)
              fetchPosts()
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <>
          {loading ? (
            <div className={styles.loadingState}>
              <RefreshCw className={styles.spinIcon} size={24} />
              <p>Loading your posts...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button onClick={fetchPosts} className={styles.retryBtn}>Retry</button>
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.empty}>
              <Store size={48} className={styles.emptyIcon} />
              <h3>No posts published yet</h3>
              <p>Sell your business to reach local customers on OfferMe.</p>
              <button onClick={() => setShowForm(true)} className={styles.emptyAddBtn}>
                <Plus size={18} />
                Sell Business
              </button>
            </div>
          ) : (

            <div className={styles.postGrid}>
              {posts.map((post) => {
                const isExpired = post.valid_until && new Date(post.valid_until) < new Date()
                const discount = post.discount_percent || post.discount_value

                return (
                  <div key={post.id} className={styles.postCard}>
                    {post.image_url && (
                      <div className={styles.cardImageWrapper}>
                        <img src={post.image_url} alt={post.title} className={styles.cardImage} />
                        {discount && (
                          <span className={styles.discountBadge}>{discount}% OFF</span>
                        )}
                      </div>
                    )}

                    <div className={styles.cardBody}>
                      <div className={styles.cardHeader}>
                        <div>
                          <span className={styles.shopName}>
                            {post.businesses?.shop_name || 'My Business'}
                          </span>
                          <h3 className={styles.postTitle}>{post.title}</h3>
                        </div>
                        <span
                          className={`${styles.statusBadge} ${
                            isExpired ? styles.statusExpired : styles.statusActive
                          }`}
                        >
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </div>

                      {post.description && (
                        <p className={styles.cardDescription}>{post.description}</p>
                      )}

                      <div className={styles.cardDetails}>
                        {post.businesses?.shop_address && (
                          <div className={styles.detailItem}>
                            <MapPin size={14} />
                            <span>{post.businesses.shop_address}</span>
                          </div>
                        )}
                        {post.businesses?.enquiry_number && (
                          <div className={styles.detailItem}>
                            <Phone size={14} />
                            <span>{post.businesses.enquiry_number}</span>
                          </div>
                        )}
                        {post.valid_until && (
                          <div className={styles.detailItem}>
                            <Calendar size={14} />
                            <span>Expires: {new Date(post.valid_until).toLocaleDateString()}</span>
                          </div>
                        )}
                        {post.coupon_code && (
                          <div className={styles.couponTag}>
                            <Tag size={12} />
                            <span>CODE: {post.coupon_code}</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.prices}>
                          {post.offer_price && (
                            <span className={styles.offerPrice}>₹{post.offer_price}</span>
                          )}
                          {post.original_price && (
                            <span className={styles.originalPrice}>₹{post.original_price}</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingId === post.id}
                          title="Remove Post"
                        >
                          <Trash2 size={16} />
                          {deletingId === post.id ? 'Removing...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
