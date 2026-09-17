import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Tag, PhoneCall, Star } from 'lucide-react'
import shopperImg from '@/assets/shopper_banner.jpg'
import styles from './HerosecBelow.module.css'

const BANNER_SLIDES = [
  {
    id: 1,
    titleTop: 'Shop Local',
    titleHighlight: 'Save More!',
    subtitle: 'Exclusive offers from your favorite neighborhood shops',
    badge: 'Local Shops Happier You! ❤️',
    ctaText: 'Explore Offers',
    ctaLink: '/categories',
    image: shopperImg,
  },
  {
    id: 2,
    titleTop: 'Flash Deals &',
    titleHighlight: 'Big Discounts!',
    subtitle: 'Save up to 50% on food, shopping & trusted home services',
    badge: 'Verified Daily Deals 🔥',
    ctaText: 'View All Deals',
    ctaLink: '/categories',
    image: shopperImg,
  },
  {
    id: 3,
    titleTop: 'Discover Local',
    titleHighlight: 'Top Rated Spots!',
    subtitle: 'Over 5,000+ verified businesses with genuine customer reviews',
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
    bgColor: '#052B58',
    darkBg: '#052B58',
    titleColor: '#FE6902',
    accentColor: '#FE6902',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'education',
    title: 'Education',
    slug: 'education-training',
    bgColor: '#052B58',
    darkBg: '#052B58',
    titleColor: '#FE6902',
    accentColor: '#FE6902',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'industrial-b2b',
    title: 'Industrial B2B',
    slug: 'industrial-b2b',
    bgColor: '#052B58',
    darkBg: '#052B58',
    titleColor: '#FE6902',
    accentColor: '#FE6902',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&fit=crop&q=80',
  },

  {
    id: 'home-services',
    title: 'Home Services',
    slug: 'home-repair-maintenance',
    bgColor: '#052B58',
    darkBg: '#052B58',
    titleColor: '#FE6902',
    accentColor: '#FE6902',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    slug: 'healthcare-medical',
    bgColor: '#052B58',
    darkBg: '#052B58',
    titleColor: '#FE6902',
    accentColor: '#FE6902',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&auto=format&fit=crop&q=80',
  }

]

const FEATURES = [
  {
    icon: <ShieldCheck size={22} className="text-emerald-500" />,
    title: '5,000+ Verified Businesses',
    desc: 'Authenticated local shops & services',
    bg: 'rgba(16, 185, 129, 0.1)',
  },
  {
    icon: <Tag size={22} className="text-blue-500" />,
    title: 'Exclusive Local Deals',
    desc: 'Save up to 50% on everyday needs',
    bg: 'rgba(59, 130, 246, 0.1)',
  },
  {
    icon: <PhoneCall size={22} className="text-amber-500" />,
    title: 'Direct Connect',
    desc: 'Call, WhatsApp & navigate in 1 click',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  {
    icon: <Star size={22} className="text-purple-500" />,
    title: '100% Genuine Reviews',
    desc: 'Ratings by authentic local shoppers',
    bg: 'rgba(168, 85, 247, 0.1)',
  },
]

export default function HerosecBelowcard() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const scrollContainerRef = useRef(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
    }
  }

  useEffect(() => {
    checkScroll()
    const el = scrollContainerRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
    }
    window.addEventListener('resize', checkScroll)
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  // Auto rotate banner slides every 5 seconds
  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isHovered])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)
  }

  const scrollCategories = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      setTimeout(checkScroll, 350)
    }
  }

  const slide = BANNER_SLIDES[currentSlide]

  return (
    <div className={styles.wrapper}>
      {/* ── Main Discovery Grid (Banner Left + Category Cards Right) ── */}
      <div className={styles.discoveryGrid}>
        {/* Left Promotional Banner Carousel */}
        <div
          className={styles.bannerCard}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            type="button"
            className={`${styles.bannerNavBtn} ${styles.bannerNavPrev}`}
            onClick={prevSlide}
            aria-label="Previous promotional slide"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            className={`${styles.bannerNavBtn} ${styles.bannerNavNext}`}
            onClick={nextSlide}
            aria-label="Next promotional slide"
          >
            <ChevronRight size={18} />
          </button>

          <div className={styles.bannerSlider}>
            <div className={styles.slideInner}>
              <div className={styles.bannerContent}>
                <h2 className={styles.bannerTitle}>
                  {slide.titleTop}{' '}
                  <span className={styles.bannerTitleHighlight}>{slide.titleHighlight}</span>
                </h2>
                <p className={styles.bannerSubtitle}>{slide.subtitle}</p>
                <Link to={slide.ctaLink} className={styles.bannerCta}>
                  <span>{slide.ctaText}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className={styles.bannerImageWrap}>
                <img
                  src={slide.image}
                  alt={slide.titleTop}
                  className={styles.bannerShopperImg}
                  loading="eager"
                />
                <div className={styles.bannerSticker}>
                  <span>{slide.badge}</span>
                </div>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className={styles.bannerDots}>
              {BANNER_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.dot} ${currentSlide === idx ? styles.activeDot : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Category Cards Carousel / Row */}
        <div className={styles.categorySection}>
          {canScrollLeft && (
            <button
              type="button"
              className={`${styles.catScrollBtn} ${styles.catScrollLeft}`}
              onClick={() => scrollCategories('left')}
              aria-label="Scroll categories left"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <div className={styles.categoryScrollWrap} ref={scrollContainerRef}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={styles.categoryCard}
                style={{ backgroundColor: cat.bgColor }}
              >
                {/* Top: Category Title */}
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle} style={{ color: cat.titleColor }}>
                    {cat.title}
                  </h3>
                </div>

                {/* Bottom: Large full-width rectangular image occupying lower portion of card */}
                <div className={styles.cardImageContainer}>
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className={styles.cardImage}
                    loading="lazy"
                  />
                  {/* Bottom-right: Small circular arrow button positioned over the image */}
                  <div
                    className={styles.cardActionCircle}
                    style={{ backgroundColor: cat.accentColor }}
                    aria-hidden="true"
                  >
                    <ArrowRight size={12} strokeWidth={2.5} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {canScrollRight && (
            <button
              type="button"
              className={`${styles.catScrollBtn} ${styles.catScrollRight}`}
              onClick={() => scrollCategories('right')}
              aria-label="Scroll categories right"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>


      {/* ── Feature Strip Below ── */}
      <div className={styles.featureStrip}>
        {FEATURES.map((feat, index) => (
          <div key={index} className={styles.featureItem}>
            <div className={styles.featureIconWrap} style={{ backgroundColor: feat.bg }}>
              {feat.icon}
            </div>
            <div>
              <h4 className={styles.featureTitle}>{feat.title}</h4>
              <p className={styles.featureDesc}>{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
