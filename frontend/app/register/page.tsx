import type { Metadata } from 'next'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import SignupPage from '@/components/account/SignupPage'

export const metadata: Metadata = {
  title: 'Create Account | SOIL GODDESS',
  description: 'Create your SOIL GODDESS account to save addresses, track orders, and manage your wishlist.',
}

export default function RegisterRoute() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <SignupPage />
      <Footer />
      <FloatingActions />
    </>
  )
}
