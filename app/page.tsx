import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import IntroVideo from '@/components/ui/IntroVideo'
import CouponPopup from '@/components/ui/CouponPopup'
import FloatingActions from '@/components/ui/FloatingActions'
import CartNavigationHandler from '@/components/ui/CartNavigationHandler'
import {
  CollectionBanner,
  FeaturesStrip,
  SubcatBar,
  CategoryGrid,
  ProductGrid,
  SpotlightSection,
  HeritageSection,
  LookbookSection,
  OffersStrip,
  LoyaltyBanner,
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
        <FeaturesStrip />
        <SubcatBar />
        <CategoryGrid />
        <ProductGrid />
        <SpotlightSection />
        <HeritageSection />
        <LookbookSection />
        <OffersStrip />
        <LoyaltyBanner />
      </main>

      <Footer />
      <FloatingActions />
      <CouponPopup />
    </>
  )
}
