import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import LoginPage from '@/components/account/LoginPage'

export const metadata: Metadata = {
  title: 'Sign In | Soil Goddess',
  description: 'Sign in to your Soil Goddess account to manage orders, addresses, and wishlist.',
}

export default function LoginRoute() {
  return (
    <>
      <Header />
      <LoginPage />
      <Footer />
      <FloatingActions />
    </>
  )
}
