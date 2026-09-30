import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Store, User, LogOut, Mail, Phone, Shield, Save, Edit2, X, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import ConfirmModal from '@/components/shared/ConfirmModal'
import styles from './BusinessSettings.module.css'

const DELETION_STATUS_LABELS = {
  no_request: 'No Request',
  requested: 'Requested',
  rejected: 'Rejected',
  approved: 'Approved',
}

export default function BusinessSettings() {
  const { user, userProfile, signOut, updateProfile, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('business')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit mode state for Business Information
  const [isEditing, setIsEditing] = useState(false)
  const [businessName, setBusinessName] = useState(
    userProfile?.owner_name || userProfile?.shop_name || userProfile?.businessName || userProfile?.displayName || ''
  )
  const [phoneNumber, setPhoneNumber] = useState(
    userProfile?.phone || userProfile?.phoneNumber || userProfile?.businessPhoneNumber || ''
  )
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })

  // Account deletion request state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletionReason, setDeletionReason] = useState('')
  const [submittingRequest, setSubmittingRequest] = useState(false)
  const [deletionNotice, setDeletionNotice] = useState({ type: '', text: '' })

  const deletionStatus = userProfile?.deletion_status || 'no_request'

  useEffect(() => {
    // Refresh once on mount so the latest deletion-request status is shown.
    refreshProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (userProfile) {
      requestAnimationFrame(() => {
        const currentName =
          userProfile?.owner_name ||
          userProfile?.shop_name ||
          userProfile?.businessName ||
          userProfile?.displayName ||
          ''
        setBusinessName(currentName)
        const currentPhone =
          userProfile?.phone ||
          userProfile?.phoneNumber ||
          userProfile?.businessPhoneNumber ||
          ''
        setPhoneNumber(currentPhone)
      })
    }
  }, [userProfile])

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Store },
    { id: 'account', label: 'Account', icon: User },
  ]

  const handleBusinessSave = async () => {
    if (!businessName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid business name.' })
      return
    }

    setSaving(true)
    setStatusMessage({ type: '', text: '' })

    try {
      await updateProfile({
        name: businessName.trim(),
        owner_name: businessName.trim(),
        shop_name: businessName.trim(),
        businessName: businessName.trim(),
        phone: phoneNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        businessPhoneNumber: phoneNumber.trim(),
      })
      await refreshProfile()
      setIsEditing(false)
      setStatusMessage({ type: 'success', text: 'Business details updated successfully!' })
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update business details.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    const originalName =
      userProfile?.owner_name ||
      userProfile?.shop_name ||
      userProfile?.businessName ||
      userProfile?.displayName ||
      ''
    const originalPhone =
      userProfile?.phone ||
      userProfile?.phoneNumber ||
      userProfile?.businessPhoneNumber ||
      ''
    setBusinessName(originalName)
    setPhoneNumber(originalPhone)
    setIsEditing(false)
    setStatusMessage({ type: '', text: '' })
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 500)
    } catch (err) {
      console.error('Logout error:', err)
      window.location.href = '/auth/login'
    }
  }

  const openDeletionModal = () => {
    if (deletionStatus === 'requested') return
    setDeletionReason('')
    setDeletionNotice({ type: '', text: '' })
    setShowDeleteModal(true)
  }

  const submitDeletionRequest = async () => {
    const message = deletionReason.trim()
    if (!message) return

    setSubmittingRequest(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/auth?action=deletion-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to submit request')

      setShowDeleteModal(false)
      setDeletionReason('')
      setDeletionNotice({ type: 'success', text: 'Your account deletion request has been submitted to the admin.' })
      await refreshProfile()
    } catch (err) {
      setDeletionNotice({ type: 'error', text: err.message || 'Failed to submit request.' })
      setShowDeleteModal(false)
    } finally {
      setSubmittingRequest(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Business Settings</h1>
        <p className={styles.subtitle}>Manage your business preferences and account details</p>
      </div>

      <div className={styles.container}>
        <nav className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.content}>
          {activeTab === 'business' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Business Information</h2>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="businessName">
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  className={`${styles.input} ${!isEditing ? styles.disabledInput : ''}`}
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value)
                    if (statusMessage.text) setStatusMessage({ type: '', text: '' })
                  }}
                  placeholder="Enter your business name"
                  disabled={!isEditing}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="phoneNumber">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  className={`${styles.input} ${!isEditing ? styles.disabledInput : ''}`}
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value)
                    if (statusMessage.text) setStatusMessage({ type: '', text: '' })
                  }}
                  placeholder="Enter phone number (e.g. +91 98765 43210)"
                  disabled={!isEditing}
                />
              </div>

              {statusMessage.text && (
                <div
                  className={`${styles.statusMessage} ${
                    statusMessage.type === 'success' ? styles.successMessage : styles.errorMessage
                  }`}
                >
                  {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div className={styles.actions}>
                {!isEditing ? (
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => {
                      setIsEditing(true)
                      setStatusMessage({ type: '', text: '' })
                    }}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                ) : (
                  <div className={styles.editActions}>
                    <button
                      type="button"
                      className={styles.saveBtn}
                      onClick={handleBusinessSave}
                      disabled={saving || !businessName.trim()}
                    >
                      <Save size={16} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Account Details</h2>

              <div className={styles.accountCard}>
                <div className={styles.accountHeader}>
                  <div className={styles.avatar}>
                    <User size={26} />
                  </div>
                  <div>
                    <h3 className={styles.accountName}>
                      {userProfile?.name || userProfile?.owner_name || userProfile?.displayName || 'Business Owner'}
                    </h3>
                    <span className={styles.accountRole}>Business Account</span>
                  </div>
                </div>

                <div className={styles.accountDetailsList}>
                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>
                      <Mail size={16} />
                      <span>Email Address</span>
                    </div>
                    <span className={styles.detailValue}>{userProfile?.email || 'N/A'}</span>
                  </div>

                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>
                      <Phone size={16} />
                      <span>Phone Number</span>
                    </div>
                    <span className={styles.detailValue}>
                      {userProfile?.phone || userProfile?.phoneNumber || userProfile?.businessPhoneNumber || 'Not provided'}
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>
                      <Shield size={16} />
                      <span>Account Status</span>
                    </div>
                    <span className={styles.statusBadge}>Active</span>
                  </div>
                </div>
              </div>

              {/* Account Actions / Logout Section */}
              <div className={styles.dangerZone}>
                <div className={styles.dangerHeader}>
                  <h3 className={styles.dangerTitle}>Sign Out</h3>
                  <p className={styles.dangerDesc}>
                    Log out of your business owner session on this device.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.logoutBtn}
                  onClick={() => setShowLogoutModal(true)}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>

              {/* Account Deletion Request */}
              <div className={styles.dangerZone}>
                <div className={styles.dangerHeader}>
                  <h3 className={styles.dangerTitle}>Request Account Deletion</h3>
                  <p className={styles.dangerDesc}>
                    Submit a request to delete your business account. The request will be reviewed by the admin before any action is taken.
                  </p>
                  <div className={styles.deletionStatusRow}>
                    <span className={styles.deletionStatusLabel}>Status:</span>
                    <span className={`${styles.deletionBadge} ${styles[`deletionBadge_${deletionStatus}`] || ''}`}>
                      {DELETION_STATUS_LABELS[deletionStatus] || 'No Request'}
                    </span>
                  </div>
                  {deletionStatus === 'requested' && (
                    <p className={styles.deletionUnderReview}>
                      Your account deletion request is already under review.
                    </p>
                  )}
                  {deletionNotice.text && (
                    <div
                      className={`${styles.statusMessage} ${
                        deletionNotice.type === 'error' ? styles.errorMessage : styles.successMessage
                      }`}
                    >
                      {deletionNotice.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                      <span>{deletionNotice.text}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.logoutBtn}
                  onClick={openDeletionModal}
                  disabled={deletionStatus === 'requested' || submittingRequest}
                  style={
                    deletionStatus === 'requested'
                      ? { opacity: 0.6, cursor: 'not-allowed', transform: 'none' }
                      : undefined
                  }
                >
                  <Trash2 size={16} />
                  Request Account Deletion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to log out of your business account?"
        confirmLabel="Logout"
        danger
        success={loggingOut}
        successMessage="You have been logged out successfully."
        onConfirm={handleLogout}
        onCancel={() => {
          setShowLogoutModal(false)
          setLoggingOut(false)
        }}
      />

      <ConfirmModal
        open={showDeleteModal}
        title="Request Account Deletion"
        message="Your request will be reviewed by the admin before any action is taken. Please tell us why you want to delete your account."
        confirmLabel="Submit Request"
        cancelLabel="Cancel"
        danger
        confirmDisabled={!deletionReason.trim() || submittingRequest}
        onConfirm={submitDeletionRequest}
        onCancel={() => {
          if (submittingRequest) return
          setShowDeleteModal(false)
          setDeletionReason('')
        }}
      >
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="deletion-reason">
            Reason / Message for Account Deletion
          </label>
          <textarea
            id="deletion-reason"
            className={styles.textarea}
            rows={4}
            maxLength={1000}
            value={deletionReason}
            onChange={(e) => setDeletionReason(e.target.value)}
            placeholder="Enter your reason for requesting account deletion..."
          />
        </div>
      </ConfirmModal>
    </div>
  )
}