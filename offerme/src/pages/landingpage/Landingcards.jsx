import { useRef, useState, useEffect, useCallback } from 'react'
import styles from './Landingcards.module.css'

const CARDS = [
  { label: 'Restaurants', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80' },
  { label: 'Beauty Salon', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80' },
  { label: 'Gift Shops', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80' },
  { label: 'Mobile Shops', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80' },
  { label: 'Supermarkets', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80' },
  { label: 'Tea Shops', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
  { label: 'Automotive', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80' },
]

export default function Landingcards() {
  const ringRef = useRef(null)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ startX: 0, startRotation: 0, lastX: 0, lastTime: 0, velocity: 0 })
  const animRef = useRef(null)
  const autoRef = useRef(null)

  const count = CARDS.length
  const angleStep = 360 / count

  const startAutoRotate = useCallback(() => {
    stopAutoRotate()
    autoRef.current = setInterval(() => {
      setRotation((prev) => prev + 0.3)
    }, 16)
  }, [])

  const stopAutoRotate = () => {
    if (autoRef.current) {
      clearInterval(autoRef.current)
      autoRef.current = null
    }
  }

  useEffect(() => {
    startAutoRotate()
    return () => stopAutoRotate()
  }, [startAutoRotate])

  const handlePointerDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    stopAutoRotate()
    if (animRef.current) cancelAnimationFrame(animRef.current)

    dragRef.current = {
      startX: e.clientX,
      startRotation: rotation,
      lastX: e.clientX,
      lastTime: Date.now(),
      velocity: 0,
    }

    ringRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    const dx = e.clientX - dragRef.current.startX
    const now = Date.now()
    const dt = now - dragRef.current.lastTime

    if (dt > 0) {
      dragRef.current.velocity = (e.clientX - dragRef.current.lastX) / dt
    }

    dragRef.current.lastX = e.clientX
    dragRef.current.lastTime = now

    setRotation(dragRef.current.startRotation + dx * 0.5)
  }

  const handlePointerUp = () => {
    setIsDragging(false)

    let velocity = dragRef.current.velocity * 50

    const decay = () => {
      velocity *= 0.95
      if (Math.abs(velocity) < 0.01) {
        startAutoRotate()
        return
      }
      setRotation((prev) => prev + velocity * 0.16)
      animRef.current = requestAnimationFrame(decay)
    }

    animRef.current = requestAnimationFrame(decay)
  }

  useEffect(() => {
    const el = ringRef.current
    if (!el) return

    const onWheel = (e) => {
      e.preventDefault()
      stopAutoRotate()
      if (animRef.current) cancelAnimationFrame(animRef.current)
      setRotation((prev) => prev + e.deltaX * 0.3)

      clearTimeout(onWheel._timer)
      onWheel._timer = setTimeout(() => startAutoRotate(), 2000)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [startAutoRotate])

  return (
    <section className={styles.landingCards}>
      <div className={styles.watermark}>
        <svg className={styles.watermarkSvg} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="50" width="140" height="130" rx="12" stroke="currentColor" strokeWidth="6" />
          <path d="M70 50V30C70 18.954 78.954 10 90 10H110C121.046 10 130 18.954 130 30V50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <circle cx="100" cy="110" r="8" fill="currentColor" />
          <path d="M85 125L100 140L115 125" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className={styles.container}>
        <div className={styles.textContent}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>🛍️</span>
            Hyperlocal Highlight
          </div>
          <h2 className={styles.heading}>
            Small Shops. <span className={styles.headingAccent}>Big Value.</span>
          </h2>
          <p className={styles.description}>
            From your neighborhood tea shop to the small mobile repair stand around the corner — discover every local business in one place.
          </p>
        </div>

        <div className={styles.galleryWrap}>
          <div
            className={styles.stage}
            ref={ringRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div
              className={styles.ring}
              style={{ transform: `rotateY(${rotation}deg)` }}
            >
              {CARDS.map((card, i) => {
                const angle = i * angleStep
                return (
                  <div
                    key={card.label}
                    className={styles.card}
                    style={{ transform: `rotateY(${angle}deg) translateZ(300px)` }}
                  >
                    <img src={card.image} alt={card.label} className={styles.cardImage} loading="lazy" />
                    <div className={styles.cardLabel}>{card.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
