import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import IntroVideo from '@/components/ui/IntroVideo'
import FloatingActions from '@/components/ui/FloatingActions'
import CartNavigationHandler from '@/components/ui/CartNavigationHandler'
import InstaReels from '@/components/home/InstaReels'
import {
  CollectionBanner,
  ProductGrid,
  OffersStrip,
  LoyaltyBanner,
  VideoPlaceholder,
} from '@/components/home/HomeComponents'

export default function HomePage() {
  return (
    <>
      <CartNavigationHandler />
      <IntroVideo />
      <AnnouncementBar />
      <Header />

      <main>
        <HeroSection />
        <ProductGrid />
        <InstaReels />
        <OffersStrip />
        <LoyaltyBanner />
        <VideoPlaceholder />
      </main>

      <Footer />
      <FloatingActions />
    </>
  )
}

