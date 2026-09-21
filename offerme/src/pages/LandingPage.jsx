import Navbar from '@/components/navbar/Navbar'
import HeroSection from '@/pages/landingpage/hero/HeroSection'
import Iconsofcat from '@/pages/landingpage/Iconsofcat'
import WhatLookingFor from '@/pages/landingpage/whatlookingfor/WhatLookingFor'
import MiddleSection from '@/pages/landingpage/landingmiddlesection/MiddleSection'
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
        <WhatLookingFor />
        <MiddleSection />
        <Landingcards />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
