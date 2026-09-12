import { useAuth } from '@/contexts/AuthContext'
import styles from '@/pages/dashboard/Profile.module.css'

export default function UserProfile() {
  const { userProfile, updateProfile, refreshProfile } = useAuth()

  const handleSave = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const name = formData.get('name')
    await updateProfile({
      displayName: name,
      name: name,
      phone: formData.get('phone'),
      bio: formData.get('bio'),
    })
    if (refreshProfile) await refreshProfile()
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Profile</h1>
      <form onSubmit={handleSave} className={styles.form}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {(userProfile?.displayName || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h2 className={styles.name}>{userProfile?.displayName}</h2>
            <p className={styles.email}>{userProfile?.email}</p>
            <span className={styles.role}>{userProfile?.role}</span>
          </div>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" defaultValue={userProfile?.displayName || ''} />
          </div>
          <div className={styles.field}>
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" defaultValue={userProfile?.phone || ''} />
          </div>
          <div className={styles.field}>
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" name="bio" rows={3} defaultValue={userProfile?.bio || ''} />
          </div>
        </div>

        <button type="submit" className={styles.saveBtn}>Save Changes</button>
      </form>
    </div>
  )
}
