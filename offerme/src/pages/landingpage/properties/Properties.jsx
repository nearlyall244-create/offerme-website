import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { GradientCarousel } from '@/components/ui/gradient-carousel'
import styles from './Properties.module.css'

import flatsImg from '@/assets/middlesectionimg/properties/2.png'
import villasImg from '@/assets/middlesectionimg/properties/3.png'
import plotsImg from '@/assets/middlesectionimg/properties/1.png'
import flatsAltImg from '@/assets/middlesectionimg/properties/5.png'
import plotsAltImg from '@/assets/middlesectionimg/properties/4.png'
import flatsThirdImg from '@/assets/middlesectionimg/properties/6.png'

// Interleaved so flats, villas and plots all stay visible while paging.
const IMAGES = [
  { src: flatsImg, alt: 'Apartment towers with a pool at sunset' },
  { src: villasImg, alt: 'Row of modern villas on a quiet street' },
  { src: plotsImg, alt: 'Laid-out plot land beside a new road' },
  { src: flatsAltImg, alt: 'Gated apartment community at dusk' },
  { src: plotsAltImg, alt: 'Gated plot layout entrance at sunrise' },
  { src: flatsThirdImg, alt: 'Apartment towers and clubhouse' },
]

export default function Properties() {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Properties</h2>
        <Link
          to="/category/real-estate-property"
          className={styles.viewAllLink}
        >
          <span>View All</span>
          <ArrowRight size={16} className={styles.arrowIcon} />
        </Link>
      </div>

      <GradientCarousel
        images={IMAGES}
        label="Featured properties"
        cardAspectRatio={16 / 10}
        initialIndex={0}
        className={styles.carousel}
      />
    </div>
  )
}
