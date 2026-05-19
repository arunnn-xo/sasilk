import type { Metadata } from 'next'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import SingleProductPage from '@/components/product/SingleProductPage'

export const metadata: Metadata = {
  title: 'Soft Silk Woven Zari Saree | SOIL GODDESS',
  description: 'Shop the Soft Silk Woven Zari Saree with half blouse from SOIL GODDESS by Sri Akila.',
}

export default function ProductRoute() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <SingleProductPage />
      <Footer />
      <FloatingActions />
    </>
  )
}
