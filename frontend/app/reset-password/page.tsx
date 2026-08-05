import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import ResetPasswordPage from '@/components/account/ResetPasswordPage'

export const metadata: Metadata = {
  title: 'Reset Password | Soil Goddess',
  description: 'Set a new password for your Soil Goddess account.',
}

export default function ResetPasswordRoute() {
  return (
    <>
      <Header />
      <ResetPasswordPage />
      <Footer />
      <FloatingActions />
    </>
  )
}
