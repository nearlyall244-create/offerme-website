import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { User, LogOut, Mail, Shield, Save, Edit2, X, CheckCircle2, AlertCircle } from 'lucide-react'
import ConfirmModal from '@/components/shared/ConfirmModal'
import styles from './AdminSettings.module.css'

export default function AdminSettings() {
  const { userProfile, signOut, updateProfile, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit mode state for Admin Profile Name
  const [isEditing, setIsEditing] = useState(false)
  const [adminName, setAdminName] = useState(
    userProfile?.name || userProfile?.displayName || userProfile?.owner_name || ''
  )
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })

  // Keep adminName in sync when userProfile loads or updates
  useEffect(() => {
    if (userProfile) {
      const currentName =
        userProfile?.name ||
        userProfile?.displayName ||
        userProfile?.owner_name ||
        ''
      setAdminName(currentName)
    }
  }, [userProfile])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
  ]

  const handleProfileSave = async () => {
    if (!adminName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid name.' })
      return
    }

    setSaving(true)
    setStatusMessage({ type: '', text: '' })

    try {
      if (updateProfile) {
        await updateProfile({
          name: adminName.trim(),
          displayName: adminName.trim(),
        })
      }
      if (refreshProfile) {
        await refreshProfile()
      }
      setIsEditing(false)
      setStatusMessage({ type: 'success', text: 'Profile name updated successfully!' })
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile name.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    const originalName =
      userProfile?.name ||
      userProfile?.displayName ||
      userProfile?.owner_name ||
      ''
    setAdminName(originalName)
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
        <h1 className={styles.title}>Admin Settings</h1>
        <p className={styles.subtitle}>Manage your profile and administrator account details</p>
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
          {/* ── 1. Profile Tab ───────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Profile Details</h2>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="adminName">
                  Name
                </label>
                <input
                  id="adminName"
                  type="text"
                  className={`${styles.input} ${!isEditing ? styles.disabledInput : ''}`}
                  value={adminName}
                  onChange={(e) => {
                    setAdminName(e.target.value)
                    if (statusMessage.text) setStatusMessage({ type: '', text: '' })
                  }}
                  placeholder="Enter your name"
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
                      onClick={handleProfileSave}
                      disabled={saving || !adminName.trim()}
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

          {/* ── 2. Account Tab ───────────────────────────────── */}
          {activeTab === 'account' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Account Details</h2>

              <div className={styles.accountCard}>
                <div className={styles.accountHeader}>
                  <div className={styles.avatar}>
                    <Shield size={26} />
                  </div>
                  <div>
                    <h3 className={styles.accountName}>
                      {userProfile?.name || userProfile?.displayName || 'Administrator'}
                    </h3>
                    <span className={styles.accountRole}>Administrator Account</span>
                  </div>
                </div>

                <div className={styles.accountDetailsList}>
                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>
                      <Mail size={16} />
                      <span>Email Address</span>
                    </div>
                    <span className={styles.detailValue}>{userProfile?.email || 'admin@offerme.in'}</span>
                  </div>

                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>
                      <Shield size={16} />
                      <span>Role & Permissions</span>
                    </div>
                    <span className={styles.detailValue}>Super Admin</span>
                  </div>

                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>
                      <CheckCircle2 size={16} />
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
                    Log out of your administrator session on this device.
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
        message="Are you sure you want to log out of your admin account?"
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