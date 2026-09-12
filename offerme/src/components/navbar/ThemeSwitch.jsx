import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import styles from './ThemeSwitch.module.css'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  return (
    localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  )
}

export default function ThemeSwitch({ className = '' }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className={`${styles.switchBtn} ${className}`}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <Sun
        className={`${styles.icon} ${styles.sun} ${
          theme === 'light' ? styles.iconVisible : styles.iconHidden
        }`}
      />
      <Moon
        className={`${styles.icon} ${styles.moon} ${
          theme === 'dark' ? styles.iconVisible : styles.iconHidden
        }`}
      />
    </button>
  )
}
