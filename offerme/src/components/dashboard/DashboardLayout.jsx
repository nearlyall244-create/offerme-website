import { Outlet } from 'react-router-dom'
import DashboardNavbar from './DashboardNavbar'
import DashboardSidebar from './DashboardSidebar'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout({ role = 'user' }) {
  return (
    <div className={styles.layout}>
      <DashboardNavbar role={role} />
      <div className={styles.body}>
        <DashboardSidebar role={role} />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
