import type { Metadata } from 'next'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import TrackOrderPage from '@/components/order/TrackOrderPage'

export const metadata: Metadata = {
  title: 'Track Order | SOIL GODDESS',
  description: 'Track your SOIL GODDESS order with a mobile, email, and order id.',
}

export default function TrackOrderRoute() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <TrackOrderPage />
      <Footer />
      <FloatingActions />
    </>
  )
}
