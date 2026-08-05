import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import { RequireAuth } from '@/components/auth/AuthContext'
import AccountDashboard from '@/components/account/AccountDashboard'

export const metadata: Metadata = {
  title: 'My Account | Soil Goddess',
  description: 'Manage your Soil Goddess profile, addresses, orders, and wishlist.',
}

export default function AccountRoute() {
  return (
    <>
      <Header />
      <RequireAuth>
        <AccountDashboard />
      </RequireAuth>
      <Footer />
      <FloatingActions />
    </>
  )
}
