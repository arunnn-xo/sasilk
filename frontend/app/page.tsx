import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import IntroVideo from '@/components/ui/IntroVideo'
import CouponPopup from '@/components/ui/CouponPopup'
import FloatingActions from '@/components/ui/FloatingActions'
import CartNavigationHandler from '@/components/ui/CartNavigationHandler'
import InstaReels from '@/components/home/InstaReels'
import {
  CollectionBanner,
  ProductGrid,
  OffersStrip,
  LoyaltyBanner,
  ArtWaveSection,
} from '@/components/home/HomeComponents'

export default function HomePage() {
  return (
    <>
      <CartNavigationHandler />
      <IntroVideo />
      <Header />

      <main>
        <HeroSection />
        <ProductGrid />
        <InstaReels />
        <OffersStrip />
        <LoyaltyBanner />
        <ArtWaveSection />
      </main>

      <Footer />
      <FloatingActions />
      <CouponPopup />
    </>
  )
}
