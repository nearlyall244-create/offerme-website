import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import styles from './MiddleSection.module.css'

import flatImg from '@/assets/middlesectionimg/flat.png'
import villasImg from '@/assets/middlesectionimg/Villas.png'
import plotImg from '@/assets/middlesectionimg/plot.png'
import eventPlannerImg from '@/assets/middlesectionimg/event planner.png'
import kalyanamandapamImg from '@/assets/middlesectionimg/kalyanamandapam.png'
import partyhallImg from '@/assets/middlesectionimg/partyhall.png'
import carRentalImg from '@/assets/middlesectionimg/Carrental.png'
import carServiceImg from '@/assets/middlesectionimg/carservice.png'
import bikeServiceImg from '@/assets/middlesectionimg/Bikeservice.png'

const PROPERTY_TYPES = [
  {
    id: 'flats',
    title: 'Flats',
    image: flatImg,
    count: '140+ Properties',
  },
  {
    id: 'villas',
    title: 'Villas',
    image: villasImg,
    count: '55+ Luxury Homes',
  },
  {
    id: 'plots',
    title: 'Plots',
    image: plotImg,
    count: '80+ Land Layouts',
  },
]

const EVENT_VENUE_TYPES = [
  {
    id: 'event-planner',
    title: 'Event Planner',
    image: eventPlannerImg,
    count: '85+ Planners',
  },
  {
    id: 'kalyana-mandapams',
    title: 'Kalyana Mandapams',
    image: kalyanamandapamImg,
    count: '120+ Mandapams',
  },
  {
    id: 'party-halls',
    title: 'Party Halls',
    image: partyhallImg,
    count: '95+ Venues',
  },
]

const AUTOMOTIVE_TYPES = [
  {
    id: 'car-rentals',
    title: 'Car Rental',
    image: carRentalImg,
    count: '60+ Vehicles',
  },
  {
    id: 'car-service',
    title: 'Car Service',
    image: carServiceImg,
    count: '45+ Services',
  },
  {
    id: 'bike-service',
    title: 'Bike Service',
    image: bikeServiceImg,
    count: '35+ Services',

  },
]

export default function MiddleSection() {
  return (
    <section className={styles.sectionWrapper} aria-label="Featured Properties and Venues">
      <div className={styles.container}>
        {/* 1st Card: Properties */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Properties </h2>
            <Link
              to="/category/real-estate-property"
              className={styles.viewAllLink}
            >
              <span>View All</span>
              <ArrowRight size={16} className={styles.arrowIcon} />
            </Link>
          </div>

          <div className={styles.propertyGrid}>
            {PROPERTY_TYPES.map((prop) => (
              <Link
                key={prop.id}
                to={`/category/real-estate-property?type=${prop.id}`}
                className={styles.propertyCard}
              >
                <div className={styles.imageContainer}>
                  <img
                    src={prop.image}
                    alt={prop.title}
                    className={styles.propertyImg}
                    loading="lazy"
                  />
                  <div className={styles.imageOverlay} />
                  <span className={styles.countBadge}>{prop.count}</span>
                </div>
                <h3 className={styles.propertyTypeTitle}>{prop.title}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* 2nd Card: Event & Celebration Venues */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Event & Celebration Venues</h2>
            <Link
              to="/categories?search=event-venues"
              className={styles.viewAllLink}
            >
              <span>View All</span>
              <ArrowRight size={16} className={styles.arrowIcon} />
            </Link>
          </div>

          <div className={styles.propertyGrid}>
            {EVENT_VENUE_TYPES.map((venue) => (
              <Link
                key={venue.id}
                to={`/categories?type=${venue.id}`}
                className={styles.propertyCard}
              >
                <div className={styles.imageContainer}>
                  <img
                    src={venue.image}
                    alt={venue.title}
                    className={styles.propertyImg}
                    loading="lazy"
                  />
                  <div className={styles.imageOverlay} />
                  <span className={styles.countBadge}>{venue.count}</span>
                </div>
                <h3 className={styles.propertyTypeTitle}>{venue.title}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* 3rd Card: Automotive & Transport */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Automotive & Transport</h2>
            <Link
              to="/category/automotive-transport"
              className={styles.viewAllLink}
            >
              <span>View All</span>
              <ArrowRight size={16} className={styles.arrowIcon} />
            </Link>
          </div>

          <div className={styles.propertyGrid}>
            {AUTOMOTIVE_TYPES.map((auto) => (
              <Link
                key={auto.id}
                to={`/category/automotive-transport?type=${auto.id}`}
                className={styles.propertyCard}
              >
                <div className={styles.imageContainer}>
                  <img
                    src={auto.image}
                    alt={auto.title}
                    className={styles.propertyImg}
                    loading="lazy"
                  />
                  <div className={styles.imageOverlay} />
                  <span className={styles.countBadge}>{auto.count}</span>
                </div>
                <h3 className={styles.propertyTypeTitle}>{auto.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
