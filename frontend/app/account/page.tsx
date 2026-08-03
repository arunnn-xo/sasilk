import type { Metadata } from 'next'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import AccountDashboard from '@/components/account/AccountDashboard'

export const metadata: Metadata = {
  title: 'My Account | SOIL GODDESS',
  description: 'Manage your SOIL GODDESS profile, addresses, orders, and wishlist.',
}

export default function AccountRoute() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <AccountDashboard />
      <Footer />
      <FloatingActions />
    </>
  )
}
