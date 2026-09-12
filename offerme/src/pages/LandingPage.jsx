import Navbar from '@/components/navbar/Navbar'
import HeroSection from '@/components/hero/HeroSection'
import Iconsofcat from '@/pages/landingpage/Iconsofcat'
import CategoryGroupCards from '@/components/categories/CategoryGroupCards'
import Landingcards from '@/pages/landingpage/Landingcards'
import HowItWorks from '@/pages/landingpage/HowItWorks/HowItWorks'
import Footer from '@/pages/footer/Footer'

export default function LandingPage() {
  return (
    <div>
      <Navbar />
      <main>
        <HeroSection />
        <Iconsofcat />
        <CategoryGroupCards />
        <Landingcards />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
