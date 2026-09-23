import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Bell, Shield, Trash2, Save, LogOut } from 'lucide-react'
import ConfirmModal from '@/components/shared/ConfirmModal'
import styles from './UserSettings.module.css'

export default function UserSettings() {
  const { userProfile, signOut, getToken } = useAuth()
  const [activeTab, setActiveTab] = useState('notifications')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    offerUpdates: true,
    weeklyDigest: false,
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
  })

  const handleNotificationSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteEmail.trim().toLowerCase() !== userProfile?.email?.toLowerCase()) {
      setDeleteError('Email does not match your account email.')
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      const token = await getToken()
      const res = await fetch('/api/auth?action=delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete account.')
      await signOut()
      window.location.href = '/'
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account.')
      setDeleting(false)
    }
  }

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'account', label: 'Account', icon: Trash2 },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences</p>
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
          {activeTab === 'notifications' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Notification Preferences</h2>

              <div className={styles.toggleGroup}>
                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Email Alerts</span>
                    <span className={styles.toggleDesc}>Receive notifications via email</span>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={notifications.emailAlerts}
                      onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Push Notifications</span>
                    <span className={styles.toggleDesc}>Receive push notifications in browser</span>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Offer Updates</span>
                    <span className={styles.toggleDesc}>Get notified about new offers near you</span>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={notifications.offerUpdates}
                      onChange={(e) => setNotifications({ ...notifications, offerUpdates: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Weekly Digest</span>
                    <span className={styles.toggleDesc}>Receive weekly summary of activity</span>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={notifications.weeklyDigest}
                      onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.actions}>
                <button className={`${styles.saveBtn} ${styles.btn}`} onClick={handleNotificationSave} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Security Settings</h2>

              <div className={styles.toggleGroup}>
                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Two-Factor Authentication</span>
                    <span className={styles.toggleDesc}>Add extra security to your account</span>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={security.twoFactor}
                      onChange={(e) => setSecurity({ ...security, twoFactor: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Session Timeout</label>
                <select
                  className={styles.select}
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div className={styles.actions}>
                <button className={`${styles.saveBtn} ${styles.btn}`} onClick={handleNotificationSave} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Account Management</h2>

              <div className={styles.dangerZone}>
                <div className={styles.dangerItem}>
                  <div className={styles.dangerInfo}>
                    <span className={styles.dangerLabel}>Sign Out</span>
                    <span className={styles.dangerDesc}>Sign out from your account on this device</span>
                  </div>
                  <button className={`${styles.logoutBtn} ${styles.btn}`} onClick={() => setShowLogoutModal(true)}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>

                <div className={styles.dangerItem}>
                  <div className={styles.dangerInfo}>
                    <span className={styles.dangerLabel}>Delete Account</span>
                    <span className={styles.dangerDesc}>Permanently delete your account and all data. This action cannot be undone.</span>
                  </div>
                  <button
                    className={`${styles.deleteBtn} ${styles.btn}`}
                    onClick={() => { setShowDeleteModal(true); setDeleteEmail(''); setDeleteError('') }}
                  >
                    <Trash2 size={16} /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        danger
        success={loggingOut}
        successMessage="You have been logged out successfully."
        onConfirm={() => { setLoggingOut(true); setTimeout(() => { signOut(); window.location.href = '/' }, 2000) }}
        onCancel={() => { setShowLogoutModal(false); setLoggingOut(false) }}
      />

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Account"
        message="This action cannot be undone. All your data will be permanently deleted. Type your email address below to confirm."
        confirmLabel="Delete Account"
        danger
        confirmDisabled={deleteEmail.trim().toLowerCase() !== (userProfile?.email || '').toLowerCase()}
        onConfirm={handleDeleteAccount}
        onCancel={() => { setShowDeleteModal(false); setDeleteEmail(''); setDeleteError('') }}
      >
        <div className={styles.field}>
          <label className={styles.label} htmlFor="delete-email">Type your email to confirm</label>
          <input
            id="delete-email"
            type="email"
            className={styles.input}
            placeholder={userProfile?.email || ''}
            value={deleteEmail}
            onChange={(e) => { setDeleteEmail(e.target.value); setDeleteError('') }}
            autoComplete="off"
            autoFocus
          />
          {deleteError && <span className={styles.deleteError}>{deleteError}</span>}
        </div>
      </ConfirmModal>
    </div>
  )
}
