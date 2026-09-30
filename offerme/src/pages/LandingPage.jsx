import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '@/components/navbar/Navbar'
import HeroSection from '@/pages/landingpage/hero/HeroSection'
import Iconsofcat from '@/pages/landingpage/Iconsofcat'
import WhatLookingFor from '@/pages/landingpage/whatlookingfor/WhatLookingFor'
import MiddleSection from '@/pages/landingpage/landingmiddlesection/MiddleSection'
import HyperlocalSection from '@/pages/landingpage/HyperlocalSection'
import WhatWeDo from '@/pages/landingpage/sections/WhatWeDo'
import HowOfferMeWorks from '@/pages/landingpage/sections/HowItWorks'
import GrowYourBusiness from '@/pages/landingpage/sections/GrowYourBusiness'
import HowItWorks from '@/pages/landingpage/HowItWorks/HowItWorks'
import WhyOfferMe from '@/pages/landingpage/sections/WhyOfferMe'
import FinalCTA from '@/pages/landingpage/sections/FinalCTA'
import Footer from '@/pages/footer/Footer'
import WhatsApp from '@/pages/landingpage/whatsapp/WhatsApp'

export default function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }))
    }
  }, [location.hash])

  return (
    <div>
      <Navbar />
      <main>
        <HeroSection />
        <Iconsofcat />
        <WhatLookingFor />
        <MiddleSection />
        <HyperlocalSection />
        <WhatWeDo />
        <HowOfferMeWorks />
        <GrowYourBusiness />
        <HowItWorks />
        <WhyOfferMe />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsApp />
    </div>
  )
}
