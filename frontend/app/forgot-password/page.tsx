import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import ForgotPasswordPage from '@/components/account/ForgotPasswordPage'

export const metadata: Metadata = {
  title: 'Forgot Password | Soil Goddess',
  description: 'Reset your Soil Goddess account password.',
}

export default function ForgotPasswordRoute() {
  return (
    <>
      <Header />
      <ForgotPasswordPage />
      <Footer />
      <FloatingActions />
    </>
  )
}
