import type { Metadata } from 'next'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import ShopPage from '@/components/shop/ShopPage'

export const metadata: Metadata = {
  title: 'Sale | SOIL GODDESS',
  description: 'Shop SOIL GODDESS sale products with curated sarees, festive wear, daily wear, and accessories.',
}

export default function SaleRoute() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <ShopPage
        title="Sale"
        eyebrow="Limited Offers"
        description="Discover selected SOIL GODDESS pieces with special pricing while keeping the same premium weave, comfort, and finish."
        saleOnly
      />
      <Footer />
      <FloatingActions />
    </>
  )
}
