import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import shopperImg from '@/assets/shopper_banner.jpg'
import styles from './HerosecBelow.module.css'

const PROMO_SLIDES = [
  {
    id: 1,
    titleTop: 'Flash Deals &',
    titleHighlight: 'Big Discounts!',
    description: 'Save up to 50% on food, shopping & trusted home services',
    badge: 'Verified Daily Deals 🔥',
    ctaText: 'View All Deals',
    ctaLink: '/categories',
    image: shopperImg,
  },
  {
    id: 2,
    titleTop: 'Shop Local',
    titleHighlight: 'Save More!',
    description: 'Exclusive offers from your favorite neighborhood shops',
    badge: 'Local Shops Happier You! ❤️',
    ctaText: 'Explore Offers',
    ctaLink: '/categories',
    image: shopperImg,
  },
  {
    id: 3,
    titleTop: 'Discover Local',
    titleHighlight: 'Top Rated Spots!',
    description: 'Over 5,000+ verified businesses with genuine customer reviews',
    badge: '100% Genuine Stores 🛡️',
    ctaText: 'Browse Top Stores',
    ctaLink: '/categories',
    image: shopperImg,
  },
]

const CATEGORIES = [
  {
    id: 'real-estate',
    title: 'Real Estate',
    slug: 'real-estate-property',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'education',
    title: 'Education',
    slug: 'education-training',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'industrial-b2b',
    title: 'Industrial B2B',
    slug: 'industrial-b2b',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'home-services',
    title: 'Home Services',
    slug: 'home-repair-maintenance',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    slug: 'healthcare-medical',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&auto=format&fit=crop&q=80',
  },
]

export default function HerosecBelowcard() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isHovered])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length)
  }, [])

  const slide = PROMO_SLIDES[currentSlide]

  return (
    <section className={styles.herosecBelow}>
      <div className={styles.herosecBelowInner}>
        {/* Left: Promotional Banner */}
        <div
          className={styles.promoCard}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            type="button"
            className={`${styles.promoArrow} ${styles.promoArrowPrev}`}
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            className={`${styles.promoArrow} ${styles.promoArrowNext}`}
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>

          <div className={styles.promoContent}>
            <div className={styles.promoBadge}>{slide.badge}</div>

            <h2 className={styles.promoTitle}>
              {slide.titleTop}{' '}
              <span className={styles.promoHighlight}>{slide.titleHighlight}</span>
            </h2>

            <p className={styles.promoDescription}>{slide.description}</p>

            <Link to={slide.ctaLink} className={styles.promoButton}>
              <span>{slide.ctaText}</span>
              <ArrowRight size={16} />
            </Link>

            <div className={styles.promoDots}>
              {PROMO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.promoDot} ${currentSlide === idx ? styles.promoDotActive : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className={styles.promoImageWrapper}>
            <img
              src={slide.image}
              alt={slide.titleTop}
              className={styles.promoImage}
              loading="eager"
            />
          </div>
        </div>

        {/* Right: Category Cards */}
        <div className={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className={styles.categoryCard}
            >
              <div className={styles.categoryHeader}>
                <h3 className={styles.categoryTitle}>{cat.title}</h3>
              </div>
              <div className={styles.categoryImageWrapper}>
                <img
                  src={cat.image}
                  alt={cat.title}
                  className={styles.categoryImage}
                  loading="lazy"
                />
                <div className={styles.categoryAction} aria-hidden="true">
                  <ArrowRight size={14} strokeWidth={2.5} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
