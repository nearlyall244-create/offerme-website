import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, Eye, EyeOff, Loader2, Lock, Trash2, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import styles from '@/pages/dashboard/Profile.module.css'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function initialProfile(profile) {
  return {
    name: profile?.displayName || profile?.name || '',
    phone_number: profile?.phone_number || profile?.phone || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
  }
}

export default function UserProfile() {
  const { userProfile, updateProfile, refreshProfile, getToken } = useAuth()
  const [form, setForm] = useState(() => initialProfile(userProfile))
  const [original, setOriginal] = useState(() => initialProfile(userProfile))
  const [status, setStatus] = useState({ type: '', message: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  /* ── password modal ── */
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pwForm, setPwForm] = useState({ newPw: '', confirm: '' })
  const [pwStatus, setPwStatus] = useState({ type: '', message: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false })

  const fileInputRef = useRef(null)

  /* ── unsaved changes guard ── */
  const isDirty = JSON.stringify(form) !== JSON.stringify(original)

  useEffect(() => {
    if (!isDirty) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  useEffect(() => {
    const next = initialProfile(userProfile)
    setForm(next)
    setOriginal(next)
  }, [userProfile])

  const avatarUrl = userProfile?.avatar_url || ''
  const displayName = form.name || userProfile?.displayName || 'User'
  const setField = (field, value) => {
    setForm((c) => ({ ...c, [field]: value }))
    setStatus({ type: '', message: '' })
  }

  /* ── validation ── */
  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.'
    if (!/^\d{10}$/.test(form.phone_number.replace(/\D/g, ''))) return 'Phone number must contain exactly 10 digits.'
    if (form.location.trim().length > 120) return 'Location must be 120 characters or fewer.'
    if (form.bio.trim().length > 500) return 'Bio must be 500 characters or fewer.'
    return ''
  }

  /* ── save profile ── */
  const handleSave = async (e) => {
    e.preventDefault()
    const error = validate()
    if (error) return setStatus({ type: 'error', message: error })
    setSaving(true)
    setStatus({ type: '', message: '' })
    try {
      await updateProfile({
        name: form.name.trim(),
        displayName: form.name.trim(),
        phone_number: form.phone_number.replace(/\D/g, ''),
        location: form.location.trim(),
        bio: form.bio.trim(),
      })
      setOriginal({ ...form })
      setStatus({ type: 'success', message: 'Profile saved successfully.' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Unable to save your profile.' })
    } finally {
      setSaving(false)
    }
  }

  /* ── avatar helpers ── */
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = () => reject(new Error('Unable to read the selected image.'))
    reader.readAsDataURL(file)
  })

  const handleAvatarSelect = async (file) => {
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) return setStatus({ type: 'error', message: 'Choose a JPG, PNG, or WebP image.' })
    if (file.size > MAX_FILE_SIZE) return setStatus({ type: 'error', message: 'Image must be smaller than 5 MB.' })
    setUploading(true)
    setStatus({ type: '', message: '' })
    try {
      const token = await getToken()
      const res = await fetch('/api/profile-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ file: await toBase64(file), fileName: file.name, fileType: file.type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to upload the image.')
      await refreshProfile()
      setStatus({ type: 'success', message: 'Profile photo updated.' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Unable to upload the image.' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeAvatar = async () => {
    setUploading(true)
    setStatus({ type: '', message: '' })
    try {
      const token = await getToken()
      const res = await fetch('/api/profile-avatar', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to remove the image.')
      await refreshProfile()
      setStatus({ type: 'success', message: 'Profile photo removed.' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Unable to remove the image.' })
    } finally {
      setUploading(false)
    }
  }

  /* ── change password ── */
  const pwValidate = () => {
    if (pwForm.newPw.length < 8) return 'New password must be at least 8 characters.'
    if (pwForm.newPw !== pwForm.confirm) return 'Passwords do not match.'
    return ''
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    const error = pwValidate()
    if (error) return setPwStatus({ type: 'error', message: error })
    setPwSaving(true)
    setPwStatus({ type: '', message: '' })
    try {
      await authService.changePassword(pwForm.newPw)
      setPwStatus({ type: 'success', message: 'Password updated successfully.' })
      setPwForm({ newPw: '', confirm: '' })
      setTimeout(() => setShowPasswordModal(false), 1500)
    } catch (err) {
      setPwStatus({ type: 'error', message: err.message || 'Unable to change password.' })
    } finally {
      setPwSaving(false)
    }
  }

  const openPasswordModal = useCallback(() => {
    setPwForm({ newPw: '', confirm: '' })
    setPwStatus({ type: '', message: '' })
    setShowPasswordModal(true)
  }, [])

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Profile</h1>
      <p className={styles.subtitle}>Your contact details stay private and are never displayed on public listings.</p>

      {/* ── Header card ── */}
      <div className={styles.headerCard}>
        <div className={styles.avatarWrap} onClick={() => !uploading && fileInputRef.current?.click()} title="Click to change photo">
          {avatarUrl ? <img src={avatarUrl} alt="Your profile" className={styles.avatarImage} /> : displayName.trim()[0].toUpperCase()}
          <div className={styles.avatarOverlay}>
            <Camera size={20} />
            {uploading ? 'Uploading…' : 'Change'}
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className={styles.visuallyHidden} onChange={(ev) => handleAvatarSelect(ev.target.files?.[0])} />
        <div className={styles.headerInfo}>
          <h2 className={styles.name}>{displayName}</h2>
          <p className={styles.email}>{userProfile?.email || 'No email address available'}</p>
          <span className={styles.roleBadge}>User</span>
          <div className={styles.headerActions}>
            {avatarUrl && (
              <button type="button" className={styles.btnDanger} onClick={removeAvatar} disabled={uploading}>
                <Trash2 size={14} /> Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      {status.message && (
        <p className={status.type === 'error' ? styles.errorMessage : styles.successMessage} role="status">{status.message}</p>
      )}

      {/* ── Personal info ── */}
      <form onSubmit={handleSave} noValidate>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Personal Information</h3>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="name">Full Name <span aria-hidden="true">*</span></label>
              <input id="name" value={form.name} onChange={(ev) => setField('name', ev.target.value)} autoComplete="name" />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Email address</label>
              <input id="email" value={userProfile?.email || ''} readOnly aria-readonly="true" />
              <span className={styles.hint}>Email is linked to your Firebase account and cannot be changed here.</span>
            </div>
            <div className={styles.field}>
              <label htmlFor="phone">Phone number <span aria-hidden="true">*</span></label>
              <input id="phone" inputMode="numeric" value={form.phone_number} onChange={(ev) => setField('phone_number', ev.target.value)} placeholder="10-digit phone number" autoComplete="tel" />
            </div>
            <div className={styles.field}>
              <label htmlFor="location">Location</label>
              <input id="location" value={form.location} onChange={(ev) => setField('location', ev.target.value)} maxLength={120} placeholder="City or neighbourhood" autoComplete="address-level2" />
            </div>
          </div>
        </div>

        {/* ── About ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>About</h3>
          <div className={styles.fields}>
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="bio">Bio</label>
                <span className={styles.characterCount}>{form.bio.length}/500</span>
              </div>
              <textarea id="bio" rows={4} value={form.bio} onChange={(ev) => setField('bio', ev.target.value)} maxLength={500} placeholder="Tell us a little about yourself" />
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className={styles.actions}>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
            {saving && <Loader2 size={16} className={styles.spinner} />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnIcon}`} onClick={openPasswordModal}>
            <Lock size={15} /> Change password
          </button>
        </div>
      </form>

      {/* ── Change Password Modal ── */}
      {showPasswordModal && (
        <div className={styles.modalBackdrop} role="presentation">
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="pw-modal-title">
            <button type="button" className={styles.closeBtn} onClick={() => setShowPasswordModal(false)} aria-label="Close"><X size={18} /></button>
            <h2 id="pw-modal-title">Change Password</h2>
            <p>Enter your current password and choose a new one.</p>
            <form onSubmit={handlePasswordChange} className={styles.modalForm}>
              <div className={styles.field}>
                <label htmlFor="pw-new">New password (min 8 characters)</label>
                <div className={styles.pwInputWrap}>
                  <input id="pw-new" type={showPw.newPw ? 'text' : 'password'} value={pwForm.newPw} onChange={(ev) => setPwForm((c) => ({ ...c, newPw: ev.target.value }))} autoComplete="new-password" required minLength={8} />
                  <button type="button" className={styles.pwToggle} onClick={() => setShowPw((s) => ({ ...s, newPw: !s.newPw }))} tabIndex={-1} aria-label={showPw.newPw ? 'Hide password' : 'Show password'}>
                    {showPw.newPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="pw-confirm">Confirm new password</label>
                <div className={styles.pwInputWrap}>
                  <input id="pw-confirm" type={showPw.confirm ? 'text' : 'password'} value={pwForm.confirm} onChange={(ev) => setPwForm((c) => ({ ...c, confirm: ev.target.value }))} autoComplete="new-password" required />
                  <button type="button" className={styles.pwToggle} onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))} tabIndex={-1} aria-label={showPw.confirm ? 'Hide password' : 'Show password'}>
                    {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {pwStatus.message && (
                <p className={pwStatus.type === 'error' ? styles.errorMessage : styles.successMessage} role="status">{pwStatus.message}</p>
              )}
              <div className={styles.modalActions}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={pwSaving}>
                  {pwSaving && <Loader2 size={16} className={styles.spinner} />}
                  {pwSaving ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
