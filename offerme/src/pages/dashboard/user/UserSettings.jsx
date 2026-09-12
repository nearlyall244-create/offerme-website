import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { User, Bell, Shield, Trash2, Save, Camera } from 'lucide-react'
import ConfirmModal from '@/components/shared/ConfirmModal'
import styles from './UserSettings.module.css'

export default function UserSettings() {
  const { userProfile, signOut, updateProfile, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [saving, setSaving] = useState(false)

  const [profileData, setProfileData] = useState({
    displayName: userProfile?.displayName || userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || userProfile?.phone_number || '',
  })

  // Sync profile data when userProfile updates
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        displayName: userProfile?.displayName || userProfile?.name || '',
        email: userProfile?.email || '',
        phone: userProfile?.phone || userProfile?.phone_number || '',
      })
    }
  }, [userProfile])

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

  const handleProfileSave = async () => {
    if (!profileData.displayName.trim()) return
    setSaving(true)
    try {
      await updateProfile({
        name: profileData.displayName.trim(),
        displayName: profileData.displayName.trim(),
        phone: profileData.phone,
      })
      await refreshProfile()
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
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
          {activeTab === 'profile' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Profile Information</h2>
              
              <div className={styles.avatarSection}>
                <div className={styles.avatarLarge}>
                  {(userProfile?.displayName || 'U')[0].toUpperCase()}
                </div>
                <button className={styles.changePhotoBtn}>
                  <Camera size={16} />
                  Change Photo
                </button>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Display Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  className={styles.input}
                  value={profileData.email}
                  disabled
                />
                <span className={styles.hint}>Email cannot be changed</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  className={styles.input}
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={handleProfileSave} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

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
                <button className={styles.saveBtn} onClick={handleNotificationSave} disabled={saving}>
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
                <button className={styles.saveBtn} onClick={handleNotificationSave} disabled={saving}>
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
                <h3 className={styles.dangerTitle}>Danger Zone</h3>
                
                <div className={styles.dangerItem}>
                  <div className={styles.dangerInfo}>
                    <span className={styles.dangerLabel}>Sign Out</span>
                    <span className={styles.dangerDesc}>Sign out from your account on this device</span>
                  </div>
                  <button className={styles.logoutBtn} onClick={() => setShowLogoutModal(true)}>
                    Sign Out
                  </button>
                </div>

                <div className={styles.dangerItem}>
                  <div className={styles.dangerInfo}>
                    <span className={styles.dangerLabel}>Delete Account</span>
                    <span className={styles.dangerDesc}>Permanently delete your account and all data</span>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => setShowDeleteModal(true)}>
                    Delete Account
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
        message="This action cannot be undone. All your data will be permanently deleted."
        confirmLabel="Delete Account"
        danger
        onConfirm={() => { window.location.href = '/' }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}