import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import CouponPopup from '@/components/ui/CouponPopup'
import {
  CollectionBanner,
  FeaturesStrip,
  SubcatBar,
  CategoryGrid,
  ProductGrid,
  SpotlightSection,
  OffersStrip,
  LoyaltyBanner,
} from '@/components/home/HomeComponents'

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main>
        <HeroSection />
        <FeaturesStrip />
        <SubcatBar />
        <CategoryGrid />
        <ProductGrid />
        <SpotlightSection />
        <OffersStrip />
        <LoyaltyBanner />
      </main>

      <Footer />
      <CouponPopup />
    </>
  )
}
