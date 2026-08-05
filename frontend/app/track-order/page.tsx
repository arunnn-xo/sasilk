import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import TrackOrderPage from '@/components/order/TrackOrderPage'

export const metadata: Metadata = {
  title: 'Track Order | Soil Goddess',
  description: 'Track your Soil Goddess order with a mobile, email, and order id.',
}

export default function TrackOrderRoute() {
  return (
    <>
      <Header />
      <TrackOrderPage />
      <Footer />
      <FloatingActions />
    </>
  )
}
