import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './WhatLookingFor.module.css'

import card1Curtains from '@/assets/discovercatimg/card1/curtainsblinds.png'
import card1Furniture from '@/assets/discovercatimg/card1/furniture.png'
import card1HomeFurnishing from '@/assets/discovercatimg/card1/homefurnishing.png'
import card1Kitchen from '@/assets/discovercatimg/card1/kitchendinning.png'

import card2Bakery from '@/assets/discovercatimg/card2/bakery.png'
import card2HomemadeCake from '@/assets/discovercatimg/card2/homemadecake.png'
import card2IceCream from '@/assets/discovercatimg/card2/icecream.png'
import card2Sweet from '@/assets/discovercatimg/card2/sweet.png'

import card3Cook from '@/assets/discovercatimg/card3/cookservices.png'
import card3PatientCare from '@/assets/discovercatimg/card3/paitentcare.png'
import card3SecurityGuard from '@/assets/discovercatimg/card3/securityguard.png'

import card4BookBinding from '@/assets/discovercatimg/card4/bookbiding.png'
import card4Stationery from '@/assets/discovercatimg/card4/stationaryshop.png'
import card4Xerox from '@/assets/discovercatimg/card4/xerox.png'

const categories = [
  {
    title: 'Home & Furniture',
    subtitle: 'Curtains, furniture, furnishings & kitchen',
    slug: 'home-furniture',
    tag: 'Home',
    images: [card1Curtains, card1Furniture, card1HomeFurnishing, card1Kitchen],
  },
  {
    title: 'Cakes, Bakery & Sweets',
    subtitle: 'Bakery items, homemade cakes, ice cream & sweets',
    slug: 'cakes-bakery-sweets',
    tag: 'Bakery',
    images: [card2Bakery, card2HomemadeCake, card2IceCream, card2Sweet],
  },
  {
    title: 'Domestic Help & Care',
    subtitle: 'Cook services, patient care & security guards',
    slug: 'domestic-help-care',
    tag: 'Services',
    images: [card3Cook, card3PatientCare, card3SecurityGuard],
  },
  {
    title: 'Books, Stationery & Office',
    subtitle: 'Book binding, stationery shop & xerox services',
    slug: 'books-stationery-office',
    tag: 'Office',
    images: [card4BookBinding, card4Stationery, card4Xerox],
  },
]

function CarouselCard({ item }) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef(null)
  const total = item.images.length

  const goTo = useCallback((idx) => {
    setCurrent(idx)
  }, [])

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total)
  }, [total])

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total)
  }, [total])

  useEffect(() => {
    if (isPaused) return
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total)
    }, 3000)
    return () => clearInterval(intervalRef.current)
  }, [isPaused, total])

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.carouselViewport}>
        <div
          className={styles.carouselTrack}
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {item.images.map((img, idx) => (
            <div key={idx} className={styles.carouselSlide}>
              <img src={img} alt={`${item.title} ${idx + 1}`} className={styles.carouselImg} loading="lazy" />
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button className={`${styles.carouselArrow} ${styles.arrowLeft}`} onClick={goPrev} type="button" aria-label="Previous image">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className={`${styles.carouselArrow} ${styles.arrowRight}`} onClick={goNext} type="button" aria-label="Next image">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className={styles.dots}>
          {item.images.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.dot} ${idx === current ? styles.dotActive : ''}`}
              onClick={() => goTo(idx)}
              type="button"
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function WhatLookingFor() {
  const navigate = useNavigate()

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>DISCOVER POPULAR CATEGORIES</span>
          <h2 className={styles.heading}>What are you looking for?</h2>
        </div>
        <Link to="/categories" className={styles.viewAllBtn}>
          <span>View All Categories</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      <div className={styles.grid}>
        {categories.map((item) => (
          <div key={item.slug} className={styles.card}>
            <Link to={`/category/${item.slug}`} className={styles.cardLink}>
              <div className={styles.cardTop}>
                <CarouselCard item={item} />
                <span className={styles.tag}>{item.tag}</span>
              </div>

              <div className={styles.cardBottom}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardSubtitle}>{item.subtitle}</p>
              </div>
            </Link>

            <div className={styles.arrowRow}>
              <span className={styles.exploreText}>Explore Offers</span>
              <motion.button
                type="button"
                className={styles.arrowBtn}
                onClick={() => navigate(`/category/${item.slug}`)}
                initial={{ "--shiny-x": "100%" }}
                whileHover={{ "--shiny-x": "-100%" }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 0.5,
                  type: "spring",
                  stiffness: 20,
                  damping: 15,
                  mass: 2,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </motion.button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
