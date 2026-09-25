import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Trash2, Store, RefreshCw, Tag, Calendar, MapPin, Phone, CheckCircle } from 'lucide-react'
import SuccessModal from '@/components/shared/SuccessModal'
import DateInput from '@/components/shared/DateInput'
import styles from './ViewPosts.module.css'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function ViewPosts() {
  const { getToken } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [categories, setCategories] = useState([])
  const [editErrors, setEditErrors] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      if (!token) { setLoading(false); return }
      const res = await fetch('/api/offers?mine=true&listing_type=sell-business', {
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

  useEffect(() => { requestAnimationFrame(() => { fetchPosts() }) }, [fetchPosts])

  useEffect(() => {
    let cancelled = false
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (!cancelled && res.ok) setCategories(data.categories || [])
      } catch { /* silent */ }
    }
    loadCategories()
    return () => { cancelled = true }
  }, [])

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === editForm.mainCategory) || null,
    [categories, editForm.mainCategory]
  )

  const subcategories = useMemo(() => selectedCategory?.sub_categories || [], [selectedCategory])

  const handleDeletePost = async (offerId) => {
    if (!window.confirm('Are you sure you want to remove this post?')) return
    setDeletingId(offerId)
    try {
      const token = await getToken()
      const res = await fetch('/api/offers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  const startEditing = (post) => {
    setEditingId(post.id)
    setEditErrors({})
    setImageFile(null)
    setImagePreview(post.businesses?.shop_image_url || post.image_url || '')
    setEditForm({
      title: post.title || '',
      shopName: post.businesses?.shop_name || '',
      shopEmail: post.businesses?.business_email || '',
      enquiryNumber: post.businesses?.enquiry_number || '',
      mainCategory: post.businesses?.category_id || '',
      subcategory: post.businesses?.subcategory_id || '',
      shopAddress: post.businesses?.shop_address || '',
      shopDescription: post.businesses?.shop_description || '',
      openingTime: post.businesses?.opening_time || '',
      closingTime: post.businesses?.closing_time || '',
      discountPercentage: post.discount_percent ? String(post.discount_percent) : '',
      couponCode: post.coupon_code || '',
      validFrom: post.valid_from ? String(post.valid_from).split('T')[0] : '',
      validUntil: post.valid_until ? String(post.valid_until).split('T')[0] : '',
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({})
    setImageFile(null)
    setImagePreview('')
    setEditErrors({})
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
    if (editErrors[name]) {
      setEditErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      setEditErrors((prev) => ({ ...prev, image: 'Please select a JPG, PNG, or WebP image.' }))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setEditErrors((prev) => ({ ...prev, image: 'Image must be smaller than 5MB.' }))
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setEditErrors((prev) => { const n = { ...prev }; delete n.image; return n })
  }

  const validateEdit = () => {
    const errs = {}
    if (!editForm.shopName?.trim()) errs.shopName = 'Shop name is required.'
    else if (editForm.shopName.trim().length < 3) errs.shopName = 'Must be at least 3 characters.'
    if (!editForm.shopEmail?.trim()) errs.shopEmail = 'Shop email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.shopEmail.trim())) errs.shopEmail = 'Enter a valid email.'
    if (!editForm.enquiryNumber?.trim()) errs.enquiryNumber = 'Phone number is required.'
    else {
      const digits = editForm.enquiryNumber.replace(/\D/g, '')
      if (digits.length !== 10 || !/^[6-9]\d{9}$/.test(digits)) errs.enquiryNumber = 'Enter a valid 10-digit Indian number.'
    }
    if (!editForm.mainCategory) errs.mainCategory = 'Select a category.'
    if (!editForm.subcategory) errs.subcategory = 'Select a subcategory.'
    if (!editForm.shopAddress?.trim()) errs.shopAddress = 'Address is required.'
    else if (editForm.shopAddress.trim().length < 10) errs.shopAddress = 'Enter at least 10 characters.'
    if (!editForm.shopDescription?.trim()) errs.shopDescription = 'Description is required.'
    else if (editForm.shopDescription.trim().length < 10) errs.shopDescription = 'Enter at least 10 characters.'
    if (!editForm.title?.trim()) errs.title = 'Title is required.'
    if (!editForm.validFrom) errs.validFrom = 'Valid from date is required.'
    else if (editForm.validUntil && editForm.validFrom > editForm.validUntil) {
      errs.validFrom = 'Valid from cannot be after valid until.'
    }
    return errs
  }

  const handleSave = async (post) => {
    const errs = validateEdit()
    setEditErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    try {
      const token = await getToken()
      if (!token) throw new Error('Authentication required.')

      let uploadedImageUrl = imagePreview || null
      if (imageFile) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(imageFile)
        })
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ file: base64, fileName: imageFile.name, fileType: imageFile.type }),
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Image upload failed')
        uploadedImageUrl = uploadData.url
      }

      const payload = {
        offer_id: post.id,
        title: editForm.title.trim(),
        description: editForm.shopDescription.trim(),
        shopName: editForm.shopName.trim(),
        shopAddress: editForm.shopAddress.trim(),
        phoneNumber: editForm.enquiryNumber.trim(),
        businessEmail: editForm.shopEmail.trim(),
        businessCategory: editForm.mainCategory,
        businessSubcategory: editForm.subcategory,
        openingTime: editForm.openingTime,
        closingTime: editForm.closingTime,
        imageUrl: uploadedImageUrl,
        discountPercentage: editForm.discountPercentage ? Number(editForm.discountPercentage) : null,
        couponCode: editForm.couponCode,
        valid_from: editForm.validFrom,
        valid_until: editForm.validUntil || null,
      }

      const res = await fetch('/api/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update post')

      setPosts((prev) => prev.map((p) =>
        p.id === post.id
          ? {
            ...p,
            title: payload.title,
            description: payload.description,
            image_url: uploadedImageUrl,
            discount_percent: payload.discountPercentage,
            coupon_code: payload.couponCode,
            valid_from: payload.valid_from,
            valid_until: payload.valid_until,
            businesses: {
              ...p.businesses,
              shop_name: payload.shopName,
              shop_address: payload.shopAddress,
              enquiry_number: payload.phoneNumber,
              business_email: payload.businessEmail,
              category_id: payload.businessCategory,
              subcategory_id: payload.businessSubcategory,
              shop_description: payload.shopDescription,
              shop_image_url: uploadedImageUrl,
              opening_time: payload.openingTime,
              closing_time: payload.closingTime,
              status: 'pending',
            },
          }
          : p
      ))
      cancelEditing()
      setShowSuccess(true)
    } catch (err) {
      alert(err.message || 'Failed to update post')
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (post) => {
    const status = post.businesses?.status || (post.is_active ? 'approved' : 'pending')
    if (status === 'approved') return <span className={`${styles.statusBadge} ${styles.statusActive}`}>Active</span>
    if (status === 'pending') return <span className={`${styles.statusBadge} ${styles.statusPending}`}>Pending Approval</span>
    if (status === 'rejected') return <span className={`${styles.statusBadge} ${styles.statusRejected}`}>Rejected</span>
    return <span className={`${styles.statusBadge} ${styles.statusExpired}`}>{status}</span>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>View Posts</h1>
          <p className={styles.subtitle}>View and manage your business listing posts</p>
        </div>
        <Link to="/sell-your-business" className={styles.addBtn}>
          <Plus size={18} />
          New Post
        </Link>
      </div>

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
          <p>No posts yet.</p>
        </div>
      ) : (
        <div className={styles.postGrid}>
          {posts.map((post) => {
            const isEditing = editingId === post.id
            const isExpired = post.valid_until && new Date(post.valid_until) < new Date()
            const discount = post.discount_percent || post.discount_value
            const imageToShow = isEditing ? imagePreview : (post.businesses?.shop_image_url || post.image_url)

            return (
              <div key={post.id} className={`${styles.postCard} ${isEditing ? styles.editingCard : ''}`}>
                {isEditing ? (
                  <div className={styles.editForm}>
                    <div className={styles.editSection}>
                      <h3 className={styles.editSectionTitle}>Business Details</h3>
                      <div className={styles.editRow}>
                        <div className={styles.editField}>
                          <label>Shop Name *</label>
                          <input name="shopName" type="text" value={editForm.shopName} onChange={handleEditChange} className={`${styles.editInput} ${editErrors.shopName ? styles.fieldError : ''}`} />
                          {editErrors.shopName && <span className={styles.errorText}>{editErrors.shopName}</span>}
                        </div>
                        <div className={styles.editField}>
                          <label>Shop Email *</label>
                          <input name="shopEmail" type="email" value={editForm.shopEmail} onChange={handleEditChange} className={`${styles.editInput} ${editErrors.shopEmail ? styles.fieldError : ''}`} />
                          {editErrors.shopEmail && <span className={styles.errorText}>{editErrors.shopEmail}</span>}
                        </div>
                      </div>
                      <div className={styles.editRow}>
                        <div className={styles.editField}>
                          <label>Phone Number *</label>
                          <input name="enquiryNumber" type="tel" value={editForm.enquiryNumber} onChange={handleEditChange} className={`${styles.editInput} ${editErrors.enquiryNumber ? styles.fieldError : ''}`} />
                          {editErrors.enquiryNumber && <span className={styles.errorText}>{editErrors.enquiryNumber}</span>}
                        </div>
                        <div className={styles.editField}>
                          <label>Category *</label>
                          <select name="mainCategory" value={editForm.mainCategory} onChange={handleEditChange} className={`${styles.editInput} ${editErrors.mainCategory ? styles.fieldError : ''}`}>
                            <option value="">Select category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          {editErrors.mainCategory && <span className={styles.errorText}>{editErrors.mainCategory}</span>}
                        </div>
                      </div>
                      <div className={styles.editRow}>
                        <div className={styles.editField}>
                          <label>Subcategory *</label>
                          <select name="subcategory" value={editForm.subcategory} onChange={handleEditChange} className={`${styles.editInput} ${editErrors.subcategory ? styles.fieldError : ''}`} disabled={!editForm.mainCategory}>
                            <option value="">Select subcategory</option>
                            {subcategories.map((s) => <option key={s.id || s.slug} value={s.id || s.slug}>{s.name}</option>)}
                          </select>
                          {editErrors.subcategory && <span className={styles.errorText}>{editErrors.subcategory}</span>}
                        </div>
                        <div className={styles.editField}>
                          <label>Address *</label>
                          <input name="shopAddress" type="text" value={editForm.shopAddress} onChange={handleEditChange} className={`${styles.editInput} ${editErrors.shopAddress ? styles.fieldError : ''}`} />
                          {editErrors.shopAddress && <span className={styles.errorText}>{editErrors.shopAddress}</span>}
                        </div>
                      </div>
                      <div className={styles.editRow}>
                        <div className={styles.editField}>
                          <label>Opening Time</label>
                          <input name="openingTime" type="time" value={editForm.openingTime} onChange={handleEditChange} className={styles.editInput} />
                        </div>
                        <div className={styles.editField}>
                          <label>Closing Time</label>
                          <input name="closingTime" type="time" value={editForm.closingTime} onChange={handleEditChange} className={styles.editInput} />
                        </div>
                      </div>
                      <div className={styles.editField}>
                        <label>Shop Description *</label>
                        <textarea name="shopDescription" rows={3} value={editForm.shopDescription} onChange={handleEditChange} className={`${styles.editTextarea} ${editErrors.shopDescription ? styles.fieldError : ''}`} />
                        {editErrors.shopDescription && <span className={styles.errorText}>{editErrors.shopDescription}</span>}
                      </div>
                    </div>

                    <div className={styles.editSection}>
                      <h3 className={styles.editSectionTitle}>Offer Details</h3>
                      <div className={styles.editRow}>
                        <div className={styles.editField}>
                          <label>Title *</label>
                          <input name="title" type="text" value={editForm.title} onChange={handleEditChange} className={`${styles.editInput} ${editErrors.title ? styles.fieldError : ''}`} />
                          {editErrors.title && <span className={styles.errorText}>{editErrors.title}</span>}
                        </div>
                        <div className={styles.editField}>
                          <label>Coupon Code</label>
                          <input name="couponCode" type="text" value={editForm.couponCode} onChange={handleEditChange} className={styles.editInput} />
                        </div>
                      </div>
                      <div className={styles.editRow}>
                        <div className={styles.editField}>
                          <label>Discount %</label>
                          <input name="discountPercentage" type="number" min="1" max="100" value={editForm.discountPercentage} onChange={handleEditChange} className={styles.editInput} />
                        </div>
                        <div className={styles.editField}>
                          <label>Valid From *</label>
                          <DateInput
                            name="validFrom"
                            value={editForm.validFrom}
                            onChange={handleEditChange}
                            placeholder="Select valid from date"
                            required
                            className={`${styles.editInput} ${editErrors.validFrom ? styles.fieldError : ''}`}
                          />
                          {editErrors.validFrom && <span className={styles.errorText}>{editErrors.validFrom}</span>}
                        </div>
                      </div>
                      <div className={styles.editRow}>
                        <div className={styles.editField}>
                          <label>Valid Until</label>
                          <input name="validUntil" type="date" value={editForm.validUntil} onChange={handleEditChange} className={styles.editInput} min={editForm.validFrom || undefined} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.editSection}>
                      <h3 className={styles.editSectionTitle}>Shop Image</h3>
                      <div className={styles.imageUploadArea}>
                        {imagePreview ? (
                          <div className={styles.imagePreviewWrap}>
                            <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                            <button type="button" className={styles.removeImageBtn} onClick={() => { setImageFile(null); setImagePreview(''); if (fileInputRef.current) fileInputRef.current.value = '' }}>Remove</button>
                          </div>
                        ) : (
                          <label className={styles.imageUploadLabel}>
                            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleImageChange} className={styles.imageUploadInput} />
                            <span className={styles.imageUploadText}>Click to upload image</span>
                          </label>
                        )}
                      </div>
                      {editErrors.image && <span className={styles.errorText}>{editErrors.image}</span>}
                    </div>

                    <div className={styles.editActions}>
                      <button onClick={() => handleSave(post)} disabled={saving} className={styles.saveBtn}>
                        {saving ? 'Saving...' : 'Save & Submit for Approval'}
                      </button>
                      <button onClick={cancelEditing} disabled={saving} className={styles.cancelBtn}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {imageToShow && (
                      <div className={styles.cardImageWrapper}>
                        <img src={imageToShow} alt={post.title} className={styles.cardImage} />
                        {discount && <span className={styles.discountBadge}>{discount}% OFF</span>}
                      </div>
                    )}
                    <div className={styles.cardBody}>
                      <div className={styles.cardHeader}>
                        <div>
                          <span className={styles.shopName}>{post.businesses?.shop_name || 'My Business'}</span>
                          <h3 className={styles.postTitle}>{post.title}</h3>
                        </div>
                        {getStatusBadge(post)}
                      </div>
                      {post.businesses?.shop_description && (
                        <p className={styles.cardDescription}>{post.businesses.shop_description}</p>
                      )}
                      <div className={styles.cardDetails}>
                        {post.businesses?.category_id && (
                          <div className={styles.detailItem}>
                            <Tag size={14} />
                            <span>{post.businesses.category_id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                          </div>
                        )}
                        {post.businesses?.subcategory_id && (
                          <div className={styles.detailItem}>
                            <Tag size={14} />
                            <span>{post.businesses.subcategory_id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                          </div>
                        )}
                        {post.businesses?.business_email && (
                          <div className={styles.detailItem}>
                            <span>{post.businesses.business_email}</span>
                          </div>
                        )}
                        {post.businesses?.enquiry_number && (
                          <div className={styles.detailItem}>
                            <Phone size={14} />
                            <span>{post.businesses.enquiry_number}</span>
                          </div>
                        )}
                        {post.businesses?.shop_address && (
                          <div className={styles.detailItem}>
                            <MapPin size={14} />
                            <span>{post.businesses.shop_address}</span>
                          </div>
                        )}
                        {post.valid_from && (
                          <div className={styles.detailItem}>
                            <Calendar size={14} />
                            <span>Valid from: {new Date(post.valid_from).toLocaleDateString()}</span>
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
                          {post.discount_value && <span className={styles.offerPrice}>₹{post.discount_value}</span>}
                          {post.discount_percent && <span className={styles.originalPrice}>{post.discount_percent}% OFF</span>}
                        </div>
                        <div className={styles.cardActions}>
                          <button onClick={() => startEditing(post)} className={styles.editBtn}>Edit</button>
                          <button onClick={() => handleDeletePost(post.id)} disabled={deletingId === post.id} className={styles.deleteBtn}>
                            <Trash2 size={14} />
                            {deletingId === post.id ? 'Removing...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
      <SuccessModal
        open={showSuccess}
        icon={<CheckCircle size={48} />}
        title="Changes Submitted Successfully!"
        message={
          <>
            Dear Partner, Please wait. Your post will become active once it has been approved.
            <br />
            Thank you for your patience!
          </>
        }
        onClose={() => setShowSuccess(false)}
      />
    </div>
  )
}
