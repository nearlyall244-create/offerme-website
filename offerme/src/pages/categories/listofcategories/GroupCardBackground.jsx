import bgStyles from './CategoryCardBackgrounds.module.css'

/**
 * Maps category group IDs to their corresponding background CSS classes.
 * Each group gets a unique, subtle gradient that respects dark/light mode.
 */
const GROUP_BG_MAP = {
  'food-drinks': bgStyles.foodDrinks,
  'grocery-supermarkets': bgStyles.grocerySupermarkets,
  'fashion-clothing': bgStyles.fashionClothing,
  'beauty-personal': bgStyles.beautyPersonal,
  'electronics-mobiles': bgStyles.electronicsMobiles,
  'home-furniture': bgStyles.homeFurniture,
  'health-wellness': bgStyles.healthWellness,
  'automotive': bgStyles.automotive,
  'education': bgStyles.education,
  'professional-services': bgStyles.professionalServices,
  'travel': bgStyles.travel,
  'events-entertainment': bgStyles.eventsEntertainment,
  'home-services': bgStyles.homeServices,
  'pet-services': bgStyles.petServices,
  'cloth-services': bgStyles.clothServices,
}

/**
 * Returns the CSS class name for a category group's background.
 * Falls back to undefined if no mapping exists (card gets default styling).
 */
export function getGroupBgClass(groupId) {
  return GROUP_BG_MAP[groupId]
}

/**
 * Renders the background overlay for a category group card.
 * Place this inside .groupCard as the first child.
 *
 * Usage:
 *   <div className={styles.groupCard}>
 *     <GroupCardBackground groupId={group.id} />
 *     ... rest of card content
 *   </div>
 */
export default function GroupCardBackground({ groupId }) {
  const bgClass = GROUP_BG_MAP[groupId]
  if (!bgClass) return null

  return <div className={`${bgStyles.cardBg} ${bgClass}`} aria-hidden="true" />
}
