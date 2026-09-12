import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Store, User, LogOut, Mail, Phone, Shield, Save, Edit2, X, CheckCircle2, AlertCircle } from 'lucide-react'
import ConfirmModal from '@/components/shared/ConfirmModal'
import styles from './BusinessSettings.module.css'

export default function BusinessSettings() {
  const { userProfile, signOut, updateProfile, refreshProfile } = useAuth()
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

  // Keep businessName and phoneNumber in sync when userProfile loads or updates
  useEffect(() => {
    if (userProfile) {
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
    </div>
  )
}