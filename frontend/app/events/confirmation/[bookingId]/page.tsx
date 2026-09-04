import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import BookingConfirmation from '@/components/events/BookingConfirmation'

export const metadata: Metadata = {
  title: 'Booking Confirmation | Soil Goddess',
}

export default async function ConfirmationPage({ params }: { params: { bookingId: string } }) {
  return (
    <>
      <Header />
      <BookingConfirmation bookingId={Number(params.bookingId)} />
      <Footer />
      <FloatingActions />
    </>
  )
}