import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import { RequireAuth } from '@/components/auth/AuthContext'
import OrderDetail from '@/components/account/OrderDetail'

export const metadata: Metadata = {
  title: 'Order Details | Soil Goddess',
  description: 'View your order details and track delivery status.',
}

export default function OrderDetailRoute() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF6EE] px-4 py-8 sm:px-8 sm:py-12 lg:px-16 xl:px-24">
        <RequireAuth>
          <OrderDetail />
        </RequireAuth>
      </main>
      <Footer />
      <FloatingActions />
    </>
  )
}
