import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import styles from './BusinessProfile.module.css'

export default function BusinessProfile() {
  const { userProfile, refreshProfile, getToken } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const existingName = userProfile?.shop_name || userProfile?.owner_name || userProfile?.displayName || ''

  const handleSave = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      const token = await getToken()
      const res = await fetch('/api/shops', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shop_id: userProfile?.id, shop_name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setEditing(false)
      setSaved(true)
      await refreshProfile()
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Business Information</h1>
      <div className={styles.card}>
        <div className={styles.field}>
          <label htmlFor="shopName">Business Name</label>
          <input
            id="shopName"
            type="text"
            placeholder={existingName || 'Enter your business name'}
            value={name}
            onChange={(e) => { setName(e.target.value); setSaved(false); setError('') }}
            disabled={!editing}
            className={!editing ? styles.disabledInput : ''}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {saved && <div className={styles.success}>Name saved successfully!</div>}

        <div className={styles.actions}>
          {!editing ? (
            <button type="button" className={styles.editBtn} onClick={() => setEditing(true)}>
              Edit
            </button>
          ) : (
            <>
              <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={loading || !name.trim()}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={() => { setEditing(false); setName(''); setError(''); setSaved(false) }}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
